import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Count } from '@cognite/aura/components/count';
import { Loader } from '@cognite/aura/components/loader';

import type { ChecklistKpis } from '../contracts';

import type { OverviewLoadState } from './OverviewUiState';
import { KPI_LABELS } from './statusLabels';

export type KpiStripProps = {
  kpis: ChecklistKpis | null;
  state: OverviewLoadState;
  error: string | null;
};

type KpiItem = {
  key: keyof typeof KPI_LABELS;
  label: string;
  value: number;
  countVariant: 'default' | 'warning' | 'critical';
  /** Card surface — matches route status badge colors for Ongoing / Done. */
  boxClassName: string;
  labelClassName: string;
  valueClassName: string;
};

function buildItems(kpis: ChecklistKpis): KpiItem[] {
  return [
    {
      key: 'toDo',
      label: KPI_LABELS.toDo,
      value: kpis.toDo,
      countVariant: 'default',
      boxClassName: 'bg-alternate-background',
      labelClassName: 'text-muted-foreground',
      valueClassName: 'text-foreground',
    },
    {
      key: 'ongoing',
      label: KPI_LABELS.ongoing,
      value: kpis.ongoing,
      countVariant: 'default',
      boxClassName: 'bg-info-background',
      labelClassName: 'text-info-foreground-on-info',
      valueClassName: 'text-info-foreground-on-info',
    },
    {
      key: 'done',
      label: KPI_LABELS.done,
      value: kpis.done,
      countVariant: 'default',
      boxClassName: 'bg-success-background',
      labelClassName: 'text-success-foreground-on-success',
      valueClassName: 'text-success-foreground-on-success',
    },
    {
      key: 'overdue',
      label: KPI_LABELS.overdue,
      value: kpis.overdue,
      countVariant: 'warning',
      boxClassName: 'bg-alternate-background',
      labelClassName: 'text-muted-foreground',
      valueClassName: 'text-foreground',
    },
    {
      key: 'withNotOk',
      label: KPI_LABELS.withNotOk,
      value: kpis.withNotOk,
      countVariant: 'critical',
      boxClassName: 'bg-alternate-background',
      labelClassName: 'text-muted-foreground',
      valueClassName: 'text-foreground',
    },
  ];
}

export function KpiStrip({ kpis, state, error }: KpiStripProps) {
  if (state === 'loading' || state === 'idle') {
    return (
      <div
        className="inline-flex items-center gap-3 text-muted-foreground"
        data-testid="kpi-strip-loading"
        aria-live="polite"
      >
        <Loader size={20} />
        <span>Loading KPIs...</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <Alert variant="error" data-testid="kpi-strip-error">
        <AlertDescription>{error ?? 'Failed to load checklist KPIs'}</AlertDescription>
      </Alert>
    );
  }

  if (!kpis) {
    return null;
  }

  const items = buildItems(kpis);

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-5"
      role="group"
      aria-label="Checklist KPIs"
      data-testid="kpi-strip"
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={`rounded-xl p-4 ${item.boxClassName}`}
          data-testid={`kpi-${item.key}`}
        >
          <p className={`text-xs font-medium ${item.labelClassName}`}>{item.label}</p>
          <Count
            variant={item.countVariant}
            className={`mt-1 text-2xl font-semibold ${item.valueClassName}`}
          >
            {item.value}
          </Count>
        </div>
      ))}
    </div>
  );
}
