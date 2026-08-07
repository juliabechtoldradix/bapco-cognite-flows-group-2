import type { InAppNotification } from '../contracts';

export function getUnreadCount(
  notifications: ReadonlyArray<InAppNotification>,
  readNotificationIds: ReadonlyArray<string>
): number {
  const readIds = new Set(readNotificationIds);
  let unread = 0;
  for (const notification of notifications) {
    if (!readIds.has(notification.id)) {
      unread += 1;
    }
  }
  return unread;
}

export function isNotificationRead(
  notificationId: string,
  readNotificationIds: ReadonlyArray<string>
): boolean {
  return readNotificationIds.includes(notificationId);
}
