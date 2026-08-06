import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Badge } from '@cognite/aura/components/badge';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@cognite/aura/components/empty-state';
import { Loader } from '@cognite/aura/components/loader';

import { cn } from '../../lib/utils';
import type { ChecklistStatus, ChecklistSummary } from '../contracts';

import type { OverviewLoadState } from './OverviewUiState';
import { CHECKLIST_STATUS_LABELS } from './statusLabels';

export type ChecklistListProps = {
  checklists: ChecklistSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  state: OverviewLoadState;
  error: string | null;
  searchQuery: string;
};

function statusBadgeVariant(
  status: ChecklistStatus
): 'default' | 'inProgress' | 'success' | 'warning' {
  switch (status) {
    case 'ToDo':
      return 'default';
    case 'Ongoing':
      return 'inProgress';
    case 'Done':
      return 'success';
    case 'Overdue':
      return 'warning';
  }
}

export function ChecklistList({
  checklists,
  selectedId,
  onSelect,
  state,
  error,
  searchQuery,
}: ChecklistListProps) {
  if (state === 'loading' || state === 'idle') {
    return (
      <div
        className="inline-flex items-center gap-3 text-muted-foreground"
        data-testid="checklist-list-loading"
        aria-live="polite"
      >
        <Loader size={20} />
        <span>Loading checklists...</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <Alert variant="error" data-testid="checklist-list-error">
        <AlertDescription>{error ?? 'Failed to load checklists'}</AlertDescription>
      </Alert>
    );
  }

  if (checklists.length === 0) {
    const hasQuery = searchQuery.trim().length > 0;
    return (
      <EmptyState variant="compact" type="no-results" data-testid="checklist-list-empty">
        <EmptyStateTitle as="h3">
          {hasQuery ? 'No checklists matched' : 'No checklists available'}
        </EmptyStateTitle>
        <EmptyStateDescription>
          {hasQuery
            ? 'Try a different search term, or clear the search to see all checklists.'
            : 'There are no checklists to show for this project yet.'}
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2" role="list" data-testid="checklist-list" aria-label="Checklists">
      {checklists.map((checklist) => {
        const isSelected = selectedId === checklist.id;
        return (
          <li key={checklist.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              data-testid={`checklist-item-${checklist.id}`}
              onClick={() => {
                onSelect(checklist.id);
              }}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-alternate-background'
                  : 'border-border bg-background hover:bg-muted-background'
              )}
            >
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {checklist.name}
              </span>
              <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {checklist.hasNotOk ? (
                  <Badge variant="error" background>
                    Not OK
                  </Badge>
                ) : null}
                <Badge variant={statusBadgeVariant(checklist.status)} background>
                  {CHECKLIST_STATUS_LABELS[checklist.status]}
                </Badge>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
