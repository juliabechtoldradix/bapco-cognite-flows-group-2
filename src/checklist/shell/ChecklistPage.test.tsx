import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HostAppAPI } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import { CogniteSdkProvider } from '@cognite/app-sdk/react';
import type { ComponentProps } from 'react';

import { FixtureChecklistService } from '../data/ChecklistService';
import { ChecklistPage } from './ChecklistPage';

type SdkDeps = NonNullable<ComponentProps<typeof CogniteSdkProvider>['deps']>;

describe(ChecklistPage.name, () => {
  it('wires host state into overview and loads quick view results', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <CogniteSdkProvider deps={makeSdkDeps()}>
        <ChecklistPage
          api={{ syncInternalState }}
          checklistService={new FixtureChecklistService()}
          initialState={JSON.stringify({
            searchQuery: 'Digester',
            selectedChecklistId: 'fixture-route1',
          })}
        />
      </CogniteSdkProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-search')).toHaveValue('Digester'));
    await waitFor(() => expect(screen.getByText('General Condition')).toBeInTheDocument());
    expect(screen.getByTestId('checklist-quickview')).toHaveTextContent('Not OK');
    expect(screen.getByTestId('app-brand-logo')).toBeInTheDocument();
    expect(screen.getByText('Kamyr OEC')).toBeInTheDocument();
    expect(screen.queryByText(/International Paper ·/)).not.toBeInTheDocument();
  });
});

function makeSdkDeps(): SdkDeps {
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
    createClient: vi.fn<SdkDeps['createClient']>((config) => new CogniteClient(config)),
  };
}
