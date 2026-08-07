import { renderHook, waitFor } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { assert, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChecklistService, InAppNotification } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { NotificationsUiStateProvider } from './NotificationsUiStateProvider';
import {
  NotificationsViewModelContext,
  type NotificationsViewModelContextType,
} from './notificationsViewModelContext';
import { useNotificationsUiState } from './useNotificationsUiState';
import { useNotificationsViewModel } from './useNotificationsViewModel';

const SAMPLE: InAppNotification[] = [
  {
    id: 'notOk:route1',
    trigger: 'notOk',
    title: 'Not OK result on Route 1',
    body: 'Checklist has at least one Not OK task result',
    checklistId: 'route1',
    createdAt: '2026-08-06T12:00:00.000Z',
  },
  {
    id: 'completed:route3',
    trigger: 'completed',
    title: 'Checklist completed: Route 3',
    body: 'Checklist status is Done',
    checklistId: 'route3',
    createdAt: '2026-08-05T08:00:00.000Z',
  },
];

describe(useNotificationsViewModel.name, () => {
  let mockService: ChecklistService;
  let mockContext: NotificationsViewModelContextType;
  let wrapper: ComponentType<{ children: ReactNode }>;

  beforeEach(() => {
    mockService = {
      getKpis: vi.fn(() => {
        assert.fail('getKpis should not be called by notifications view model');
      }),
      searchChecklists: vi.fn(() => {
        assert.fail('searchChecklists should not be called by notifications view model');
      }),
      getResults: vi.fn(() => {
        assert.fail('getResults should not be called by notifications view model');
      }),
      getTaskResultDashboard: vi.fn(() => {
        assert.fail('getTaskResultDashboard should not be called by notifications view model');
      }),
      listInAppNotifications: vi.fn(() => Promise.resolve(SAMPLE)),
    };

    mockContext = {
      checklistService: mockService,
      useNotificationsUiState,
    };

    wrapper = ({ children }) => (
      <NotificationsUiStateProvider>
        <NotificationsViewModelContext.Provider value={mockContext}>
          {children}
        </NotificationsViewModelContext.Provider>
      </NotificationsUiStateProvider>
    );
  });

  it('exposes loading then success state with notifications', async () => {
    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    expect(result.current.loadState).toBe('loading');

    await waitFor(() => {
      expect(result.current.loadState).toBe('success');
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.unreadCount).toBe(2);
    expect(mockService.listInAppNotifications).toHaveBeenCalledTimes(1);
  });

  it('exposes error state without stale success data', async () => {
    vi.mocked(mockService.listInAppNotifications).mockRejectedValueOnce(
      new Error('Notifications boom')
    );

    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loadState).toBe('error');
    });

    expect(result.current.error).toBe('Notifications boom');
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isEmpty).toBe(false);
  });

  it('exposes empty state when the feed has no items', async () => {
    vi.mocked(mockService.listInAppNotifications).mockResolvedValueOnce([]);

    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loadState).toBe('success');
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('reduces unreadCount when readNotificationIds includes items', async () => {
    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: ['notOk:route1'],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));
    expect(result.current.unreadCount).toBe(1);
  });

  it('toggles local isOpen via setOpen', async () => {
    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));
    expect(result.current.isOpen).toBe(false);

    result.current.setOpen(true);
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    result.current.setOpen(false);
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('markRead and selectNotification call onMarkRead only', async () => {
    const onMarkRead = vi.fn();
    const onSelectNotification = vi.fn();

    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead,
          onSelectNotification,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));

    result.current.markRead('notOk:route1');
    expect(onMarkRead).toHaveBeenCalledWith('notOk:route1');

    result.current.selectNotification(SAMPLE[0]);
    expect(onMarkRead).toHaveBeenCalledWith('notOk:route1');
    expect(onSelectNotification).toHaveBeenCalledWith(SAMPLE[0]);
  });

  it('works with FixtureChecklistService notifications fixtures', async () => {
    mockContext = {
      checklistService: new FixtureChecklistService(),
      useNotificationsUiState,
    };
    wrapper = ({ children }) => (
      <NotificationsUiStateProvider>
        <NotificationsViewModelContext.Provider value={mockContext}>
          {children}
        </NotificationsViewModelContext.Provider>
      </NotificationsUiStateProvider>
    );

    const { result } = renderHook(
      () =>
        useNotificationsViewModel({
          readNotificationIds: [],
          onMarkRead: vi.fn(),
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loadState).toBe('success'));
    expect(result.current.notifications.some((item) => item.trigger === 'notOk')).toBe(true);
    expect(result.current.notifications.some((item) => item.trigger === 'completed')).toBe(true);
  });
});
