import type { ChecklistStatus, InAppNotification } from '../contracts';

/** Max feed length (newest first after sort). */
export const IN_APP_NOTIFICATION_CAP = 50;

/**
 * Stable ids: `notOk:{checklistId}` / `completed:{checklistId}`.
 * Same checklist may emit both when Done and has Not OK results.
 */
export type NotificationSourceChecklist = {
  id: string;
  name: string;
  status: ChecklistStatus;
  hasNotOk: boolean;
  /** Epoch ms for `createdAt` ranking (checklist lastUpdatedTime preferred). */
  eventMs: number;
};

/**
 * Derives in-app notification feed items from existing checklist summaries.
 * Triggers only: Not OK presence (`hasNotOk`) and completed (`status === 'Done'`).
 * No outbound delivery — pure client-side mapping (FR-V3-002…004).
 */
export function deriveInAppNotifications(
  checklists: readonly NotificationSourceChecklist[]
): InAppNotification[] {
  const items: InAppNotification[] = [];

  for (const checklist of checklists) {
    if (checklist.hasNotOk) {
      items.push({
        id: `notOk:${checklist.id}`,
        trigger: 'notOk',
        title: `Not OK result on ${checklist.name}`,
        body: 'Checklist has at least one Not OK task result',
        checklistId: checklist.id,
        createdAt: toIso(checklist.eventMs),
      });
    }
    if (checklist.status === 'Done') {
      items.push({
        id: `completed:${checklist.id}`,
        trigger: 'completed',
        title: `Checklist completed: ${checklist.name}`,
        body: 'Checklist status is Done',
        checklistId: checklist.id,
        createdAt: toIso(checklist.eventMs),
      });
    }
  }

  items.sort((a, b) => {
    if (a.createdAt === b.createdAt) {
      return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  return items.slice(0, IN_APP_NOTIFICATION_CAP);
}

function toIso(eventMs: number): string {
  return new Date(eventMs).toISOString();
}
