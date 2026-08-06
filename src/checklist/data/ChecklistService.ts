import type {
  ChecklistKpis,
  ChecklistResultOutcome,
  ChecklistResultRow,
  ChecklistService,
  ChecklistSummary,
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
