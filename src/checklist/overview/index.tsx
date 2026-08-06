import type { ComponentType } from 'react';

import type { ChecklistSummary } from '../contracts';

export type ChecklistOverviewPanelProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedId: string | null;
  onSelectChecklist: (id: string) => void;
  /** Optional override for tests / shell wiring; Day-0 stub ignores this. */
  checklists?: ChecklistSummary[];
};

/**
 * Day-0 placeholder. Dev B replaces with the real overview panel.
 */
export const ChecklistOverviewPanel: ComponentType<ChecklistOverviewPanelProps> = function ChecklistOverviewPanel(
  props
) {
  const { searchQuery, selectedId } = props;
  return (
    <section aria-label="Checklist overview placeholder" data-testid="checklist-overview-placeholder">
      <p>Checklist overview (Day-0 stub)</p>
      <p>Search: {searchQuery || '(empty)'}</p>
      <p>Selected: {selectedId ?? '(none)'}</p>
    </section>
  );
};
