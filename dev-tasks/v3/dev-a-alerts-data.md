# Dev A — In-app notification data / derivation

**Branch:** `feat/alerts-data`  
**Base:** `main` **after Day-0 is merged**  
**Paths exclusivos:**
- `src/checklist/data/**`
- Pure helpers colocated under `src/checklist/data/` if needed (e.g. `deriveInAppNotifications.ts` + tests)
- Optional short note in `src/checklist/data/apm-property-map.md` documenting how Not OK / Done map to feed items

**Não tocar:**
- `src/checklist/contracts.ts` (frozen in Day-0 — if derivation forces a type change, open a tiny follow-up PR or ping the lead; do not silent-edit)
- `src/checklist/notifications/**`, `src/checklist/shell/**`, `src/checklist/state/**`
- `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/checklist/dashboard/**`
- `src/App.tsx`, `src/styles.css`

**Merge:** after Day-0; **parallel with B**. Prefer merge **before C** so C can smoke-test a real feed.

---

## Contexto

- SPEC: FR-V3-002, FR-V3-003, FR-V3-004, SC-V3-002, SC-V3-003.
- Interface já existe: `ChecklistService.listInAppNotifications()`.
- Day-0 Fixture already returns synthetic notifications — keep Fixture useful for UI tests; enrich if helpful (still OEC-shaped).
- Instance space: `bapco-flows-training-group-2`.
- Reuse existing v1 reads / mappers where possible:
  - **Not OK** — same signals as KPIs / results (`hasNotOk`, ChecklistItem `Not OK`, `isNotOkOutcome`, etc.).
  - **Completed** — checklist status Done (InField `Done` → UI Done).
- **No new CDF views, spaces, or writes.** Prefer reusing list/query paths already used by `getKpis` / `searchChecklists` / results; client-side derivation is expected.
- Must not call any outbound notification API.

### Output shape (contract)

Each `InAppNotification`:

| Field | Notes |
| --- | --- |
| `id` | Stable string (e.g. `notOk:{checklistId}` / `completed:{checklistId}` — document choice) |
| `trigger` | `'notOk'` \| `'completed'` only |
| `title` / `body` | Clear supervisor-facing copy |
| `checklistId` | Related checklist when known |
| `createdAt` | ISO; used for newest-first sort |

Cap list length if needed (document, e.g. 50). Empty array when nothing applies (not an error).

---

## Tarefas

- [x] Replace Cdf Day-0 stub with real `listInAppNotifications` (derive from existing APM reads; respect DMS limits — see `dm-limits-and-best-practices` skill).
- [x] Map Not OK + Done/completed into feed items (FR-V3-003); no other trigger types required.
- [x] Keep `FixtureChecklistService.listInAppNotifications` deterministic for B/C tests (at least one of each trigger).
- [x] Unit tests: derivation mapping / empty feed / error path on underlying CDF failure / assert no external send side effects.
- [x] PR → `main` (document id scheme + property mapping in PR body or `apm-property-map.md`) — PR #7.

## Cursor prompt sugerido

> Base: main after v3 Day-0. Edit only `src/checklist/data/**`. Implement `listInAppNotifications` on `CdfChecklistService` by deriving Not OK and completed-checklist items from existing APM reads (no new views, no outbound send). Keep Fixture synthetic. Do not touch contracts, notifications UI, or shell.
