import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodPresetControl } from './PeriodPresetControl';

describe(PeriodPresetControl.name, () => {
  it('calls onPeriodChange when a different period is selected', async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();

    render(<PeriodPresetControl periodPreset="7d" onPeriodChange={onPeriodChange} />);

    expect(screen.getByTestId('period-preset-control')).toBeInTheDocument();
    await user.click(screen.getByTestId('period-preset-24h'));
    expect(onPeriodChange).toHaveBeenCalledWith('24h');
  });
});
