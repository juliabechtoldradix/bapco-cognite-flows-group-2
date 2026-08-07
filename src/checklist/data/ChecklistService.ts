import type {
  ChecklistKpis,
  ChecklistResultOutcome,
  ChecklistResultRow,
  ChecklistService,
  ChecklistSummary,
  InAppNotification,
  TaskResultDashboardData,
  TaskResultPeriodPreset,
  TaskResultTimeSeriesPoint,
} from '../contracts';
import { OEC_ROUTE_FIXTURES } from '../fixtures/oecRoutes';
import type { FixtureTask } from '../fixtures/oecRoutes';

export type { ChecklistService } from '../contracts';
export { CdfChecklistService } from './CdfChecklistService';

/**
 * Fixture-backed service for unit/integration tests and local UI without CDF.
 * Do not use in production — ChecklistPage wires CdfChecklistService via CogniteClient.
 */
export class FixtureChecklistService implements ChecklistService {
  async getKpis(): Promise<ChecklistKpis> {
    const kpis: ChecklistKpis = {
      toDo: 0,
      ongoing: 0,
      done: 0,
      overdue: 0,
      withNotOk: 0,
    };

    for (const route of OEC_ROUTE_FIXTURES) {
      switch (route.status) {
        case 'ToDo':
          kpis.toDo += 1;
          break;
        case 'Ongoing':
          kpis.ongoing += 1;
          break;
        case 'Done':
          kpis.done += 1;
          break;
        case 'Overdue':
          kpis.overdue += 1;
          break;
      }
      if (route.hasNotOk) {
        kpis.withNotOk += 1;
      }
    }

    return kpis;
  }

  async searchChecklists(query: string): Promise<ChecklistSummary[]> {
    const normalized = query.trim().toLowerCase();
    return OEC_ROUTE_FIXTURES.filter((route) => {
      if (!normalized) {
        return true;
      }
      return route.name.toLowerCase().includes(normalized);
    }).map((route) => ({
      id: route.id,
      name: route.name,
      status: route.status,
      hasNotOk: route.hasNotOk,
      routeKey: route.routeKey,
    }));
  }

  async getResults(checklistId: string): Promise<ChecklistResultRow[]> {
    const route = OEC_ROUTE_FIXTURES.find((item) => item.id === checklistId);
    if (!route) {
      return [];
    }

    const rows: ChecklistResultRow[] = [];
    let index = 0;

    for (const section of route.sections) {
      for (const equipment of section.equipment) {
        for (const task of equipment.tasks) {
          index += 1;
          rows.push({
            id: `${route.id}-item-${index}`,
            label: task.label,
            section: section.name,
            equipment: equipment.name,
            assetExternalId: equipment.assetExternalId ?? undefined,
            outcome: fixtureOutcome(task, route.hasNotOk && index === 1),
            reading: fixtureReading(task),
          });
        }
      }
    }

    return rows;
  }

  /** Synthetic dashboard data for UI tests until Dev A lands real aggregation. */
  async getTaskResultDashboard(period: TaskResultPeriodPreset): Promise<TaskResultDashboardData> {
    return fixtureTaskResultDashboard(period);
  }

  /** Synthetic in-app notifications for UI tests (deterministic OEC-shaped feed). */
  async listInAppNotifications(): Promise<InAppNotification[]> {
    return fixtureInAppNotifications();
  }
}

function fixtureOutcome(task: FixtureTask, forceNotOk: boolean): ChecklistResultOutcome {
  if (task.kind === 'okNotOk') {
    return forceNotOk ? 'NotOK' : 'OK';
  }
  if (task.kind === 'yesNo') {
    return 'No';
  }
  return 'Unset';
}

function fixtureReading(
  task: FixtureTask
): ChecklistResultRow['reading'] | undefined {
  if (task.kind !== 'measure' || !task.unit) {
    return undefined;
  }
  return {
    value: 155,
    unit: task.unit,
    threshold: task.threshold ?? undefined,
  };
}

function fixtureTaskResultDashboard(period: TaskResultPeriodPreset): TaskResultDashboardData {
  const series = fixtureSeries(period);
  let ok = 0;
  let notOk = 0;
  for (const point of series) {
    ok += point.ok;
    notOk += point.notOk;
  }
  return {
    period,
    breakdown: { ok, notOk, other: period === '24h' ? 1 : 2 },
    series,
  };
}

function fixtureInAppNotifications(): InAppNotification[] {
  const notOkRoute = OEC_ROUTE_FIXTURES.find((route) => route.hasNotOk);
  const completedRoute = OEC_ROUTE_FIXTURES.find((route) => route.status === 'Done');
  const items: InAppNotification[] = [];

  if (notOkRoute) {
    items.push({
      id: `notOk:${notOkRoute.id}`,
      trigger: 'notOk',
      title: `Not OK result on ${notOkRoute.name}`,
      body: 'Checklist has at least one Not OK task result',
      checklistId: notOkRoute.id,
      createdAt: '2026-08-06T12:00:00.000Z',
    });
  }

  if (completedRoute) {
    items.push({
      id: `completed:${completedRoute.id}`,
      trigger: 'completed',
      title: `Checklist completed: ${completedRoute.name}`,
      body: 'Checklist status is Done',
      checklistId: completedRoute.id,
      createdAt: '2026-08-05T08:00:00.000Z',
    });
  }

  return items;
}

function fixtureSeries(period: TaskResultPeriodPreset): TaskResultTimeSeriesPoint[] {
  if (period === '24h') {
    return [
      { at: '2026-08-06T00:00:00.000Z', ok: 4, notOk: 1 },
      { at: '2026-08-06T06:00:00.000Z', ok: 5, notOk: 0 },
      { at: '2026-08-06T12:00:00.000Z', ok: 3, notOk: 2 },
    ];
  }
  if (period === '30d') {
    return [
      { at: '2026-07-10T00:00:00.000Z', ok: 12, notOk: 3 },
      { at: '2026-07-20T00:00:00.000Z', ok: 15, notOk: 2 },
      { at: '2026-07-30T00:00:00.000Z', ok: 14, notOk: 4 },
      { at: '2026-08-05T00:00:00.000Z', ok: 16, notOk: 1 },
    ];
  }
  // 7d default
  return [
    { at: '2026-07-31T00:00:00.000Z', ok: 8, notOk: 2 },
    { at: '2026-08-02T00:00:00.000Z', ok: 9, notOk: 1 },
    { at: '2026-08-04T00:00:00.000Z', ok: 7, notOk: 3 },
    { at: '2026-08-06T00:00:00.000Z', ok: 10, notOk: 2 },
  ];
}
