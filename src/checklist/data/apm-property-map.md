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
| `ChecklistItem/v7` | `status` | Result outcome (`OK` / `Not OK` / …); Not OK KPI when ≥1 Not OK item |
| `ChecklistItem/v7` | `order` | Result ordering fallback |
| `ChecklistItem/v7` | `labels` | `zone:*` → section, `equipment:*` → equipment; `section` rows filtered from results |
| `ChecklistItem/v7` | `description` / `note` | Reserved / debugging context |
| `ChecklistItem/v7` | `measurements` (edge `cdf_apm:referenceMeasurements`) | Optional numeric readings for measure tasks |
| `MeasurementReading/v4` | `numericReading`, `min`, `max`, `type` | Result `reading` value/unit/threshold |

## Instance space

- `bapco-flows-training-group-2`

## Seed

OEC routes from `references/A Line OEC Routes.xlsx` seeded via `scripts/seed-oec-apm-data.mjs` (Excel-mapped checklist/items/edges).
