import { ChecklistOverviewPanel } from '../overview';
import { ChecklistQuickView, QuickViewUiStateProvider } from '../quickview';
import { HostSyncedStateProvider, type HostSyncedApi } from '../state/HostSyncedState';
import { ChecklistServiceProvider } from './ChecklistServiceContext';
import { useChecklistPageViewModel } from './useChecklistPageViewModel';

export type ChecklistPageProps = {
  api: HostSyncedApi | null;
  initialState?: string;
};

function ChecklistPageContent() {
  const { searchQuery, selectedChecklistId, onSearchChange, onSelectChecklist } =
    useChecklistPageViewModel();

  return (
    <main className="min-h-screen bg-background text-foreground" data-testid="checklist-page">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
        <header className="border-b border-border pb-4">
          <p className="text-sm font-medium text-link-foreground">International Paper · Kamyr OEC</p>
          <h1 className="text-2xl font-semibold text-foreground">Checklist overview</h1>
          <p className="text-muted-foreground">
            Status KPIs, search, and quick view of route checklist results
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <ChecklistOverviewPanel
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedId={selectedChecklistId}
            onSelectChecklist={onSelectChecklist}
          />
          <QuickViewUiStateProvider>
            <ChecklistQuickView checklistId={selectedChecklistId} />
          </QuickViewUiStateProvider>
        </div>
      </div>
    </main>
  );
}

export function ChecklistPage({ api, initialState }: ChecklistPageProps) {
  return (
    <ChecklistServiceProvider>
      <HostSyncedStateProvider api={api} initialState={initialState}>
        <ChecklistPageContent />
      </HostSyncedStateProvider>
    </ChecklistServiceProvider>
  );
}
