import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationsBell } from './NotificationsBell';

describe(NotificationsBell.name, () => {
  it('renders the Day-0 stub label', () => {
    render(
      <NotificationsBell readNotificationIds={[]} onMarkRead={vi.fn()} />
    );

    expect(screen.getByTestId('notifications-bell-stub')).toHaveTextContent(
      'Notifications stub — Dev B'
    );
  });
});
