import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TaskResultSeries } from './TaskResultSeries';

describe(TaskResultSeries.name, () => {
  it('renders a row for each series point', () => {
    render(
      <TaskResultSeries
        series={[
          { at: '2026-08-01T00:00:00.000Z', ok: 8, notOk: 2 },
          { at: '2026-08-02T00:00:00.000Z', ok: 5, notOk: 1 },
        ]}
      />
    );

    expect(screen.getByTestId('task-result-series')).toBeInTheDocument();
    expect(screen.getByTestId('series-point-2026-08-01T00:00:00.000Z')).toHaveTextContent(
      'OK 8 · Not OK 2'
    );
    expect(screen.getByTestId('series-point-2026-08-02T00:00:00.000Z')).toHaveTextContent(
      'OK 5 · Not OK 1'
    );
  });
});
