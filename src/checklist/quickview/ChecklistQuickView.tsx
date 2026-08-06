import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Badge } from '@cognite/aura/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cognite/aura/components/card';
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from '@cognite/aura/components/empty-state';
import { Loader } from '@cognite/aura/components/loader';
import { Separator } from '@cognite/aura/components/separator';

import type { ChecklistResultRow } from '../contracts';
import { formatOutcomeLabel, outcomeBadgeVariant } from './outcomeLabel';
import { useChecklistQuickViewViewModel } from './useChecklistQuickViewViewModel';

export type ChecklistQuickViewProps = {
  checklistId: string | null;
  checklistName?: string;
  /** Optional override for tests; when set, ViewModel fetch is still used unless provided via context mocks. */
  results?: ChecklistResultRow[];
};

export function ChecklistQuickView({ checklistId, checklistName }: ChecklistQuickViewProps) {
  const { status, groups, checklistName: loadedName, errorMessage } =
    useChecklistQuickViewViewModel(checklistId);
  const title = checklistName ?? loadedName ?? 'Checklist results';

  return (
    <aside aria-label="Checklist quick view" data-testid="checklist-quickview">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Quick view</CardTitle>
          <CardDescription>{checklistId ? title : 'Select a checklist to inspect results'}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'idle' ? (
            <EmptyState variant="compact">
              <EmptyStateTitle as="h3">No checklist selected</EmptyStateTitle>
              <EmptyStateDescription>
                Choose a route from the overview to see OK / Not OK results and readings.
              </EmptyStateDescription>
            </EmptyState>
          ) : null}

          {status === 'loading' ? (
            <div className="inline-flex items-center gap-3 text-muted-foreground" aria-live="polite">
              <Loader size={20} />
              <span>Loading results...</span>
            </div>
          ) : null}

          {status === 'error' ? (
            <Alert variant="error">
              <AlertDescription>{errorMessage ?? 'Failed to load checklist results'}</AlertDescription>
            </Alert>
          ) : null}

          {status === 'empty' ? (
            <EmptyState variant="compact">
              <EmptyStateTitle as="h3">No results</EmptyStateTitle>
              <EmptyStateDescription>This checklist has no task results yet.</EmptyStateDescription>
            </EmptyState>
          ) : null}

          {status === 'success'
            ? groups.map((section) => (
                <section key={section.section} className="mb-6 last:mb-0" aria-label={section.section}>
                  <h3 className="mb-3 text-sm font-medium text-secondary-foreground">{section.section}</h3>
                  {section.equipmentGroups.map((equipmentGroup) => (
                    <div
                      key={`${section.section}-${equipmentGroup.equipment}`}
                      className="mb-4 rounded-lg bg-alternate-background p-3 last:mb-0"
                    >
                      <div className="mb-2 flex flex-wrap items-baseline gap-2">
                        <h4 className="text-sm font-medium">{equipmentGroup.equipment}</h4>
                        {equipmentGroup.assetExternalId ? (
                          <span className="text-xs text-muted-foreground">
                            Asset {equipmentGroup.assetExternalId}
                          </span>
                        ) : null}
                      </div>
                      <ul className="flex flex-col gap-2">
                        {equipmentGroup.rows.map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
                          >
                            <span>{row.label}</span>
                            <span className="inline-flex items-center gap-2">
                              {row.reading ? (
                                <span className="text-muted-foreground">
                                  {row.reading.value}
                                  {row.reading.unit}
                                  {row.reading.threshold ? ` (${row.reading.threshold})` : ''}
                                </span>
                              ) : null}
                              <Badge variant={outcomeBadgeVariant(row.outcome)} background>
                                {formatOutcomeLabel(row.outcome)}
                              </Badge>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Separator className="mt-4" />
                </section>
              ))
            : null}
        </CardContent>
      </Card>
    </aside>
  );
}
