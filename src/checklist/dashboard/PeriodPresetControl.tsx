import {
  SegmentedControl,
  SegmentedControlButton,
  SegmentedControlList,
} from '@cognite/aura/components/segmented-control';

import { isTaskResultPeriodPreset, type TaskResultPeriodPreset } from '../contracts';

export type PeriodPresetControlProps = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
};

const PERIOD_OPTIONS: ReadonlyArray<{ value: TaskResultPeriodPreset; label: string }> = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

export function PeriodPresetControl({ periodPreset, onPeriodChange }: PeriodPresetControlProps) {
  return (
    <SegmentedControl
      value={periodPreset}
      onValueChange={(next) => {
        if (isTaskResultPeriodPreset(next)) {
          onPeriodChange(next);
        }
      }}
      data-testid="period-preset-control"
    >
      <SegmentedControlList aria-label="Dashboard period" size="small">
        {PERIOD_OPTIONS.map((option) => (
          <SegmentedControlButton
            key={option.value}
            value={option.value}
            tabContent="label-only"
            data-testid={`period-preset-${option.value}`}
          >
            {option.label}
          </SegmentedControlButton>
        ))}
      </SegmentedControlList>
    </SegmentedControl>
  );
}
