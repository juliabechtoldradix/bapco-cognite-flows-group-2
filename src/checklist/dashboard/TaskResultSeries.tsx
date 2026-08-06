import type { TaskResultTimeSeriesPoint } from '../contracts';

export type TaskResultSeriesProps = {
  series: TaskResultTimeSeriesPoint[];
};

function formatBucketLabel(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) {
    return at;
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
}

export function TaskResultSeries({ series }: TaskResultSeriesProps) {
  const maxTotal = series.reduce((max, point) => Math.max(max, point.ok + point.notOk), 0);

  return (
    <div className="flex flex-col gap-2" data-testid="task-result-series">
      <h3 className="text-sm font-medium text-foreground">Trend over period</h3>
      <ul className="flex flex-col gap-2" role="list" aria-label="Task result time series">
        {series.map((point) => {
          const total = point.ok + point.notOk;
          const okWidth = maxTotal === 0 ? 0 : (point.ok / maxTotal) * 100;
          const notOkWidth = maxTotal === 0 ? 0 : (point.notOk / maxTotal) * 100;
          return (
            <li
              key={point.at}
              className="rounded-lg border border-border bg-background p-3"
              data-testid={`series-point-${point.at}`}
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{formatBucketLabel(point.at)}</span>
                <span className="text-muted-foreground">
                  OK {point.ok} · Not OK {point.notOk}
                </span>
              </div>
              <div
                className="flex h-2 overflow-hidden rounded-full bg-muted-background"
                role="img"
                aria-label={`Bucket total ${total}: OK ${point.ok}, Not OK ${point.notOk}`}
              >
                {okWidth > 0 ? (
                  <span className="bg-success-foreground" style={{ width: `${okWidth}%` }} />
                ) : null}
                {notOkWidth > 0 ? (
                  <span
                    className="bg-destructive-foreground-on-critical"
                    style={{ width: `${notOkWidth}%` }}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
