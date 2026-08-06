/**
 * Seeds ApmAppData Checklist / ChecklistItem instances for group 2
 * from the OEC Excel-mapped export (cloned from cognite-flows-grupo-4 seed).
 *
 * Usage (PowerShell):
 *   # load .env into process env, then:
 *   node scripts/seed-oec-apm-data.mjs
 *
 * Requires: CDF_URL, CDF_PROJECT, IDP_TOKEN_URL, IDP_CLIENT_ID, IDP_CLIENT_SECRET, IDP_SCOPES
 * Optional:
 *   SEED_SOURCE_JSON — local export path (default tmp-grupo4-export.json if present)
 *   SEED_SOURCE_SPACE — CDF space to clone from when no local export (default cognite-flows-grupo-4)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TARGET_SPACE = 'bapco-flows-training-group-2';
const DEFAULT_SOURCE_SPACE = 'cognite-flows-grupo-4';
const CHECKLIST_VIEW = {
  type: 'view',
  space: 'cdf_apm',
  externalId: 'Checklist',
  version: 'v7',
};
const ITEM_VIEW = {
  type: 'view',
  space: 'cdf_apm',
  externalId: 'ChecklistItem',
  version: 'v7',
};
const EDGE_TYPE = { space: 'cdf_apm', externalId: 'referenceChecklistItems' };

/** Align seeded checklist statuses with SPEC KPIs + fixtures. */
const ROUTE_SEED = {
  'route-1': {
    status: 'Ready',
    endTime: null,
    keepNotOk: true,
  },
  'route-2': {
    status: 'In progress',
    endTime: null,
    keepNotOk: false,
  },
  'route-3': {
    status: 'Done',
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    keepNotOk: true,
  },
  'route-4': {
    status: 'Ready',
    // overdue: due date in the past, status ≠ Done
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    keepNotOk: false,
  },
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function getToken() {
  const body = new URLSearchParams({
    client_id: requiredEnv('IDP_CLIENT_ID'),
    client_secret: requiredEnv('IDP_CLIENT_SECRET'),
    scope: requiredEnv('IDP_SCOPES'),
    grant_type: 'client_credentials',
  });
  const res = await fetch(requiredEnv('IDP_TOKEN_URL'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

function apiBase() {
  return `${requiredEnv('CDF_URL').replace(/\/$/, '')}/api/v1/projects/${requiredEnv('CDF_PROJECT')}`;
}

async function cdfFetch(token, method, apiPath, body) {
  const res = await fetch(`${apiBase()}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${apiPath} failed: ${res.status} ${text}`);
  }
  return json;
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function routeKeyFromExternalId(externalId) {
  const match = /^seed:oec:(route-\d+):/.exec(externalId);
  return match ? match[1] : null;
}

function mapItemStatus(status, keepNotOk) {
  if (status === 'Not OK') {
    return keepNotOk ? 'Not OK' : 'OK';
  }
  if (status === 'To Do') {
    return 'To Do';
  }
  return status === 'OK' ? 'OK' : status;
}

function toChecklistUpsert(node) {
  const route = routeKeyFromExternalId(node.externalId);
  const seed = route ? ROUTE_SEED[route] : undefined;
  const props = node.properties?.cdf_apm?.['Checklist/v7'] ?? {};
  const next = {
    title: props.title,
    description: props.description,
    labels: props.labels,
    type: props.type ?? 'OEC Route',
    status: seed?.status ?? props.status ?? 'Ready',
    visibility: props.visibility ?? 'PUBLIC',
    isArchived: props.isArchived ?? false,
    source: props.source ?? 'A Line OEC Routes.xlsx',
    sourceId: props.sourceId,
    assignedTo: props.assignedTo,
  };
  if (seed?.endTime) {
    next.endTime = seed.endTime;
  }
  return {
    instanceType: 'node',
    space: TARGET_SPACE,
    externalId: node.externalId,
    sources: [
      {
        source: CHECKLIST_VIEW,
        properties: next,
      },
    ],
  };
}

function toItemUpsert(node) {
  const route = routeKeyFromExternalId(node.externalId);
  const seed = route ? ROUTE_SEED[route] : undefined;
  const props = node.properties?.cdf_apm?.['ChecklistItem/v7'] ?? {};
  const next = {
    title: props.title,
    description: props.description,
    labels: props.labels,
    order: props.order,
    status: mapItemStatus(props.status, seed?.keepNotOk ?? true),
    note: props.note,
    visibility: props.visibility ?? 'PUBLIC',
    isArchived: props.isArchived ?? false,
    source: props.source ?? 'A Line OEC Routes.xlsx',
    sourceId: props.sourceId,
  };
  // Omit asset/createdBy/updatedBy to avoid missing direct-relation targets.
  return {
    instanceType: 'node',
    space: TARGET_SPACE,
    externalId: node.externalId,
    sources: [
      {
        source: ITEM_VIEW,
        properties: next,
      },
    ],
  };
}

function toEdgeUpsert(edge) {
  return {
    instanceType: 'edge',
    space: TARGET_SPACE,
    externalId: edge.externalId,
    type: EDGE_TYPE,
    startNode: {
      space: TARGET_SPACE,
      externalId: edge.startNode.externalId,
    },
    endNode: {
      space: TARGET_SPACE,
      externalId: edge.endNode.externalId,
    },
  };
}

async function ensureSpace(token) {
  await cdfFetch(token, 'POST', '/models/spaces', {
    items: [
      {
        space: TARGET_SPACE,
        name: 'BAPCO Flows Training Group 2',
        description: 'Instance space for group 2 OEC checklist training data (ApmAppData).',
      },
    ],
  });
  console.log(`Space ensured: ${TARGET_SPACE}`);
}

async function upsertBatches(token, items, label) {
  let done = 0;
  for (const batch of chunk(items, 1000)) {
    await cdfFetch(token, 'POST', '/models/instances', {
      items: batch,
      autoCreateDirectRelations: false,
      skipOnVersionConflict: false,
      replace: false,
    });
    done += batch.length;
    console.log(`Upserted ${label}: ${done}/${items.length}`);
  }
}

async function listAll(token, body) {
  const items = [];
  let cursor;
  do {
    const page = await cdfFetch(token, 'POST', '/models/instances/list', {
      ...body,
      cursor,
      limit: 1000,
    });
    items.push(...(page.items ?? []));
    cursor = page.nextCursor;
  } while (cursor);
  return items;
}

async function fetchSourceFromCdf(token, sourceSpace) {
  const spaceFilter = {
    and: [
      { equals: { property: ['node', 'space'], value: sourceSpace } },
      { prefix: { property: ['node', 'externalId'], value: 'seed:oec:' } },
    ],
  };
  const edgeFilter = {
    and: [
      { equals: { property: ['edge', 'space'], value: sourceSpace } },
      { prefix: { property: ['edge', 'externalId'], value: 'seed:oec:' } },
    ],
  };

  const checklists = await listAll(token, {
    instanceType: 'node',
    includeTyping: true,
    filter: spaceFilter,
    sources: [{ source: CHECKLIST_VIEW }],
  });
  const items = await listAll(token, {
    instanceType: 'node',
    includeTyping: true,
    filter: spaceFilter,
    sources: [{ source: ITEM_VIEW }],
  });
  const edges = await listAll(token, {
    instanceType: 'edge',
    filter: edgeFilter,
  });

  return { checklists, items, edges };
}

async function loadSource(token) {
  const sourcePath = process.env.SEED_SOURCE_JSON
    ? path.resolve(process.env.SEED_SOURCE_JSON)
    : path.join(ROOT, 'tmp-grupo4-export.json');

  if (fs.existsSync(sourcePath)) {
    console.log(`Loading source export: ${sourcePath}`);
    return JSON.parse(fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, ''));
  }

  const sourceSpace = process.env.SEED_SOURCE_SPACE || DEFAULT_SOURCE_SPACE;
  console.log(`No local export found; cloning OEC seed from space ${sourceSpace}`);
  return fetchSourceFromCdf(token, sourceSpace);
}

async function main() {
  const token = await getToken();
  const raw = await loadSource(token);
  const checklists = (raw.checklists ?? []).map(toChecklistUpsert);
  const items = (raw.items ?? []).map(toItemUpsert);
  const edges = (raw.edges ?? []).map(toEdgeUpsert);

  console.log(
    `Prepared upserts: checklists=${checklists.length} items=${items.length} edges=${edges.length}`
  );

  await ensureSpace(token);
  await upsertBatches(token, checklists, 'checklists');
  await upsertBatches(token, items, 'items');
  await upsertBatches(token, edges, 'edges');

  console.log('Seed complete.');
  console.log(
    JSON.stringify(
      {
        space: TARGET_SPACE,
        routes: Object.fromEntries(
          Object.entries(ROUTE_SEED).map(([k, v]) => [
            k,
            { status: v.status, endTime: v.endTime, keepNotOk: v.keepNotOk },
          ])
        ),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
