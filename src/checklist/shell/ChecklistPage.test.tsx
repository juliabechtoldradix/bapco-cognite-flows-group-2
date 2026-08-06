import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const user = userEvent.setup();
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
    const sectionTrigger = await screen.findByTestId('quickview-section-trigger-7th Floor');
    await user.click(sectionTrigger);
    await waitFor(() => expect(screen.getByText('General Condition')).toBeInTheDocument());
    expect(screen.getByTestId('checklist-quickview')).toHaveTextContent('Not OK');
    expect(screen.getByTestId('app-brand-logo')).toBeInTheDocument();
    expect(screen.getByText('Kamyr OEC')).toBeInTheDocument();
    expect(screen.queryByText(/International Paper ·/)).not.toBeInTheDocument();
  });

  it('restores activeView and periodPreset from initialState', async () => {
    render(
      <CogniteSdkProvider deps={makeSdkDeps()}>
        <ChecklistPage
          api={null}
          checklistService={new FixtureChecklistService()}
          initialState={JSON.stringify({
            searchQuery: '',
            selectedChecklistId: null,
            activeView: 'dashboard',
            periodPreset: '30d',
          })}
        />
      </CogniteSdkProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('task-result-dashboard-stub')).toBeInTheDocument()
    );
    expect(screen.getByText(/period: 30d/)).toBeInTheDocument();
    expect(screen.getByText('Task result dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('checklist-overview')).not.toBeInTheDocument();
  });

  it('syncs host state when switching Overview and Dashboard', async () => {
    const user = userEvent.setup();
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <CogniteSdkProvider deps={makeSdkDeps()}>
        <ChecklistPage
          api={{ syncInternalState }}
          checklistService={new FixtureChecklistService()}
          initialState={JSON.stringify({
            searchQuery: '',
            selectedChecklistId: null,
            activeView: 'overview',
            periodPreset: '7d',
          })}
        />
      </CogniteSdkProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-overview')).toBeInTheDocument());
    await user.click(screen.getByTestId('nav-dashboard'));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'dashboard',
          periodPreset: '7d',
        })
      )
    );
    expect(screen.getByTestId('task-result-dashboard-stub')).toBeInTheDocument();

    await user.click(screen.getByTestId('nav-overview'));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
        })
      )
    );
    expect(screen.getByTestId('checklist-overview')).toBeInTheDocument();
  });

  it('keeps overview search and selection host-synced after visiting the dashboard', async () => {
    const user = userEvent.setup();
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <CogniteSdkProvider deps={makeSdkDeps()}>
        <ChecklistPage
          api={{ syncInternalState }}
          checklistService={new FixtureChecklistService()}
          initialState={JSON.stringify({
            searchQuery: 'Feed',
            selectedChecklistId: 'fixture-route2',
            activeView: 'overview',
            periodPreset: '7d',
          })}
        />
      </CogniteSdkProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-search')).toHaveValue('Feed'));
    await user.click(screen.getByTestId('nav-dashboard'));
    await waitFor(() =>
      expect(screen.getByTestId('task-result-dashboard-stub')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('checklist-search')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('nav-overview'));
    await waitFor(() => expect(screen.getByTestId('checklist-search')).toHaveValue('Feed'));
    expect(screen.getByTestId('checklist-item-fixture-route2')).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.clear(screen.getByTestId('checklist-search'));
    await user.type(screen.getByTestId('checklist-search'), 'Digester');
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        expect.stringContaining('"searchQuery":"Digester"')
      )
    );
    expect(syncInternalState).toHaveBeenCalledWith(
      expect.stringContaining('"selectedChecklistId":"fixture-route2"')
    );
    expect(syncInternalState).toHaveBeenCalledWith(
      expect.stringContaining('"activeView":"overview"')
    );
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
