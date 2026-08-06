import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';

import type { TaskResultPeriodPreset } from '../contracts';

export type TaskResultDashboardPanelProps = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
};

/**
 * Day-0 stub. Dev B replaces with OK/Not OK breakdown + time-series UI.
 * Props API is frozen — extend internals only.
 */
export function TaskResultDashboardPanel({
  periodPreset,
  onPeriodChange: _onPeriodChange,
}: TaskResultDashboardPanelProps) {
  return (
    <section aria-label="Task result dashboard" data-testid="task-result-dashboard-stub">
      <EmptyState variant="compact">
        <EmptyStateTitle as="h2">Dashboard stub — Dev B</EmptyStateTitle>
        <EmptyStateDescription>
          Task Result Dashboard placeholder (period: {periodPreset}). Breakdown and time-series land
          in feat/task-result-dashboard-ui.
        </EmptyStateDescription>
      </EmptyState>
    </section>
  );
}
