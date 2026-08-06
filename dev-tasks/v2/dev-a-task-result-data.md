# Dev A — Task result data / CDF aggregation

**Branch:** `feat/task-result-data`  
**Base:** `main` **after Day-0 is merged**  
**Paths exclusivos:**
- `src/checklist/data/**`
- Pure helpers colocated under `src/checklist/data/` if needed (e.g. `taskResultAggregate.ts` + tests)

**Não tocar:**
- `src/checklist/contracts.ts` (frozen in Day-0 — if CDF forces a type change, open a tiny follow-up PR or ping the lead; do not silent-edit)
- `src/checklist/dashboard/**`, `src/checklist/shell/**`, `src/checklist/state/**`, `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/App.tsx`, `src/styles.css`

**Merge:** after Day-0; **parallel with B**. Prefer merge **before C** so C can smoke-test real CDF data.

---

## Contexto

- SPEC: FR-V2-001, FR-V2-002, FR-V2-005.
- Interface já existe: `ChecklistService.getTaskResultDashboard(period)`.
- Day-0 Fixture already returns synthetic data — keep Fixture useful for UI tests; make it richer if helpful (still OEC-shaped).
- Instance space: `bapco-flows-training-group-2`.
- Views: `ChecklistItem/v7` statuses (`OK` / `Not OK` …); use timestamps available on items/checklists (`createdTime` / `lastUpdatedTime` / checklist `endTime` — document what you chose in the PR).

### Period presets (contract)

| Preset | Window (UTC or project-local — document choice) |
| --- | --- |
| `24h` | last 24 hours |
| `7d` | last 7 days *(default)* |
| `30d` | last 30 days |

### Output shape

- `breakdown.ok` / `breakdown.notOk` / `breakdown.other` — counts of **task results** (ChecklistItems), not checklists.
- `series[]` — buckets over the period (e.g. daily for `7d`/`30d`, hourly for `24h`). Each point: `{ at, ok, notOk }`.

---

## Tarefas

- [ ] Replace Cdf Day-0 stub with real `getTaskResultDashboard` (query/list + aggregate; respect DMS limits — see `dm-limits-and-best-practices` skill).
- [ ] Map item statuses → OK / Not OK / other (reuse `mapItemStatusToOutcome` / `isNotOkOutcome` where possible).
- [ ] Filter by selected period using a documented timestamp field.
- [ ] Keep `FixtureChecklistService.getTaskResultDashboard` deterministic for B/C tests.
- [ ] Unit tests: request construction / aggregation / empty period / error path.
- [ ] PR → `main` (document property → aggregation mapping in PR body or `src/checklist/data/apm-property-map.md`).

## Cursor prompt sugerido

> Base: main after v2 Day-0. Edit only `src/checklist/data/**`. Implement `getTaskResultDashboard` on `CdfChecklistService` (OK/Not OK breakdown + time series for 24h/7d/30d). Keep Fixture synthetic. Do not touch contracts, dashboard UI, or shell.
