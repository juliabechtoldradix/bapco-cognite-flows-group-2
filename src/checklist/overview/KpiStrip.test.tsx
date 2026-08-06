import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KpiStrip } from './KpiStrip';

describe(KpiStrip.name, () => {
  it('renders loading state', () => {
    render(<KpiStrip kpis={null} state="loading" error={null} />);
    expect(screen.getByTestId('kpi-strip-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading KPIs...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<KpiStrip kpis={null} state="error" error="KPI failed" />);
    expect(screen.getByTestId('kpi-strip-error')).toBeInTheDocument();
    expect(screen.getByText('KPI failed')).toBeInTheDocument();
  });

  it('renders KPI counts on success', () => {
    render(
      <KpiStrip
        kpis={{ toDo: 1, ongoing: 2, done: 3, overdue: 4, withNotOk: 5 }}
        state="success"
        error={null}
      />
    );

    expect(screen.getByTestId('kpi-strip')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-toDo')).toHaveTextContent('1');
    expect(screen.getByTestId('kpi-ongoing')).toHaveTextContent('2');
    expect(screen.getByTestId('kpi-done')).toHaveTextContent('3');
    expect(screen.getByTestId('kpi-overdue')).toHaveTextContent('4');
    expect(screen.getByTestId('kpi-withNotOk')).toHaveTextContent('5');
  });

  it('uses info and success surfaces for Ongoing and Done boxes', () => {
    render(
      <KpiStrip
        kpis={{ toDo: 1, ongoing: 2, done: 3, overdue: 4, withNotOk: 5 }}
        state="success"
        error={null}
      />
    );

    expect(screen.getByTestId('kpi-ongoing').className).toContain('bg-info-background');
    expect(screen.getByTestId('kpi-done').className).toContain('bg-success-background');
  });
});

