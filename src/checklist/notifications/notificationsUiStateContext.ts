import { createContext } from 'react';

import type { NotificationsUiStore } from './NotificationsUiState';

export const NotificationsUiStateContext = createContext<NotificationsUiStore | null>(null);
