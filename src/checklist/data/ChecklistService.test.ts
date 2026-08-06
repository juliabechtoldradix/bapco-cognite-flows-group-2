import { describe, expect, it } from 'vitest';

import { FixtureChecklistService } from './ChecklistService';

describe(FixtureChecklistService.name, () => {
  const service = new FixtureChecklistService();

  it('aggregates KPI counts from OEC fixtures', async () => {
    await expect(service.getKpis()).resolves.toEqual({
      toDo: 1,
      ongoing: 1,
      done: 1,
      overdue: 1,
      withNotOk: 2,
    });
  });

  it('searches checklists by route name', async () => {
    const results = await service.searchChecklists('Feed');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toContain('Feed System');
  });

  it('returns empty list when search has no matches', async () => {
    await expect(service.searchChecklists('zzz-no-match')).resolves.toEqual([]);
  });

  it('returns result rows for a known checklist id', async () => {
    const rows = await service.getResults('fixture-route1');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      section: '7th Floor',
      equipment: 'Diffuser Scraper',
      label: 'General Condition',
    });
  });

  it('returns empty results for unknown checklist id', async () => {
    await expect(service.getResults('missing')).resolves.toEqual([]);
  });

  it('returns deterministic synthetic task-result dashboard data', async () => {
    const data = await service.getTaskResultDashboard('7d');
    expect(data.period).toBe('7d');
    expect(data.breakdown.ok).toBeGreaterThan(0);
    expect(data.breakdown.notOk).toBeGreaterThan(0);
    expect(data.series.length).toBeGreaterThan(0);
    await expect(service.getTaskResultDashboard('24h')).resolves.toMatchObject({ period: '24h' });
    await expect(service.getTaskResultDashboard('30d')).resolves.toMatchObject({ period: '30d' });
  });
});

