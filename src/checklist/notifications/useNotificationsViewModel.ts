import { useContext, useEffect, useRef } from 'react';

import type { InAppNotification } from '../contracts';

import { getErrorMessage } from './getErrorMessage';
import { getUnreadCount } from './getUnreadCount';
import type { NotificationsLoadState } from './NotificationsUiState';
import { NotificationsViewModelContext } from './notificationsViewModelContext';

export type NotificationsViewModelInput = {
  readNotificationIds: string[];
  onMarkRead: (notificationId: string) => void;
  onSelectNotification?: (notification: InAppNotification) => void;
};

export type NotificationsViewModel = {
  notifications: InAppNotification[];
  loadState: NotificationsLoadState;
  error: string | null;
  isEmpty: boolean;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  unreadCount: number;
  markRead: (notificationId: string) => void;
  selectNotification: (notification: InAppNotification) => void;
};

export function useNotificationsViewModel(
  input: NotificationsViewModelInput
): NotificationsViewModel {
  const { checklistService, useNotificationsUiState } = useContext(NotificationsViewModelContext);
  const {
    notifications,
    loadState,
    error,
    isOpen,
    setLoading,
    setSuccess,
    setError,
    setOpen,
  } = useNotificationsUiState();

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading();

    void checklistService
      .listInAppNotifications()
      .then((next) => {
        if (requestIdRef.current === requestId) {
          setSuccess(next);
        }
      })
      .catch((err: unknown) => {
        if (requestIdRef.current === requestId) {
          setError(getErrorMessage(err, 'Failed to load notifications'));
        }
      });
  }, [checklistService, setLoading, setSuccess, setError]);

  return {
    notifications,
    loadState,
    error,
    isEmpty: loadState === 'success' && notifications.length === 0,
    isOpen,
    setOpen,
    unreadCount: getUnreadCount(notifications, input.readNotificationIds),
    markRead: (notificationId: string) => {
      input.onMarkRead(notificationId);
    },
    selectNotification: (notification: InAppNotification) => {
      input.onMarkRead(notification.id);
      input.onSelectNotification?.(notification);
    },
  };
}
