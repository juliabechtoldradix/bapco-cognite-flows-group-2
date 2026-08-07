# ApmAppData property → app usage

Inspected in project against data model `cdf_apm` / `ApmAppData:v13`.

| View (version used by v13) | Property | App usage |
| --- | --- | --- |
| `Checklist/v7` | `title` | Checklist display name + search text; OEC route title mapping (`route1`…`route4`) |
| `Checklist/v7` | `status` | KPI status mapping: `Ready`→To Do, `In progress`/`Ongoing`→Ongoing, `Done`→Done |
| `Checklist/v7` | `endTime` | Overdue rule: past due and status ≠ Done → Overdue |
| `Checklist/v7` | `description` / `labels` | Search fields |
| `Checklist/v7` | `checklistItems` (edge `cdf_apm:referenceChecklistItems`) | Traverse checklist → items for results + Not OK KPI |
| `ChecklistItem/v7` | `title` | Result row label |
| `ChecklistItem/v7` | `status` | Result outcome (`OK` / `Not OK` / …); Not OK KPI when ≥1 Not OK item; v2 dashboard breakdown via `mapItemStatusToOutcome` (`OK`→ok, Not OK/No/Blocked→notOk, else→other) |
| `ChecklistItem/v7` | `order` | Result ordering fallback |
| `ChecklistItem/v7` | `labels` | `zone:*` → section, `equipment:*` → equipment; `section` rows filtered from results **and** from v2 task-result aggregation |
| `ChecklistItem/v7` | `description` / `note` | Reserved / debugging context |
| `ChecklistItem/v7` | `measurements` (edge `cdf_apm:referenceMeasurements`) | Optional numeric readings for measure tasks |
| `ChecklistItem` node | `lastUpdatedTime` | **v2 period filter + series bucketing** (primary). UTC epoch ms. Window presets: `24h` / `7d` / `30d` relative to request time (UTC). |
| `ChecklistItem` node | `createdTime` | **v2 fallback** when `lastUpdatedTime` is absent |
| `MeasurementReading/v4` | `numericReading`, `min`, `max`, `type` | Result `reading` value/unit/threshold |

## Task Result Dashboard aggregation (v2 / Dev A)

- Counts **ChecklistItem** task results (not checklists).
- Excludes `labels` containing `section` and title `Exceptions` / `Exceptions:` placeholders (same as quick-view results).
- Series: hourly buckets for `24h`, daily buckets for `7d` / `30d` (UTC bucket starts as ISO strings).
- Empty period → `{ ok: 0, notOk: 0, other: 0 }` and `series: []`.

## In-app notifications derivation (v3 / Dev A)

Client-side only — reuses checklist list + Not OK edge query (same as KPIs). **No new views, no CDF writes, no outbound send.**

| Signal | Source | Feed item |
| --- | --- | --- |
| Not OK | Checklist has ≥1 Not OK item (`isNotOkItemStatus` / `hasNotOk`) | `id: notOk:{checklistId}`, `trigger: 'notOk'` |
| Completed | UI status `Done` (InField `Done` / `completed`) | `id: completed:{checklistId}`, `trigger: 'completed'` |
| Ranking | Checklist node `lastUpdatedTime` (fallback `createdTime`) → `createdAt` ISO | Newest first; cap **50** |
| Empty | No Not OK and no Done checklists | `[]` (success, not an error) |

A Done checklist that also has Not OK results emits **both** items.

## Instance space

- `bapco-flows-training-group-2`

## Seed

OEC routes from `references/A Line OEC Routes.xlsx` seeded via `scripts/seed-oec-apm-data.mjs` (Excel-mapped checklist/items/edges).

```bash
npm run seed:oec
```

Requires CDF + IdP env vars documented in [`scripts/README.md`](../../../scripts/README.md).
