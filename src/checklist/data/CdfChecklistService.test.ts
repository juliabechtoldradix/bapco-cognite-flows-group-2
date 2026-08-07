import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INSTANCE_SPACE } from '../contracts';

import {
  CdfChecklistService,
  type ChecklistInstancesClient,
} from './CdfChecklistService';

/** Fixed "now": 2026-08-06T15:00:00.000Z — injected for period windows. */
const NOW_MS = Date.parse('2026-08-06T15:00:00.000Z');

describe(CdfChecklistService.name, () => {
  let instances: ChecklistInstancesClient;
  let service: CdfChecklistService;

  beforeEach(() => {
    instances = {
      list: vi.fn(),
      query: vi.fn(),
      search: vi.fn(),
    };
    service = new CdfChecklistService(instances, { nowMs: () => NOW_MS });
  });

  it('getTaskResultDashboard lists ChecklistItems with lastUpdatedTime range and aggregates', async () => {
    vi.mocked(instances.list).mockResolvedValue({
      items: [
        itemNode('i1', 'OK', Date.parse('2026-08-05T10:00:00.000Z')),
        itemNode('i2', 'Not OK', Date.parse('2026-08-05T18:00:00.000Z')),
        itemNode('i3', 'Yes', Date.parse('2026-08-06T08:00:00.000Z')),
        itemNode('sec', 'Not OK', Date.parse('2026-08-05T12:00:00.000Z'), ['section']),
      ],
    });

    const data = await service.getTaskResultDashboard('7d');

    expect(data.period).toBe('7d');
    expect(data.breakdown).toEqual({ ok: 1, notOk: 1, other: 1 });
    expect(data.series.length).toBeGreaterThan(0);
    expect(instances.list).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          and: [
            { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
            { hasData: [expect.objectContaining({ externalId: 'ChecklistItem', version: 'v7' })] },
            {
              range: {
                property: ['node', 'lastUpdatedTime'],
                gte: NOW_MS - 7 * 24 * 60 * 60 * 1000,
              },
            },
          ],
        },
        sources: [{ source: expect.objectContaining({ externalId: 'ChecklistItem' }) }],
      })
    );
  });

  it('getTaskResultDashboard returns empty breakdown when period has no items', async () => {
    vi.mocked(instances.list).mockResolvedValue({ items: [] });
    await expect(service.getTaskResultDashboard('24h')).resolves.toEqual({
      period: '24h',
      breakdown: { ok: 0, notOk: 0, other: 0 },
      series: [],
    });
  });

  it('getTaskResultDashboard throws when CDF list fails', async () => {
    const err = new Error('boom');
    Object.assign(err, { status: 503 });
    vi.mocked(instances.list).mockRejectedValue(err);
    await expect(service.getTaskResultDashboard('7d')).rejects.toThrow(
      /CDF list failed with status 503/
    );
  });

  it('listInAppNotifications derives Not OK and completed items from APM reads', async () => {
    vi.mocked(instances.list).mockResolvedValue({
      items: [
        checklistNode(
          'c1',
          'Route One - IV/Kamyr Digester/Diffuser',
          'Ready',
          null,
          Date.parse('2026-08-06T12:00:00.000Z')
        ),
        checklistNode(
          'c3',
          'Route Three - Blow Heat/Stripper/Turpentine',
          'Done',
          null,
          Date.parse('2026-08-05T08:00:00.000Z')
        ),
        checklistNode(
          'c2',
          'Route Two - Feed System',
          'In progress',
          null,
          Date.parse('2026-08-04T00:00:00.000Z')
        ),
      ],
    });
    vi.mocked(instances.query).mockResolvedValue({
      items: {
        itemEdges: [edge('c1', 'i1'), edge('c3', 'i3')],
        items: [itemNode('i1', 'Not OK'), itemNode('i3', 'OK')],
      },
    });

    const items = await service.listInAppNotifications();

    expect(items.map((item) => item.id)).toEqual(['notOk:c1', 'completed:c3']);
    expect(items[0]).toMatchObject({
      trigger: 'notOk',
      checklistId: 'c1',
      createdAt: '2026-08-06T12:00:00.000Z',
    });
    expect(items[1]).toMatchObject({
      trigger: 'completed',
      checklistId: 'c3',
      createdAt: '2026-08-05T08:00:00.000Z',
    });
    // In-app only — no search / outbound notification APIs.
    expect(instances.search).not.toHaveBeenCalled();
    expect(instances.list).toHaveBeenCalled();
    expect(instances.query).toHaveBeenCalled();
  });

  it('listInAppNotifications returns empty feed when nothing applies', async () => {
    vi.mocked(instances.list).mockResolvedValue({
      items: [
        checklistNode('c2', 'Route Two - Feed System', 'In progress', null, NOW_MS),
      ],
    });
    vi.mocked(instances.query).mockResolvedValue({
      items: {
        itemEdges: [edge('c2', 'i9')],
        items: [itemNode('i9', 'OK')],
      },
    });

    await expect(service.listInAppNotifications()).resolves.toEqual([]);
  });

  it('listInAppNotifications throws when underlying CDF list fails', async () => {
    const err = new Error('boom');
    Object.assign(err, { status: 500 });
    vi.mocked(instances.list).mockRejectedValue(err);
    await expect(service.listInAppNotifications()).rejects.toThrow(
      /CDF list failed with status 500/
    );
    expect(instances.search).not.toHaveBeenCalled();
  });

  it('getKpis aggregates status buckets and withNotOk from listed checklists', async () => {
    vi.mocked(instances.list).mockResolvedValue({
      items: [
        checklistNode('c1', 'Route One - IV/Kamyr Digester/Diffuser', 'Ready', null),
        checklistNode('c2', 'Route Two - Feed System', 'In progress', null),
        checklistNode('c3', 'Route Three - Blow Heat/Stripper/Turpentine', 'Done', null),
        checklistNode(
          'c4',
          'Route Four - A Line Screen and Washing',
          'Ready',
          '2000-01-01T00:00:00.000Z'
        ),
      ],
    });
    vi.mocked(instances.query).mockResolvedValue({
      items: {
        checklists: [],
        itemEdges: [edge('c1', 'i1'), edge('c1', 'i2'), edge('c3', 'i3')],
        items: [itemNode('i1', 'OK'), itemNode('i2', 'Not OK'), itemNode('i3', 'Not OK')],
      },
    });

    await expect(service.getKpis()).resolves.toEqual({
      toDo: 1,
      ongoing: 1,
      done: 1,
      overdue: 1,
      withNotOk: 2,
    });

    expect(instances.list).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          and: [
            { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
            expect.anything(),
          ],
        },
      })
    );
  });

  it('searchChecklists uses instances.search payload shape and hydrates hasNotOk', async () => {
    vi.mocked(instances.search).mockResolvedValue({
      items: [checklistNode('c2', 'Route Two - Feed System', 'In progress', null)],
    });
    vi.mocked(instances.query).mockResolvedValue({
      items: {
        itemEdges: [edge('c2', 'i9')],
        items: [itemNode('i9', 'OK')],
      },
    });

    const results = await service.searchChecklists('Feed');
    expect(results).toEqual([
      {
        id: 'c2',
        name: 'Route Two - Feed System',
        status: 'Ongoing',
        hasNotOk: false,
        routeKey: 'route2',
      },
    ]);
    expect(instances.search).toHaveBeenCalledWith(
      expect.objectContaining({
        view: expect.objectContaining({
          space: 'cdf_apm',
          externalId: 'Checklist',
          version: 'v7',
        }),
        query: 'Feed',
      })
    );
  });

  it('getResults queries checklist items via edge traversal and maps rows', async () => {
    vi.mocked(instances.query).mockResolvedValue({
        items: {
          itemEdges: [edge('c1', 'task-1'), edge('c1', 'sec-1')],
          items: [
            {
              space: INSTANCE_SPACE,
              externalId: 'task-1',
              properties: {
                cdf_apm: {
                  'ChecklistItem/v7': {
                    title: 'General Condition',
                    status: 'Not OK',
                    order: 2,
                    labels: ['zone:7th Floor', 'equipment:Diffuser Scraper'],
                  },
                },
              },
            },
            {
              space: INSTANCE_SPACE,
              externalId: 'sec-1',
              properties: {
                cdf_apm: {
                  'ChecklistItem/v7': {
                    title: 'Diffuser Scraper',
                    status: 'Not OK',
                    order: 1,
                    labels: ['section', 'zone:7th Floor', 'equipment:Diffuser Scraper'],
                  },
                },
              },
            },
          ],
          measurementEdges: [],
          measurements: [],
        },
      });

    const rows = await service.getResults('c1');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'task-1',
      label: 'General Condition',
      section: '7th Floor',
      equipment: 'Diffuser Scraper',
      outcome: 'NotOK',
    });
    expect(instances.query).toHaveBeenCalledWith(
      expect.objectContaining({
        with: expect.objectContaining({
          itemEdges: expect.objectContaining({
            edges: expect.objectContaining({
              filter: {
                equals: {
                  property: ['edge', 'type'],
                  value: { space: 'cdf_apm', externalId: 'referenceChecklistItems' },
                },
              },
            }),
          }),
        }),
      })
    );
  });

  it('throws when CDF request fails with non-OK status', async () => {
    const err = new Error('boom');
    Object.assign(err, { status: 500 });
    vi.mocked(instances.list).mockRejectedValue(err);

    await expect(service.getKpis()).rejects.toThrow(/CDF list failed with status 500/);
  });

  it('returns empty search results without querying graph', async () => {
    vi.mocked(instances.search).mockResolvedValue({ items: [] });
    await expect(service.searchChecklists('zzz')).resolves.toEqual([]);
    expect(instances.query).not.toHaveBeenCalled();
  });
});

function checklistNode(
  externalId: string,
  title: string,
  status: string,
  endTime: string | null,
  lastUpdatedTime?: number
) {
  return {
    space: INSTANCE_SPACE,
    externalId,
    lastUpdatedTime,
    createdTime: lastUpdatedTime,
    properties: {
      cdf_apm: {
        'Checklist/v7': {
          title,
          status,
          endTime,
        },
      },
    },
  };
}

function itemNode(
  externalId: string,
  status: string,
  lastUpdatedTime?: number,
  labels: string[] = []
) {
  return {
    space: INSTANCE_SPACE,
    externalId,
    lastUpdatedTime,
    createdTime: lastUpdatedTime,
    properties: {
      cdf_apm: {
        'ChecklistItem/v7': {
          title: externalId,
          status,
          labels,
        },
      },
    },
  };
}

function edge(startExternalId: string, endExternalId: string) {
  return {
    space: INSTANCE_SPACE,
    externalId: `edge:${startExternalId}:${endExternalId}`,
    startNode: { space: INSTANCE_SPACE, externalId: startExternalId },
    endNode: { space: INSTANCE_SPACE, externalId: endExternalId },
  };
}
