import { useMemo } from 'react';
import { useCogniteSdk } from '@cognite/app-sdk/react';
import {
  SegmentedControl,
  SegmentedControlButton,
  SegmentedControlList,
} from '@cognite/aura/components/segmented-control';

import ipLogo from '../../assets/ip-logo.png';
import { isAppView, type ChecklistService } from '../contracts';
import { TaskResultDashboardPanel } from '../dashboard';
import { CdfChecklistService } from '../data/CdfChecklistService';
import { ChecklistOverviewPanel, ChecklistOverviewViewModelProvider } from '../overview';
import { ChecklistQuickView, QuickViewUiStateProvider } from '../quickview';
import { HostSyncedStateProvider, type HostSyncedApi } from '../state/HostSyncedState';
import { ChecklistServiceProvider } from './ChecklistServiceContext';
import { useChecklistPageViewModel } from './useChecklistPageViewModel';

export type ChecklistPageProps = {
  api: HostSyncedApi | null;
  initialState?: string;
  /** Test / local override. Production uses CdfChecklistService + CogniteClient. */
  checklistService?: ChecklistService;
};

function ChecklistPageContent() {
  const {
    searchQuery,
    selectedChecklistId,
    activeView,
    periodPreset,
    onSearchChange,
    onSelectChecklist,
    onActiveViewChange,
    onPeriodChange,
  } = useChecklistPageViewModel();

  const isDashboard = activeView === 'dashboard';

  return (
    <main className="min-h-screen bg-background text-foreground" data-testid="checklist-page">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
        <header className="border-b border-border pb-4">
          <div className="mb-1 flex items-center gap-2">
            <img
              src={ipLogo}
              alt="International Paper"
              className="h-8 w-auto shrink-0"
              data-testid="app-brand-logo"
            />
            <p className="text-sm font-medium text-link-foreground">Kamyr OEC</p>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isDashboard ? 'Task result dashboard' : 'Checklist overview'}
          </h1>
          <p className="text-muted-foreground">
            {isDashboard
              ? 'OK vs Not OK outcomes and trends over a selected period'
              : 'Status KPIs, search, and quick view of route checklist results'}
          </p>
          <div className="mt-4" data-testid="app-view-nav">
            <SegmentedControl
              value={activeView}
              onValueChange={(value) => {
                if (isAppView(value)) {
                  onActiveViewChange(value);
                }
              }}
            >
              <SegmentedControlList>
                <SegmentedControlButton value="overview" data-testid="nav-overview">
                  Overview
                </SegmentedControlButton>
                <SegmentedControlButton value="dashboard" data-testid="nav-dashboard">
                  Dashboard
                </SegmentedControlButton>
              </SegmentedControlList>
            </SegmentedControl>
          </div>
        </header>

        {isDashboard ? (
          <TaskResultDashboardPanel
            periodPreset={periodPreset}
            onPeriodChange={onPeriodChange}
          />
        ) : (
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
        )}
      </div>
    </main>
  );
}

export function ChecklistPage({
  api,
  initialState,
  checklistService: checklistServiceOverride,
}: ChecklistPageProps) {
  const client = useCogniteSdk();
  const checklistService = useMemo(
    () => checklistServiceOverride ?? new CdfChecklistService(client),
    [checklistServiceOverride, client]
  );

  return (
    <ChecklistServiceProvider checklistService={checklistService}>
      <ChecklistOverviewViewModelProvider checklistService={checklistService}>
        <HostSyncedStateProvider api={api} initialState={initialState}>
          <ChecklistPageContent />
        </HostSyncedStateProvider>
      </ChecklistOverviewViewModelProvider>
    </ChecklistServiceProvider>
  );
}
