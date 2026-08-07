import { Badge } from '@cognite/aura/components/badge';
import { Button } from '@cognite/aura/components/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverHeaderContent,
  PopoverSlot,
  PopoverTitle,
  PopoverTrigger,
} from '@cognite/aura/components/popover';
import { IconBell } from '@tabler/icons-react';
import type { ComponentType } from 'react';

import type { InAppNotification } from '../contracts';

import { NotificationsFeed } from './NotificationsFeed';
import { NotificationsUiStateProvider } from './NotificationsUiStateProvider';
import { useNotificationsViewModel } from './useNotificationsViewModel';

export type NotificationsBellProps = {
  /** Host-synced ids already marked read */
  readNotificationIds: string[];
  onMarkRead: (notificationId: string) => void;
  /** Optional: when user selects a row (nice-to-have; may be unused in MVP) */
  onSelectNotification?: (notification: InAppNotification) => void;
};

function unreadBadgeLabel(count: number): string {
  if (count > 9) {
    return '9+';
  }
  return String(count);
}

function NotificationsBellView({
  readNotificationIds,
  onMarkRead,
  onSelectNotification,
}: NotificationsBellProps) {
  const vm = useNotificationsViewModel({
    readNotificationIds,
    onMarkRead,
    onSelectNotification,
  });

  const ariaLabel =
    vm.unreadCount > 0
      ? `Notifications, ${vm.unreadCount} unread`
      : 'Notifications';

  return (
    <div className="relative" data-testid="notifications-bell-root">
      <Popover open={vm.isOpen} onOpenChange={vm.setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ariaLabel}
              data-testid="notifications-bell"
            />
          }
        >
          <span className="relative inline-flex items-center justify-center">
            <IconBell className="size-5" aria-hidden />
            {vm.unreadCount > 0 ? (
              <Badge
                variant="error"
                size="icon"
                className="absolute -right-1.5 -top-1.5 min-w-4 justify-center px-1 text-[10px] leading-none"
                data-testid="notifications-unread-badge"
              >
                {unreadBadgeLabel(vm.unreadCount)}
              </Badge>
            ) : null}
          </span>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-96 max-w-[min(24rem,calc(100vw-2rem))] p-4"
          data-testid="notifications-popup"
        >
          <PopoverHeader>
            <PopoverHeaderContent>
              <PopoverTitle>Notifications</PopoverTitle>
            </PopoverHeaderContent>
            <PopoverDescription>
              Not OK results and completed checklists from current plant data.
            </PopoverDescription>
          </PopoverHeader>

          <PopoverSlot>
            <NotificationsFeed
              notifications={vm.notifications}
              readNotificationIds={readNotificationIds}
              loadState={vm.loadState}
              error={vm.error}
              isEmpty={vm.isEmpty}
              onSelect={vm.selectNotification}
            />
          </PopoverSlot>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * In-app notifications bell + popup feed.
 * Read markers come from props/callbacks only — this component does not call syncInternalState.
 */
export const NotificationsBell: ComponentType<NotificationsBellProps> = function NotificationsBell(
  props
) {
  return (
    <NotificationsUiStateProvider>
      <NotificationsBellView {...props} />
    </NotificationsUiStateProvider>
  );
};
