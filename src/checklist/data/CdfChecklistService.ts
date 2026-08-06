import type { CogniteClient } from '@cognite/sdk';

import {
  APM_APP_DATA,
  INSTANCE_SPACE,
  type ChecklistKpis,
  type ChecklistResultRow,
  type ChecklistService,
  type TaskResultDashboardData,
  type TaskResultPeriodPreset,
  type ChecklistSummary,
} from '../contracts';
import {
  isNotOkItemStatus,
  mapChecklistItemToResultRow,
  mapChecklistToSummary,
  type ApmMeasurementProps,
} from '../mappers';
import {
  aggregateTaskResults,
  resolvePeriodWindow,
  type TaskResultAggregateItem,
} from './taskResultAggregate';

/** Narrow instances API used by CdfChecklistService (injectable / mockable). */
export interface ChecklistInstancesClient {
  query: (query: unknown) => Promise<unknown>;
  list: (query: unknown) => Promise<unknown>;
  search: (query: unknown) => Promise<unknown>;
}

type CdfChecklistServiceDeps = {
  nowMs: () => number;
};

const defaultDeps: CdfChecklistServiceDeps = {
  nowMs: () => Date.now(),
};

const CHECKLIST_VIEW = {
  type: 'view',
  space: APM_APP_DATA.space,
  externalId: 'Checklist',
  version: 'v7',
};

const CHECKLIST_ITEM_VIEW = {
  type: 'view',
  space: APM_APP_DATA.space,
  externalId: 'ChecklistItem',
  version: 'v7',
};

const MEASUREMENT_VIEW = {
  type: 'view',
  space: APM_APP_DATA.space,
  externalId: 'MeasurementReading',
  version: 'v4',
};

const CHECKLIST_ITEM_EDGE_TYPE = {
  space: APM_APP_DATA.space,
  externalId: 'referenceChecklistItems',
};

const MEASUREMENT_EDGE_TYPE = {
  space: APM_APP_DATA.space,
  externalId: 'referenceMeasurements',
};

const ITEM_PROPS = ['title', 'status', 'order', 'labels', 'description', 'note'];
const MEASUREMENT_PROPS = [
  'title',
  'type',
  'order',
  'numericReading',
  'stringReading',
  'min',
  'max',
];

type NodeIdentity = { space: string; externalId: string };

type DmNode = NodeIdentity & {
  createdTime?: number;
  lastUpdatedTime?: number;
  properties?: Record<string, Record<string, Record<string, unknown>>>;
  startNode?: NodeIdentity;
  endNode?: NodeIdentity;
};

type QueryResponse = {
  items?: Record<string, DmNode[]>;
};

type SearchResponse = {
  items?: DmNode[];
};

type ListResponse = {
  items?: DmNode[];
  nextCursor?: string;
};

/**
 * CDF-backed checklist service against ApmAppData (Checklist/ChecklistItem views).
 */
export class CdfChecklistService implements ChecklistService {
  private readonly instances: ChecklistInstancesClient;
  private readonly nowMs: () => number;

  constructor(
    client: CogniteClient | ChecklistInstancesClient,
    overrides?: Partial<CdfChecklistServiceDeps>
  ) {
    this.instances = toInstancesClient(client);
    const deps = { ...defaultDeps, ...overrides };
    this.nowMs = deps.nowMs;
  }

  async getKpis(): Promise<ChecklistKpis> {
    const summaries = await this.listChecklistSummaries();
    const kpis: ChecklistKpis = {
      toDo: 0,
      ongoing: 0,
      done: 0,
      overdue: 0,
      withNotOk: 0,
    };

    for (const summary of summaries) {
      switch (summary.status) {
        case 'ToDo':
          kpis.toDo += 1;
          break;
        case 'Ongoing':
          kpis.ongoing += 1;
          break;
        case 'Done':
          kpis.done += 1;
          break;
        case 'Overdue':
          kpis.overdue += 1;
          break;
      }
      if (summary.hasNotOk) {
        kpis.withNotOk += 1;
      }
    }

    return kpis;
  }

  async searchChecklists(query: string): Promise<ChecklistSummary[]> {
    const normalized = query.trim();
    if (!normalized) {
      return this.listChecklistSummaries();
    }

    let response: SearchResponse;
    try {
      response = await this.searchChecklistsRaw(normalized);
    } catch (error) {
      throw toCdfError('search', error);
    }

    const items = response.items ?? [];
    const checklistIds = uniqueIdentities(
      items.map((item) => ({
        space: item.space,
        externalId: item.externalId,
      }))
    );

    if (checklistIds.length === 0) {
      return [];
    }

    const notOkByChecklist = await this.loadNotOkFlags(checklistIds);
    const nowMs = Date.now();

    return items.map((node) =>
      mapChecklistToSummary(
        node.externalId,
        readChecklistProps(node),
        notOkByChecklist.has(node.externalId),
        nowMs
      )
    );
  }

  /**
   * Aggregates ChecklistItem task results for the Task Result Dashboard.
   * Period filter + series bucketing use node `lastUpdatedTime` (UTC), falling
   * back to `createdTime` when lastUpdatedTime is absent — see apm-property-map.md.
   */
  async getTaskResultDashboard(period: TaskResultPeriodPreset): Promise<TaskResultDashboardData> {
    const nowMs = this.nowMs();
    const items = await this.listTaskResultItemsForDashboard(period, nowMs);
    return aggregateTaskResults(items, period, nowMs);
  }

  async getResults(checklistId: string): Promise<ChecklistResultRow[]> {
    const query = {
      with: {
        checklists: {
          nodes: {
            filter: {
              and: [
                { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
                { equals: { property: ['node', 'externalId'], value: checklistId } },
                { hasData: [CHECKLIST_VIEW] },
              ],
            },
          },
          limit: 1,
        },
        itemEdges: {
          edges: {
            from: 'checklists',
            direction: 'outwards',
            filter: {
              equals: {
                property: ['edge', 'type'],
                value: CHECKLIST_ITEM_EDGE_TYPE,
              },
            },
          },
          limit: 1000,
        },
        items: {
          nodes: {
            from: 'itemEdges',
            direction: 'outwards',
          },
          limit: 1000,
        },
        measurementEdges: {
          edges: {
            from: 'items',
            direction: 'outwards',
            filter: {
              equals: {
                property: ['edge', 'type'],
                value: MEASUREMENT_EDGE_TYPE,
              },
            },
          },
          limit: 1000,
        },
        measurements: {
          nodes: {
            from: 'measurementEdges',
            direction: 'outwards',
          },
          limit: 1000,
        },
      },
      select: {
        items: {
          sources: [{ source: CHECKLIST_ITEM_VIEW, properties: [...ITEM_PROPS] }],
        },
        measurements: {
          sources: [{ source: MEASUREMENT_VIEW, properties: [...MEASUREMENT_PROPS] }],
        },
        itemEdges: {},
        measurementEdges: {},
      },
    };

    let response: QueryResponse;
    try {
      response = await this.queryInstances(query);
    } catch (error) {
      throw toCdfError('query', error);
    }

    const items = response.items?.items ?? [];
    const itemEdges = response.items?.itemEdges ?? [];
    const measurementEdges = response.items?.measurementEdges ?? [];
    const measurements = response.items?.measurements ?? [];

    const measurementByItem = indexMeasurementsByItem(measurementEdges, measurements);
    const orderedItemIds = itemEdges.map((edge) => endNodeExternalId(edge)).filter(isString);
    const itemsById = new Map(items.map((item) => [item.externalId, item]));

    const orderedItems =
      orderedItemIds.length > 0
        ? orderedItemIds
            .map((id) => itemsById.get(id))
            .filter((item): item is DmNode => item !== undefined)
        : [...items].sort((a, b) => {
            const orderA = readItemProps(a).order ?? 0;
            const orderB = readItemProps(b).order ?? 0;
            return orderA - orderB;
          });

    return orderedItems
      .filter((item) => {
        const props = readItemProps(item);
        const labels = props.labels ?? [];
        if (labels.some((label) => label.toLowerCase() === 'section')) {
          return false;
        }
        // Excel "Exceptions:" note placeholders are not task results.
        const title = (props.title ?? '').trim().toLowerCase();
        if (title === 'exceptions' || title === 'exceptions:') {
          return false;
        }
        return true;
      })
      .map((item) =>
        mapChecklistItemToResultRow(
          item.externalId,
          readItemProps(item),
          measurementByItem.get(item.externalId) ?? null
        )
      );
  }

  private async listChecklistSummaries(): Promise<ChecklistSummary[]> {
    const nodes = await this.listAllChecklists();
    if (nodes.length === 0) {
      return [];
    }

    const notOkByChecklist = await this.loadNotOkFlags(
      nodes.map((node) => ({ space: node.space, externalId: node.externalId }))
    );
    const nowMs = Date.now();

    return nodes.map((node) =>
      mapChecklistToSummary(
        node.externalId,
        readChecklistProps(node),
        notOkByChecklist.has(node.externalId),
        nowMs
      )
    );
  }

  private async listAllChecklists(): Promise<DmNode[]> {
    const collected: DmNode[] = [];
    let cursor: string | undefined;

    try {
      do {
        const page = await this.listInstances({
          instanceType: 'node',
          includeTyping: true,
          limit: 1000,
          cursor,
          filter: {
            and: [
              { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
              { hasData: [CHECKLIST_VIEW] },
            ],
          },
          // instances.list rejects sources[].properties in this project API version
          sources: [{ source: CHECKLIST_VIEW }],
        });
        collected.push(...(page.items ?? []));
        cursor = page.nextCursor;
      } while (cursor);
    } catch (error) {
      throw toCdfError('list', error);
    }

    return collected;
  }

  /**
   * Lists ChecklistItem nodes in the period window (paginated).
   * Server filter uses `lastUpdatedTime >= window.start`; client re-filters by
   * the resolved timestamp (lastUpdatedTime → createdTime) and countable rows.
   */
  private async listTaskResultItemsForDashboard(
    period: TaskResultPeriodPreset,
    nowMs: number
  ): Promise<TaskResultAggregateItem[]> {
    const window = resolvePeriodWindow(period, nowMs);
    const collected: TaskResultAggregateItem[] = [];
    let cursor: string | undefined;

    try {
      do {
        const page = await this.listInstances({
          instanceType: 'node',
          includeTyping: true,
          limit: 1000,
          cursor,
          filter: {
            and: [
              { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
              { hasData: [CHECKLIST_ITEM_VIEW] },
              {
                range: {
                  property: ['node', 'lastUpdatedTime'],
                  gte: window.startMs,
                },
              },
            ],
          },
          sources: [{ source: CHECKLIST_ITEM_VIEW }],
        });

        for (const node of page.items ?? []) {
          const atMs = readItemEventMs(node);
          if (atMs === null) {
            continue;
          }
          const props = readItemProps(node);
          collected.push({
            status: props.status,
            atMs,
            labels: props.labels,
            title: props.title,
          });
        }
        cursor = page.nextCursor;
      } while (cursor);
    } catch (error) {
      throw toCdfError('list', error);
    }

    return collected;
  }

  private async loadNotOkFlags(checklistIds: NodeIdentity[]): Promise<Set<string>> {
    if (checklistIds.length === 0) {
      return new Set();
    }

    const query = {
      with: {
        checklists: {
          nodes: {
            filter: {
              and: [
                { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
                {
                  in: {
                    property: ['node', 'externalId'],
                    values: checklistIds.map((id) => id.externalId),
                  },
                },
                { hasData: [CHECKLIST_VIEW] },
              ],
            },
          },
          limit: Math.min(1000, Math.max(checklistIds.length, 1)),
        },
        itemEdges: {
          edges: {
            from: 'checklists',
            direction: 'outwards',
            filter: {
              equals: {
                property: ['edge', 'type'],
                value: CHECKLIST_ITEM_EDGE_TYPE,
              },
            },
          },
          limit: 1000,
        },
        items: {
          nodes: {
            from: 'itemEdges',
            direction: 'outwards',
          },
          limit: 1000,
        },
      },
      select: {
        checklists: {
          sources: [{ source: CHECKLIST_VIEW, properties: ['title'] }],
        },
        itemEdges: {},
        items: {
          sources: [{ source: CHECKLIST_ITEM_VIEW, properties: ['status', 'labels'] }],
        },
      },
    };

    let response: QueryResponse;
    try {
      response = await this.queryInstances(query);
    } catch (error) {
      throw toCdfError('query', error);
    }

    const edges = response.items?.itemEdges ?? [];
    const items = response.items?.items ?? [];
    const itemStatusById = new Map(
      items.map((item) => [item.externalId, readItemProps(item).status])
    );

    const notOk = new Set<string>();
    for (const edge of edges) {
      const checklistId = startNodeExternalId(edge);
      const itemId = endNodeExternalId(edge);
      if (!checklistId || !itemId) continue;
      const status = itemStatusById.get(itemId);
      if (isNotOkItemStatus(status)) {
        notOk.add(checklistId);
      }
    }
    return notOk;
  }

  private async searchChecklistsRaw(query: string): Promise<SearchResponse> {
    return parseSearchResponse(
      await this.instances.search({
        view: CHECKLIST_VIEW,
        query,
        instanceType: 'node',
        properties: ['title', 'description', 'labels'],
        filter: {
          and: [
            { equals: { property: ['node', 'space'], value: INSTANCE_SPACE } },
            { hasData: [CHECKLIST_VIEW] },
          ],
        },
        limit: 100,
      })
    );
  }

  private async queryInstances(query: unknown): Promise<QueryResponse> {
    return parseQueryResponse(await this.instances.query(query));
  }

  private async listInstances(body: unknown): Promise<ListResponse> {
    return parseListResponse(await this.instances.list(body));
  }
}

function toInstancesClient(
  client: CogniteClient | ChecklistInstancesClient
): ChecklistInstancesClient {
  // Prefer CogniteClient.instances when present so the full SDK client is not
  // mistaken for the narrow instances interface.
  if (hasInstancesApi(client)) {
    return client.instances;
  }
  if (isChecklistInstancesClient(client)) {
    return client;
  }
  throw new Error('CogniteClient must expose instances.query/list/search');
}

function isChecklistInstancesClient(value: unknown): value is ChecklistInstancesClient {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('query' in value) || !('list' in value) || !('search' in value)) {
    return false;
  }
  return (
    typeof value.query === 'function' &&
    typeof value.list === 'function' &&
    typeof value.search === 'function'
  );
}

function hasInstancesApi(
  value: CogniteClient | ChecklistInstancesClient
): value is CogniteClient & { instances: ChecklistInstancesClient } {
  if (typeof value !== 'object' || value === null || !('instances' in value)) {
    return false;
  }
  return isChecklistInstancesClient(value.instances);
}

function toCdfError(operation: string, error: unknown): Error {
  if (error instanceof Error) {
    const status = readErrorStatus(error);
    if (status !== null) {
      return new Error(`CDF ${operation} failed with status ${status}`);
    }
    return new Error(`CDF ${operation} failed: ${error.message}`);
  }
  return new Error(`CDF ${operation} failed`);
}

function readErrorStatus(error: Error): number | null {
  if (!('status' in error)) {
    return null;
  }
  const status = error.status;
  return typeof status === 'number' ? status : null;
}

function viewProps(
  node: DmNode,
  view: { space: string; externalId: string; version: string }
): Record<string, unknown> {
  const bySpace = node.properties?.[view.space];
  if (!bySpace) {
    return {};
  }
  const key = `${view.externalId}/${view.version}`;
  const props = bySpace[key];
  if (!isPlainObject(props)) {
    return {};
  }
  return props;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readChecklistProps(node: DmNode) {
  const props = viewProps(node, CHECKLIST_VIEW);
  return {
    title: readOptionalString(props.title),
    status: readOptionalString(props.status),
    endTime: readOptionalStringOrNumber(props.endTime),
    labels: readOptionalStringArray(props.labels),
    description: readOptionalString(props.description),
  };
}

function readItemProps(node: DmNode) {
  const props = viewProps(node, CHECKLIST_ITEM_VIEW);
  return {
    title: readOptionalString(props.title),
    status: readOptionalString(props.status),
    order: readOptionalNumber(props.order),
    labels: readOptionalStringArray(props.labels),
    description: readOptionalString(props.description),
    note: readOptionalString(props.note),
  };
}

/**
 * Prefer node lastUpdatedTime (when the result was last written), else createdTime.
 * Values are treated as epoch milliseconds (or seconds if clearly second-scale).
 */
function readItemEventMs(node: DmNode): number | null {
  return normalizeEpochMs(node.lastUpdatedTime) ?? normalizeEpochMs(node.createdTime);
}

function normalizeEpochMs(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value < 1e12 ? value * 1000 : value;
}

function readMeasurementProps(node: DmNode): ApmMeasurementProps {
  const props = viewProps(node, MEASUREMENT_VIEW);
  return {
    title: readOptionalString(props.title),
    type: readOptionalString(props.type),
    order: readOptionalNumber(props.order),
    numericReading: readOptionalNumber(props.numericReading),
    stringReading: readOptionalString(props.stringReading),
    min: readOptionalNumber(props.min),
    max: readOptionalNumber(props.max),
  };
}

function readOptionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readOptionalStringOrNumber(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return null;
}

function readOptionalStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((entry): entry is string => typeof entry === 'string');
}

function uniqueIdentities(ids: NodeIdentity[]): NodeIdentity[] {
  const seen = new Set<string>();
  const out: NodeIdentity[] = [];
  for (const id of ids) {
    const key = `${id.space}:${id.externalId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

function startNodeExternalId(edge: DmNode): string | null {
  return edge.startNode?.externalId ?? null;
}

function endNodeExternalId(edge: DmNode): string | null {
  return edge.endNode?.externalId ?? null;
}

function isString(value: string | null): value is string {
  return typeof value === 'string';
}

function indexMeasurementsByItem(
  measurementEdges: DmNode[],
  measurements: DmNode[]
): Map<string, ApmMeasurementProps> {
  const measurementById = new Map(
    measurements.map((node) => [node.externalId, readMeasurementProps(node)])
  );
  const byItem = new Map<string, ApmMeasurementProps>();
  for (const edge of measurementEdges) {
    const itemId = startNodeExternalId(edge);
    const measurementId = endNodeExternalId(edge);
    if (!itemId || !measurementId) continue;
    const props = measurementById.get(measurementId);
    if (props) {
      byItem.set(itemId, props);
    }
  }
  return byItem;
}

function parseQueryResponse(data: unknown): QueryResponse {
  if (!isPlainObject(data)) {
    return {};
  }
  const items = data.items;
  if (!isPlainObject(items)) {
    return {};
  }
  const parsed: Record<string, DmNode[]> = {};
  for (const [key, value] of Object.entries(items)) {
    parsed[key] = Array.isArray(value) ? value.filter(isDmNode) : [];
  }
  return { items: parsed };
}

function parseSearchResponse(data: unknown): SearchResponse {
  if (!isPlainObject(data)) {
    return {};
  }
  const items = data.items;
  return { items: Array.isArray(items) ? items.filter(isDmNode) : [] };
}

function parseListResponse(data: unknown): ListResponse {
  if (!isPlainObject(data)) {
    return {};
  }
  const items = data.items;
  const nextCursor = data.nextCursor;
  return {
    items: Array.isArray(items) ? items.filter(isDmNode) : [],
    nextCursor: typeof nextCursor === 'string' ? nextCursor : undefined,
  };
}

function isDmNode(value: unknown): value is DmNode {
  if (!isPlainObject(value)) {
    return false;
  }
  return typeof value.space === 'string' && typeof value.externalId === 'string';
}
