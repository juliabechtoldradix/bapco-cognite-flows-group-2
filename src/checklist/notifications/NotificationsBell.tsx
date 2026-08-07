import { Button } from '@cognite/aura/components/button';

import type { InAppNotification } from '../contracts';

export type NotificationsBellProps = {
  /** Host-synced ids already marked read */
  readNotificationIds: string[];
  onMarkRead: (notificationId: string) => void;
  /** Optional: when user selects a row (nice-to-have; may be unused in MVP) */
  onSelectNotification?: (notification: InAppNotification) => void;
};

/**
 * Day-0 stub — Dev B replaces with real bell + popup.
 * Props API is frozen; do not rename or remove required props.
 */
export function NotificationsBell({
  readNotificationIds,
  onMarkRead,
  onSelectNotification,
}: NotificationsBellProps) {
  void readNotificationIds;
  void onMarkRead;
  void onSelectNotification;

  return (
    <Button type="button" variant="ghost" data-testid="notifications-bell-stub">
      Notifications stub — Dev B
    </Button>
  );
}
