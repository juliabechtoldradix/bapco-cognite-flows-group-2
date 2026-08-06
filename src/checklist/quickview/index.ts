import type { ComponentType } from 'react';

import type { ChecklistResultRow } from '../contracts';

export type ChecklistQuickViewProps = {
  checklistId: string | null;
  checklistName?: string;
  /** Optional override for tests / shell wiring; Day-0 stub ignores this. */
  results?: ChecklistResultRow[];
};

/**
 * Day-0 placeholder. Dev C replaces with the real quick view.
 */
export const ChecklistQuickView: ComponentType<ChecklistQuickViewProps> = function ChecklistQuickView(props) {
  const { checklistId, checklistName } = props;
  return (
    <aside aria-label="Checklist quick view placeholder" data-testid="checklist-quickview-placeholder">
      <p>Checklist quick view (Day-0 stub)</p>
      <p>Checklist: {checklistName ?? checklistId ?? '(none)'}</p>
    </aside>
  );
};
