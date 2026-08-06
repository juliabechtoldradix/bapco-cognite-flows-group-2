import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OutcomeBreakdown } from './OutcomeBreakdown';

describe(OutcomeBreakdown.name, () => {
  it('renders OK, Not OK, and Other counts from breakdown props', () => {
    render(<OutcomeBreakdown breakdown={{ ok: 10, notOk: 3, other: 2 }} />);

    expect(screen.getByTestId('outcome-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('breakdown-count-ok')).toHaveTextContent('10');
    expect(screen.getByTestId('breakdown-count-notOk')).toHaveTextContent('3');
    expect(screen.getByTestId('breakdown-count-other')).toHaveTextContent('2');
    expect(screen.getByTestId('outcome-breakdown-bar')).toBeInTheDocument();
  });
});
