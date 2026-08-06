import type { TaskResultDashboardData } from '../contracts';

/** True when the period has no task-result outcomes to show. */
export function isDashboardEmpty(data: TaskResultDashboardData): boolean {
  const total = data.breakdown.ok + data.breakdown.notOk + data.breakdown.other;
  return total === 0;
}
