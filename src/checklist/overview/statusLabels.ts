import type { ChecklistStatus } from '../contracts';

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  ToDo: 'To Do',
  Ongoing: 'Ongoing',
  Done: 'Done',
  Overdue: 'Overdue',
};

export const KPI_LABELS = {
  toDo: 'To Do',
  ongoing: 'Ongoing',
  done: 'Done',
  overdue: 'Overdue',
  withNotOk: 'Not OK',
} as const;
