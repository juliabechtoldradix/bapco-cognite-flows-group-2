import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';

import { ChecklistOverviewPanel } from './ChecklistOverviewPanel';
import { ChecklistOverviewViewModelProvider } from './ChecklistOverviewViewModelProvider';

describe(ChecklistOverviewPanel.name, () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders KPI strip and OEC route names after load', async () => {
    render(
      <ChecklistOverviewViewModelProvider checklistService={new FixtureChecklistService()}>
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedId={null}
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    expect(screen.getByTestId('kpi-strip-loading')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-list-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('kpi-strip')).toBeInTheDocument();
      expect(screen.getByTestId('checklist-list')).toBeInTheDocument();
    });

    const kpiStrip = screen.getByTestId('kpi-strip');
    expect(within(kpiStrip).getByText('To Do')).toBeInTheDocument();
    expect(within(kpiStrip).getByText('Ongoing')).toBeInTheDocument();
    expect(within(kpiStrip).getByText('Done')).toBeInTheDocument();
    expect(within(kpiStrip).getByText('Overdue')).toBeInTheDocument();
    expect(within(kpiStrip).getByText('Not OK')).toBeInTheDocument();

    expect(screen.getByText('Route One - IV/Kamyr Digester/Diffuser')).toBeInTheDocument();
    expect(screen.getByText('Route Two - Feed System')).toBeInTheDocument();
    expect(screen.getByText('Route Three - Blow Heat/Stripper/Turpentine')).toBeInTheDocument();
    expect(screen.getByText('Route Four - A Line Screen and Washing')).toBeInTheDocument();
  });

  it('debounces search changes before calling onSearchChange', async () => {
    const pending: Array<() => void> = [];
    const setTimeoutFn = vi.fn((handler: () => void, _timeout: number) => {
      pending.push(handler);
      return pending.length;
    });
    const clearTimeoutFn = vi.fn((id: number) => {
      pending[id - 1] = () => undefined;
    });
    const onSearchChange = vi.fn();

    render(
      <ChecklistOverviewViewModelProvider
        checklistService={new FixtureChecklistService()}
        searchDebounceMs={300}
        setTimeoutFn={setTimeoutFn}
        clearTimeoutFn={clearTimeoutFn}
      >
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={onSearchChange}
          selectedId={null}
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-list')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('checklist-search'), {
      target: { value: 'Feed' },
    });

    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => {
      pending[pending.length - 1]?.();
    });

    expect(onSearchChange).toHaveBeenCalledWith('Feed');
  });

  it('calls onSelectChecklist when a list item is clicked', async () => {
    const user = userEvent.setup();
    const onSelectChecklist = vi.fn();

    render(
      <ChecklistOverviewViewModelProvider checklistService={new FixtureChecklistService()}>
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedId={null}
          onSelectChecklist={onSelectChecklist}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-list')).toBeInTheDocument());

    await user.click(screen.getByTestId('checklist-item-fixture-route2'));
    expect(onSelectChecklist).toHaveBeenCalledWith('fixture-route2');
  });

  it('marks the selected checklist as pressed', async () => {
    render(
      <ChecklistOverviewViewModelProvider checklistService={new FixtureChecklistService()}>
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedId="fixture-route2"
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-list')).toBeInTheDocument());

    expect(screen.getByTestId('checklist-item-fixture-route2')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('checklist-item-fixture-route1')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('shows list error alert when the service fails', async () => {
    const failingService: ChecklistService = {
      getKpis: vi.fn(() =>
        Promise.resolve({ toDo: 0, ongoing: 0, done: 0, overdue: 0, withNotOk: 0 })
      ),
      searchChecklists: vi.fn(() => Promise.reject(new Error('Search failed'))),
      getResults: vi.fn(() => Promise.resolve([])),
      getTaskResultDashboard: vi.fn(() =>
        Promise.resolve({
          period: '7d' as const,
          breakdown: { ok: 0, notOk: 0, other: 0 },
          series: [],
        })
      ),
    };

    render(
      <ChecklistOverviewViewModelProvider checklistService={failingService}>
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedId={null}
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('checklist-list-error')).toBeInTheDocument();
    });

    expect(within(screen.getByTestId('checklist-list-error')).getByText('Search failed')).toBeInTheDocument();
    expect(screen.queryByTestId('checklist-list')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no matches', async () => {
    render(
      <ChecklistOverviewViewModelProvider checklistService={new FixtureChecklistService()}>
        <ChecklistOverviewPanel
          searchQuery="zzz-no-match"
          onSearchChange={vi.fn()}
          selectedId={null}
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('checklist-list-empty')).toBeInTheDocument();
    });

    expect(screen.getByText('No checklists matched')).toBeInTheDocument();
  });

  it('does not call syncInternalState', async () => {
    const syncInternalState = vi.fn();
    Object.defineProperty(window, 'syncInternalState', {
      value: syncInternalState,
      configurable: true,
    });

    render(
      <ChecklistOverviewViewModelProvider checklistService={new FixtureChecklistService()}>
        <ChecklistOverviewPanel
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedId={null}
          onSelectChecklist={vi.fn()}
        />
      </ChecklistOverviewViewModelProvider>
    );

    await waitFor(() => expect(screen.getByTestId('checklist-overview')).toBeInTheDocument());
    expect(syncInternalState).not.toHaveBeenCalled();
  });
});
