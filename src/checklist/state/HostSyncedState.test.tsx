import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HostSyncedStateProvider, useHostSyncedStorage } from './HostSyncedState';

describe(HostSyncedStateProvider.name, () => {
  it('seeds search and selected checklist from initialState', () => {
    render(
      <HostSyncedStateProvider
        api={null}
        initialState={JSON.stringify({
          searchQuery: 'Feed',
          selectedChecklistId: 'fixture-route2',
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    expect(screen.getByTestId('search')).toHaveTextContent('Feed');
    expect(screen.getByTestId('selected')).toHaveTextContent('fixture-route2');
  });

  it('seeds activeView and periodPreset from initialState', () => {
    render(
      <HostSyncedStateProvider
        api={null}
        initialState={JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'dashboard',
          periodPreset: '24h',
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    expect(screen.getByTestId('view')).toHaveTextContent('dashboard');
    expect(screen.getByTestId('period')).toHaveTextContent('24h');
  });


  it('pushes host state when search or selection changes', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <HostSyncedStateProvider api={{ syncInternalState }} initialState={undefined}>
        <Probe />
      </HostSyncedStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'set-search' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: 'Digester',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: [],
        })
      )
    );

    await userEvent.click(screen.getByRole('button', { name: 'set-selected' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: 'Digester',
          selectedChecklistId: 'fixture-route1',
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: [],
        })
      )
    );
  });

  it('keeps search and selection when switching activeView', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <HostSyncedStateProvider
        api={{ syncInternalState }}
        initialState={JSON.stringify({
          searchQuery: 'Feed',
          selectedChecklistId: 'fixture-route2',
          activeView: 'overview',
          periodPreset: '7d',
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    expect(screen.getByTestId('search')).toHaveTextContent('Feed');
    expect(screen.getByTestId('selected')).toHaveTextContent('fixture-route2');

    await userEvent.click(screen.getByRole('button', { name: 'set-view' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: 'Feed',
          selectedChecklistId: 'fixture-route2',
          activeView: 'dashboard',
          periodPreset: '7d',
          readNotificationIds: [],
        })
      )
    );
    expect(screen.getByTestId('search')).toHaveTextContent('Feed');
    expect(screen.getByTestId('selected')).toHaveTextContent('fixture-route2');
  });

  it('pushes host state when activeView or periodPreset changes', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <HostSyncedStateProvider api={{ syncInternalState }} initialState={undefined}>
        <Probe />
      </HostSyncedStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'set-view' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'dashboard',
          periodPreset: '7d',
          readNotificationIds: [],
        })
      )
    );

    await userEvent.click(screen.getByRole('button', { name: 'set-period' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'dashboard',
          periodPreset: '24h',
          readNotificationIds: [],
        })
      )
    );
  });

  it('seeds readNotificationIds from initialState', () => {
    render(
      <HostSyncedStateProvider
        api={null}
        initialState={JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: ['notOk:fixture-route1', 'completed:fixture-route3'],
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    expect(screen.getByTestId('read-ids')).toHaveTextContent(
      'notOk:fixture-route1,completed:fixture-route3'
    );
  });

  it('pushes host state when markNotificationRead appends a new id', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <HostSyncedStateProvider
        api={{ syncInternalState }}
        initialState={JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: ['notOk:fixture-route1'],
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'mark-read' }));
    await waitFor(() =>
      expect(syncInternalState).toHaveBeenCalledWith(
        JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: ['notOk:fixture-route1', 'completed:fixture-route3'],
        })
      )
    );
    expect(screen.getByTestId('read-ids')).toHaveTextContent(
      'notOk:fixture-route1,completed:fixture-route3'
    );
  });

  it('does not sync when markNotificationRead is called for an already-read id', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <HostSyncedStateProvider
        api={{ syncInternalState }}
        initialState={JSON.stringify({
          searchQuery: '',
          selectedChecklistId: null,
          activeView: 'overview',
          periodPreset: '7d',
          readNotificationIds: ['completed:fixture-route3'],
        })}
      >
        <Probe />
      </HostSyncedStateProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'mark-read' }));
    expect(syncInternalState).not.toHaveBeenCalled();
    expect(screen.getByTestId('read-ids')).toHaveTextContent('completed:fixture-route3');
  });
});

function Probe() {
  const storage = useHostSyncedStorage();
  return (
    <div>
      <span data-testid="search">{storage.searchQuery}</span>
      <span data-testid="selected">{storage.selectedChecklistId ?? '(none)'}</span>
      <span data-testid="view">{storage.activeView}</span>
      <span data-testid="period">{storage.periodPreset}</span>
      <span data-testid="read-ids">{storage.readNotificationIds.join(',')}</span>
      <button type="button" onClick={() => storage.setSearchQuery('Digester')}>
        set-search
      </button>
      <button type="button" onClick={() => storage.setSelectedChecklistId('fixture-route1')}>
        set-selected
      </button>
      <button type="button" onClick={() => storage.setActiveView('dashboard')}>
        set-view
      </button>
      <button type="button" onClick={() => storage.setPeriodPreset('24h')}>
        set-period
      </button>
      <button
        type="button"
        onClick={() => storage.markNotificationRead('completed:fixture-route3')}
      >
        mark-read
      </button>
    </div>
  );
}
