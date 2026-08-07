import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChecklistService, InAppNotification } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { NotificationsBell } from './NotificationsBell';
import { NotificationsViewModelProvider } from './NotificationsViewModelProvider';

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

function createService(
  overrides: Partial<ChecklistService> = {}
): ChecklistService {
  return {
    getKpis: vi.fn(async () => ({
      toDo: 0,
      ongoing: 0,
      done: 0,
      overdue: 0,
      withNotOk: 0,
    })),
    searchChecklists: vi.fn(async () => []),
    getResults: vi.fn(async () => []),
    getTaskResultDashboard: vi.fn(async () => ({
      period: '7d' as const,
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    })),
    listInAppNotifications: vi.fn(async () => SAMPLE),
    ...overrides,
  };
}

describe(NotificationsBell.name, () => {
  it('renders the bell control and unread badge from fixture data', async () => {
    render(
      <NotificationsViewModelProvider checklistService={new FixtureChecklistService()}>
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    expect(screen.getByTestId('notifications-bell')).toBeInTheDocument();
    expect(screen.queryByTestId('notifications-bell-stub')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('notifications-unread-badge')).toBeInTheDocument();
    });
  });

  it('opens the popup and shows the notification feed on success', async () => {
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider checklistService={createService()}>
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));

    await waitFor(() => {
      expect(screen.getByTestId('notifications-popup')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-feed')).toBeInTheDocument();
    });

    expect(screen.getByText('Not OK result on Route 1')).toBeInTheDocument();
    expect(screen.getByText('Checklist completed: Route 3')).toBeInTheDocument();
  });

  it('shows loading state inside the open popup while fetching', async () => {
    const user = userEvent.setup();
    let resolveNotifications: ((value: InAppNotification[]) => void) | undefined;
    const pending = new Promise<InAppNotification[]>((resolve) => {
      resolveNotifications = resolve;
    });

    render(
      <NotificationsViewModelProvider
        checklistService={createService({
          listInAppNotifications: vi.fn(() => pending),
        })}
      >
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));

    expect(screen.getByTestId('notifications-feed-loading')).toBeInTheDocument();

    resolveNotifications?.(SAMPLE);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-feed')).toBeInTheDocument();
    });
  });

  it('shows error alert when the service fails', async () => {
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider
        checklistService={createService({
          listInAppNotifications: vi.fn(() => Promise.reject(new Error('Feed failed'))),
        })}
      >
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));

    await waitFor(() => {
      expect(screen.getByTestId('notifications-feed-error')).toBeInTheDocument();
    });

    expect(
      within(screen.getByTestId('notifications-feed-error')).getByText('Feed failed')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('notifications-feed')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no notifications', async () => {
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider
        checklistService={createService({
          listInAppNotifications: vi.fn(async () => []),
        })}
      >
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));

    await waitFor(() => {
      expect(screen.getByTestId('notifications-feed-empty')).toBeInTheDocument();
    });

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.queryByTestId('notifications-unread-badge')).not.toBeInTheDocument();
  });

  it('closes the popup when the bell is clicked again', async () => {
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider checklistService={createService()}>
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));
    await waitFor(() => expect(screen.getByTestId('notifications-popup')).toBeInTheDocument());

    await user.click(screen.getByTestId('notifications-bell'));
    await waitFor(() => {
      expect(screen.queryByTestId('notifications-popup')).not.toBeInTheDocument();
    });
  });

  it('calls onMarkRead when a notification row is selected', async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onSelectNotification = vi.fn();

    render(
      <NotificationsViewModelProvider checklistService={createService()}>
        <NotificationsBell
          readNotificationIds={[]}
          onMarkRead={onMarkRead}
          onSelectNotification={onSelectNotification}
        />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));
    await waitFor(() => expect(screen.getByTestId('notifications-feed')).toBeInTheDocument());

    await user.click(screen.getByTestId('notification-row-notOk:route1'));

    expect(onMarkRead).toHaveBeenCalledWith('notOk:route1');
    expect(onSelectNotification).toHaveBeenCalledWith(SAMPLE[0]);
  });

  it('marks rows as read via readNotificationIds and hides badge when all read', async () => {
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider checklistService={createService()}>
        <NotificationsBell
          readNotificationIds={['notOk:route1', 'completed:route3']}
          onMarkRead={vi.fn()}
        />
      </NotificationsViewModelProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('notifications-unread-badge')).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId('notifications-bell'));
    await waitFor(() => expect(screen.getByTestId('notifications-feed')).toBeInTheDocument());

    expect(screen.getByTestId('notification-row-notOk:route1')).toHaveAttribute(
      'data-read',
      'true'
    );
  });

  it('does not call syncInternalState', async () => {
    const syncInternalState = vi.fn();
    Object.defineProperty(window, 'syncInternalState', {
      value: syncInternalState,
      configurable: true,
    });
    const user = userEvent.setup();

    render(
      <NotificationsViewModelProvider checklistService={createService()}>
        <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
      </NotificationsViewModelProvider>
    );

    await user.click(screen.getByTestId('notifications-bell'));
    await waitFor(() => expect(screen.getByTestId('notifications-feed')).toBeInTheDocument());
    await user.click(screen.getByTestId('notification-row-notOk:route1'));

    expect(syncInternalState).not.toHaveBeenCalled();
  });
});
