import { Count } from '@cognite/aura/components/count';

import type { TaskOutcomeBreakdown } from '../contracts';

export type OutcomeBreakdownProps = {
  breakdown: TaskOutcomeBreakdown;
};

type BreakdownItem = {
  key: 'ok' | 'notOk' | 'other';
  label: string;
  value: number;
  countVariant: 'default' | 'warning' | 'critical';
  countClassName: string;
};

function buildItems(breakdown: TaskOutcomeBreakdown): BreakdownItem[] {
  return [
    {
      key: 'ok',
      label: 'OK',
      value: breakdown.ok,
      countVariant: 'default',
      countClassName: 'bg-success-background text-success-foreground-on-success',
    },
    {
      key: 'notOk',
      label: 'Not OK',
      value: breakdown.notOk,
      countVariant: 'critical',
      countClassName: '',
    },
    {
      key: 'other',
      label: 'Other',
      value: breakdown.other,
      countVariant: 'default',
      countClassName: '',
    },
  ];
}

export function OutcomeBreakdown({ breakdown }: OutcomeBreakdownProps) {
  const items = buildItems(breakdown);
  const total = breakdown.ok + breakdown.notOk + breakdown.other;
  const okPct = total === 0 ? 0 : Math.round((breakdown.ok / total) * 100);
  const notOkPct = total === 0 ? 0 : Math.round((breakdown.notOk / total) * 100);
  const otherPct = total === 0 ? 0 : Math.max(0, 100 - okPct - notOkPct);

  return (
    <div className="flex flex-col gap-3" data-testid="outcome-breakdown">
      <div
        className="grid grid-cols-3 gap-3"
        role="group"
        aria-label="Task outcome breakdown"
      >
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl bg-alternate-background p-4"
            data-testid={`breakdown-${item.key}`}
          >
            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            <Count
              variant={item.countVariant}
              className={`mt-1 text-2xl font-semibold ${item.countClassName}`.trim()}
              data-testid={`breakdown-count-${item.key}`}
            >
              {item.value}
            </Count>
          </div>
        ))}
      </div>
      {total > 0 ? (
        <div
          className="flex h-2 overflow-hidden rounded-full bg-muted-background"
          role="img"
          aria-label={`OK ${okPct}%, Not OK ${notOkPct}%, Other ${otherPct}%`}
          data-testid="outcome-breakdown-bar"
        >
          {okPct > 0 ? (
            <span
              className="bg-success-foreground"
              style={{ width: `${okPct}%` }}
              data-testid="outcome-bar-ok"
            />
          ) : null}
          {notOkPct > 0 ? (
            <span
              className="bg-destructive-foreground-on-critical"
              style={{ width: `${notOkPct}%` }}
              data-testid="outcome-bar-not-ok"
            />
          ) : null}
          {otherPct > 0 ? (
            <span
              className="bg-muted-foreground/40"
              style={{ width: `${otherPct}%` }}
              data-testid="outcome-bar-other"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
