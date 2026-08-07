import type { HostAppAPI } from '@cognite/app-sdk';
import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import { CogniteClient } from '@cognite/sdk';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { INSTANCE_SPACE } from '../contracts';
import type { ChecklistInstancesClient } from '../data/CdfChecklistService';
import { CdfChecklistService } from '../data/CdfChecklistService';

import { ChecklistPage } from './ChecklistPage';

type SdkDeps = NonNullable<ComponentProps<typeof CogniteSdkProvider>['deps']>;

describe('ChecklistPage CDF wiring', () => {
  it('uses CdfChecklistService against the Cognite client when no override is provided', async () => {
    const user = userEvent.setup();
    const instances = makeInstancesClient();
    const getKpis = vi.spyOn(CdfChecklistService.prototype, 'getKpis');
    const searchChecklists = vi.spyOn(CdfChecklistService.prototype, 'searchChecklists');
    const getResults = vi.spyOn(CdfChecklistService.prototype, 'getResults');

    render(
      <CogniteSdkProvider deps={makeSdkDeps(instances)}>
        <ChecklistPage
          api={{ syncInternalState: vi.fn(() => Promise.resolve(true)) }}
          initialState={JSON.stringify({
            searchQuery: '',
            selectedChecklistId: 'c1',
          })}
        />
      </CogniteSdkProvider>
    );

    await waitFor(() => expect(getKpis).toHaveBeenCalled());
    await waitFor(() => expect(searchChecklists).toHaveBeenCalled());
    await waitFor(() => expect(getResults).toHaveBeenCalledWith('c1'));
    await waitFor(() => expect(screen.getByTestId('kpi-toDo')).toHaveTextContent('1'));
    await waitFor(() =>
      expect(screen.getAllByText('Route One - IV/Kamyr Digester/Diffuser').length).toBeGreaterThan(0)
    );
    const sectionTrigger = await screen.findByTestId('quickview-section-trigger-7th Floor');
    await user.click(sectionTrigger);
    await waitFor(() => expect(screen.getByText('General Condition')).toBeInTheDocument());

    getKpis.mockRestore();
    searchChecklists.mockRestore();
    getResults.mockRestore();
  });
});


function makeInstancesClient(): ChecklistInstancesClient {
  const checklist = {
    space: INSTANCE_SPACE,
    externalId: 'c1',
    properties: {
      cdf_apm: {
        'Checklist/v7': {
          title: 'Route One - IV/Kamyr Digester/Diffuser',
          status: 'Ready',
          endTime: null,
        },
      },
    },
  };

  const item = {
    space: INSTANCE_SPACE,
    externalId: 'task-1',
    properties: {
      cdf_apm: {
        'ChecklistItem/v7': {
          title: 'General Condition',
          status: 'OK',
          order: 2,
          labels: ['zone:7th Floor', 'equipment:Diffuser Scraper'],
        },
      },
    },
  };

  return {
    list: vi.fn(async () => ({ items: [checklist] })),
    search: vi.fn(async () => ({ items: [checklist] })),
    query: vi.fn(async () => ({
      items: {
        itemEdges: [
          {
            space: INSTANCE_SPACE,
            externalId: 'edge:c1:task-1',
            startNode: { space: INSTANCE_SPACE, externalId: 'c1' },
            endNode: { space: INSTANCE_SPACE, externalId: 'task-1' },
          },
        ],
        items: [item],
        measurementEdges: [],
        measurements: [],
      },
    })),
  };
}

function makeSdkDeps(instances: ChecklistInstancesClient): SdkDeps {
  return {
    connectToHostApp: vi.fn<SdkDeps['connectToHostApp']>(() =>
      Promise.resolve({
        api: {
          getProject: vi.fn<HostAppAPI['getProject']>(() => Promise.resolve('radix-dev')),
          getBaseUrl: vi.fn<HostAppAPI['getBaseUrl']>(() => Promise.resolve('https://cognite.test')),
          getAccessToken: vi.fn<HostAppAPI['getAccessToken']>(() => Promise.resolve('test-token')),
          getAppId: vi.fn<HostAppAPI['getAppId']>(() => Promise.resolve('test-app-id')),
        } as Partial<HostAppAPI> as HostAppAPI,
      })
    ),
    createClient: vi.fn<SdkDeps['createClient']>((config) => {
      const client = new CogniteClient(config);
      Object.defineProperty(client, 'instances', {
        value: instances,
        configurable: true,
      });
      return client;
    }),
  };
}
