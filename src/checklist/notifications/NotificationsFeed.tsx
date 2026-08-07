import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Badge } from '@cognite/aura/components/badge';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';
import { Loader } from '@cognite/aura/components/loader';

import { cn } from '../../lib/utils';
import type { InAppNotification, InAppNotificationTrigger } from '../contracts';

import { isNotificationRead } from './getUnreadCount';
import type { NotificationsLoadState } from './NotificationsUiState';

export type NotificationsFeedProps = {
  notifications: InAppNotification[];
  readNotificationIds: string[];
  loadState: NotificationsLoadState;
  error: string | null;
  isEmpty: boolean;
  onSelect: (notification: InAppNotification) => void;
};

function triggerBadgeLabel(trigger: InAppNotificationTrigger): string {
  return trigger === 'notOk' ? 'Not OK' : 'Completed';
}

function triggerBadgeVariant(
  trigger: InAppNotificationTrigger
): 'error' | 'success' {
  return trigger === 'notOk' ? 'error' : 'success';
}

export function NotificationsFeed({
  notifications,
  readNotificationIds,
  loadState,
  error,
  isEmpty,
  onSelect,
}: NotificationsFeedProps) {
  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div
        className="inline-flex items-center gap-3 text-muted-foreground"
        data-testid="notifications-feed-loading"
        aria-live="polite"
      >
        <Loader size={20} />
        <span>Loading notifications...</span>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <Alert variant="error" data-testid="notifications-feed-error">
        <AlertDescription>{error ?? 'Failed to load notifications'}</AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState variant="compact" type="no-results" data-testid="notifications-feed-empty">
        <EmptyStateTitle as="h3">No notifications</EmptyStateTitle>
        <EmptyStateDescription>
          You are up to date. Not OK results and completed checklists will appear here.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <ul
      className="flex max-h-80 flex-col gap-2 overflow-y-auto"
      role="list"
      aria-label="Notifications"
      data-testid="notifications-feed"
    >
      {notifications.map((notification) => {
        const isRead = isNotificationRead(notification.id, readNotificationIds);
        return (
          <li key={notification.id}>
            <button
              type="button"
              data-testid={`notification-row-${notification.id}`}
              data-read={isRead ? 'true' : 'false'}
              aria-label={notification.title}
              onClick={() => {
                onSelect(notification);
              }}
              className={cn(
                'flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors',
                isRead
                  ? 'border-border bg-background text-muted-foreground'
                  : 'border-border-emphasized bg-muted-background text-foreground'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('text-sm', isRead ? 'font-normal' : 'font-medium')}>
                  {notification.title}
                </span>
                <Badge
                  variant={triggerBadgeVariant(notification.trigger)}
                  data-testid={`notification-trigger-${notification.id}`}
                >
                  {triggerBadgeLabel(notification.trigger)}
                </Badge>
              </div>
              {notification.body ? (
                <span className="text-xs text-secondary-foreground">{notification.body}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
