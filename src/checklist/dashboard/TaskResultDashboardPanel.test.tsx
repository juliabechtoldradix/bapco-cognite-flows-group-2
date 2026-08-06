import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { TaskResultDashboardPanel } from './TaskResultDashboardPanel';
import { TaskResultDashboardViewModelProvider } from './TaskResultDashboardViewModelProvider';

describe(TaskResultDashboardPanel.name, () => {
  it('shows loading then OK/Not OK breakdown and series from fixture data', async () => {
    render(
      <TaskResultDashboardViewModelProvider checklistService={new FixtureChecklistService()}>
        <TaskResultDashboardPanel periodPreset="7d" onPeriodChange={vi.fn()} />
      </TaskResultDashboardViewModelProvider>
    );

    expect(screen.getByTestId('task-result-dashboard-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('outcome-breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('task-result-series')).toBeInTheDocument();
    });

    expect(screen.getByTestId('task-result-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('task-result-dashboard-stub')).not.toBeInTheDocument();
    expect(screen.getByTestId('breakdown-count-ok')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown-count-notOk')).toBeInTheDocument();
  });

  it('calls onPeriodChange when the period control changes', async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();

    render(
      <TaskResultDashboardViewModelProvider checklistService={new FixtureChecklistService()}>
        <TaskResultDashboardPanel periodPreset="7d" onPeriodChange={onPeriodChange} />
      </TaskResultDashboardViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('outcome-breakdown')).toBeInTheDocument());

    await user.click(screen.getByTestId('period-preset-30d'));
    expect(onPeriodChange).toHaveBeenCalledWith('30d');
  });

  it('shows error alert when the service fails', async () => {
    const failingService: ChecklistService = {
      getKpis: vi.fn(async () => ({
        toDo: 0,
        ongoing: 0,
        done: 0,
        overdue: 0,
        withNotOk: 0,
      })),
      searchChecklists: vi.fn(async () => []),
      getResults: vi.fn(async () => []),
      getTaskResultDashboard: vi.fn(() => Promise.reject(new Error('Dashboard failed'))),
    };

    render(
      <TaskResultDashboardViewModelProvider checklistService={failingService}>
        <TaskResultDashboardPanel periodPreset="7d" onPeriodChange={vi.fn()} />
      </TaskResultDashboardViewModelProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-result-dashboard-error')).toBeInTheDocument();
    });

    expect(
      within(screen.getByTestId('task-result-dashboard-error')).getByText('Dashboard failed')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('outcome-breakdown')).not.toBeInTheDocument();
  });

  it('shows empty state when there are no results for the period', async () => {
    const emptyService: ChecklistService = {
      getKpis: vi.fn(async () => ({
        toDo: 0,
        ongoing: 0,
        done: 0,
        overdue: 0,
        withNotOk: 0,
      })),
      searchChecklists: vi.fn(async () => []),
      getResults: vi.fn(async () => []),
      getTaskResultDashboard: vi.fn(async () => ({
        period: '24h' as const,
        breakdown: { ok: 0, notOk: 0, other: 0 },
        series: [],
      })),
    };

    render(
      <TaskResultDashboardViewModelProvider checklistService={emptyService}>
        <TaskResultDashboardPanel periodPreset="24h" onPeriodChange={vi.fn()} />
      </TaskResultDashboardViewModelProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-result-dashboard-empty')).toBeInTheDocument();
    });

    expect(screen.getByText('No task results for this period')).toBeInTheDocument();
    expect(screen.queryByTestId('outcome-breakdown')).not.toBeInTheDocument();
  });

  it('does not call syncInternalState', async () => {
    const syncInternalState = vi.fn();
    Object.defineProperty(window, 'syncInternalState', {
      value: syncInternalState,
      configurable: true,
    });

    render(
      <TaskResultDashboardViewModelProvider checklistService={new FixtureChecklistService()}>
        <TaskResultDashboardPanel periodPreset="7d" onPeriodChange={vi.fn()} />
      </TaskResultDashboardViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('task-result-dashboard')).toBeInTheDocument());
    expect(syncInternalState).not.toHaveBeenCalled();
  });
});
