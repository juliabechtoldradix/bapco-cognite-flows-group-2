import type { ComponentType } from 'react';

import type { ChecklistSummary } from '../contracts';

import { ChecklistList } from './ChecklistList';
import { ChecklistSearch } from './ChecklistSearch';
import { KpiStrip } from './KpiStrip';
import { OverviewUiStateProvider } from './OverviewUiStateProvider';
import { useChecklistOverviewViewModel } from './useChecklistOverviewViewModel';

export type ChecklistOverviewPanelProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedId: string | null;
  onSelectChecklist: (id: string) => void;
  /** Optional override for tests / shell wiring. */
  checklists?: ChecklistSummary[];
};

function ChecklistOverviewPanelView(props: ChecklistOverviewPanelProps) {
  const vm = useChecklistOverviewViewModel(props);

  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Checklist overview"
      data-testid="checklist-overview"
    >
      <KpiStrip kpis={vm.kpis} state={vm.kpisState} error={vm.kpisError} />
      <ChecklistSearch
        searchQuery={vm.searchQuery}
        onSearchChange={vm.onSearchChange}
        debounceMs={vm.searchDebounceMs}
        setTimeoutFn={vm.setTimeoutFn}
        clearTimeoutFn={vm.clearTimeoutFn}
      />
      <ChecklistList
        checklists={vm.checklists}
        selectedId={vm.selectedId}
        onSelect={vm.selectChecklist}
        state={vm.listState}
        error={vm.listError}
        searchQuery={vm.searchQuery}
      />
    </section>
  );
}

/**
 * Overview panel: KPI strip, debounced search, and selectable checklist list.
 * Host-synced search/selection stay in parent props — this panel does not call syncInternalState.
 */
export const ChecklistOverviewPanel: ComponentType<ChecklistOverviewPanelProps> =
  function ChecklistOverviewPanel(props) {
    return (
      <OverviewUiStateProvider>
        <ChecklistOverviewPanelView {...props} />
      </OverviewUiStateProvider>
    );
  };
