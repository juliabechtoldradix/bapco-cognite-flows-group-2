import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TaskResultDashboardPanel } from './TaskResultDashboardPanel';

describe(TaskResultDashboardPanel.name, () => {
  it('renders the Day-0 stub with the selected period', () => {
    render(<TaskResultDashboardPanel periodPreset="7d" onPeriodChange={vi.fn()} />);
    expect(screen.getByTestId('task-result-dashboard-stub')).toBeInTheDocument();
    expect(screen.getByText(/Dashboard stub — Dev B/)).toBeInTheDocument();
    expect(screen.getByText(/period: 7d/)).toBeInTheDocument();
  });
});
