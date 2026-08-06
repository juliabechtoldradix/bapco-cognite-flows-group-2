import { useState } from 'react';

import { ChecklistOverviewPanel } from '../overview';
import { ChecklistQuickView } from '../quickview';

/**
 * Day-0 page shell composition slots.
 * Dev C owns wiring to host-synced state and the real service.
 */
export function ChecklistPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background text-foreground" data-testid="checklist-page">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
        <header>
          <h1 className="text-2xl font-semibold">Checklist overview</h1>
          <p className="text-muted-foreground">Kamyr OEC routes — Day-0 shell</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <ChecklistOverviewPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedChecklistId}
            onSelectChecklist={setSelectedChecklistId}
          />
          <ChecklistQuickView checklistId={selectedChecklistId} />
        </div>
      </div>
    </main>
  );
}
