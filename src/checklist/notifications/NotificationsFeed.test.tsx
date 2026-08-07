import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { InAppNotification } from '../contracts';

import { NotificationsFeed } from './NotificationsFeed';

const SAMPLE: InAppNotification[] = [
  {
    id: 'notOk:route1',
    trigger: 'notOk',
    title: 'Not OK result on Route 1',
    body: 'Has Not OK',
    checklistId: 'route1',
    createdAt: '2026-08-06T12:00:00.000Z',
  },
];

describe(NotificationsFeed.name, () => {
  it('renders loading state', () => {
    render(
      <NotificationsFeed
        notifications={[]}
        readNotificationIds={[]}
        loadState="loading"
        error={null}
        isEmpty={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('notifications-feed-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <NotificationsFeed
        notifications={[]}
        readNotificationIds={[]}
        loadState="error"
        error="Boom"
        isEmpty={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('notifications-feed-error')).toHaveTextContent('Boom');
  });

  it('renders empty state', () => {
    render(
      <NotificationsFeed
        notifications={[]}
        readNotificationIds={[]}
        loadState="success"
        error={null}
        isEmpty={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('notifications-feed-empty')).toBeInTheDocument();
  });

  it('renders rows and calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <NotificationsFeed
        notifications={SAMPLE}
        readNotificationIds={[]}
        loadState="success"
        error={null}
        isEmpty={false}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId('notifications-feed')).toBeInTheDocument();
    await user.click(screen.getByTestId('notification-row-notOk:route1'));
    expect(onSelect).toHaveBeenCalledWith(SAMPLE[0]);
  });
});
