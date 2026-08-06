import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';
import { Loader } from '@cognite/aura/components/loader';
import type { ComponentType } from 'react';

import type { TaskResultPeriodPreset } from '../contracts';

import { DashboardUiStateProvider } from './DashboardUiStateProvider';
import { OutcomeBreakdown } from './OutcomeBreakdown';
import { PeriodPresetControl } from './PeriodPresetControl';
import { TaskResultSeries } from './TaskResultSeries';
import { useTaskResultDashboardViewModel } from './useTaskResultDashboardViewModel';

export type TaskResultDashboardPanelProps = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
};

function TaskResultDashboardPanelView({
  periodPreset,
  onPeriodChange,
}: TaskResultDashboardPanelProps) {
  const vm = useTaskResultDashboardViewModel({ periodPreset, onPeriodChange });

  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Task result dashboard"
      data-testid="task-result-dashboard"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Task results</h2>
        <PeriodPresetControl
          periodPreset={vm.periodPreset}
          onPeriodChange={vm.onPeriodChange}
        />
      </div>

      {vm.loadState === 'loading' || vm.loadState === 'idle' ? (
        <div
          className="inline-flex items-center gap-3 text-muted-foreground"
          data-testid="task-result-dashboard-loading"
          aria-live="polite"
        >
          <Loader size={20} />
          <span>Loading task results...</span>
        </div>
      ) : null}

      {vm.loadState === 'error' ? (
        <Alert variant="error" data-testid="task-result-dashboard-error">
          <AlertDescription>
            {vm.error ?? 'Failed to load task result dashboard'}
          </AlertDescription>
        </Alert>
      ) : null}

      {vm.isEmpty ? (
        <EmptyState variant="compact" type="no-results" data-testid="task-result-dashboard-empty">
          <EmptyStateTitle as="h3">No task results for this period</EmptyStateTitle>
          <EmptyStateDescription>
            Try a different period, or check back after more checklist tasks are completed.
          </EmptyStateDescription>
        </EmptyState>
      ) : null}

      {vm.loadState === 'success' && vm.data !== null && !vm.isEmpty ? (
        <>
          <OutcomeBreakdown breakdown={vm.data.breakdown} />
          {vm.data.series.length > 0 ? <TaskResultSeries series={vm.data.series} /> : null}
        </>
      ) : null}
    </section>
  );
}

/**
 * Task Result Dashboard: OK/Not OK breakdown + time-series for a period.
 * Period is controlled by parent props — this panel does not call syncInternalState.
 */
export const TaskResultDashboardPanel: ComponentType<TaskResultDashboardPanelProps> =
  function TaskResultDashboardPanel(props) {
    return (
      <DashboardUiStateProvider>
        <TaskResultDashboardPanelView {...props} />
      </DashboardUiStateProvider>
    );
  };
