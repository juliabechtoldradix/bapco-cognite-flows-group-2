import type { InAppNotification } from '../contracts';

export type NotificationsLoadState = 'idle' | 'loading' | 'success' | 'error';

export type NotificationsUiState = {
  notifications: InAppNotification[];
  loadState: NotificationsLoadState;
  error: string | null;
  /** Local-only popup open state — not host-synced. */
  isOpen: boolean;
};

export const INITIAL_NOTIFICATIONS_UI_STATE: NotificationsUiState = {
  notifications: [],
  loadState: 'idle',
  error: null,
  isOpen: false,
};

export type NotificationsUiStore = NotificationsUiState & {
  setLoading: () => void;
  setSuccess: (notifications: InAppNotification[]) => void;
  setError: (message: string) => void;
  setOpen: (isOpen: boolean) => void;
};
