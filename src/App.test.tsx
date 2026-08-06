import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HostAppAPI, ConnectToHostAppResult } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import type { ComponentProps } from 'react';

import App from './App';

type AppDeps = NonNullable<ComponentProps<typeof App>['deps']>;
type AppApi = Pick<HostAppAPI, 'syncInternalState'>;

function makeApi(): AppApi {
  return {
    syncInternalState: vi.fn<HostAppAPI['syncInternalState']>(() => Promise.resolve(true)),
  };
}

function makeConnectedFn(api: AppApi = makeApi(), initialState?: string) {
  return vi.fn(() => Promise.resolve({ api, initialState }));
}

function makeDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() =>
      Promise.resolve({
        api: {
          getProject: vi.fn<HostAppAPI['getProject']>(() => Promise.resolve('radix-dev')),
          getBaseUrl: vi.fn<HostAppAPI['getBaseUrl']>(() => Promise.resolve('https://cognite.test')),
          getAccessToken: vi.fn<HostAppAPI['getAccessToken']>(() => Promise.resolve('test-token')),
          getAppId: vi.fn<HostAppAPI['getAppId']>(() => Promise.resolve('test-app-id')),
        } as Partial<HostAppAPI> as HostAppAPI,
      })
    ),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function makeLoadingDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(
      () => new Promise<ConnectToHostAppResult>(() => undefined)
    ),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(<App deps={makeLoadingDeps()} connectToHostApp={() => new Promise<never>(() => undefined)} />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('renders the checklist overview shell', async () => {
    render(<App deps={makeDeps()} connectToHostApp={makeConnectedFn()} />);
    await waitFor(() => expect(screen.getByTestId('checklist-page')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Checklist overview' })).toBeInTheDocument();
    expect(screen.getByTestId('checklist-overview')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-quickview')).toBeInTheDocument();
  });

  it('restores host-synced search and selected checklist into the shell', async () => {
    const api = makeApi();
    const initialState = JSON.stringify({
      searchQuery: 'Feed',
      selectedChecklistId: 'fixture-route1',
    });

    render(<App deps={makeDeps()} connectToHostApp={makeConnectedFn(api, initialState)} />);

    await waitFor(() => expect(screen.getByTestId('checklist-search')).toHaveValue('Feed'));
    await waitFor(() =>
      expect(screen.getByText('Route One - IV/Kamyr Digester/Diffuser')).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText('7th Floor')).toBeInTheDocument());
    expect(screen.getByText('Diffuser Scraper')).toBeInTheDocument();
  });
});
