# Dev B — Task Result Dashboard UI

**Branch:** `feat/task-result-dashboard-ui`  
**Base:** `main` **after Day-0 is merged**  
**Paths exclusivos:**
- `src/checklist/dashboard/**` *(replace Day-0 stubs)*

**Não tocar:**
- `src/checklist/contracts.ts`
- `src/checklist/data/**`
- `src/checklist/shell/**`, `src/checklist/state/**`, `src/App.tsx`, `src/styles.css`
- `src/checklist/overview/**`, `src/checklist/quickview/**`

**Merge:** after Day-0; **parallel with A**. Prefer merge **before C**.

---

## Contexto

- SPEC: FR-V2-001, FR-V2-002, FR-V2-004 (dashboard UI states).
- Public export Day-0: `TaskResultDashboardPanel` — **keep the props API** from `dashboard/index.ts` (or extend compatibly with optional props only).
- Data: inject `ChecklistService` via context/provider pattern (mirror overview: `TaskResultDashboardViewModelProvider` or consume `ChecklistServiceContext` from shell — prefer a local provider so tests do not need the full page).
- Host-sync of `periodPreset` is **not** your job — receive `periodPreset` + `onPeriodChange` as props (C wires host state).
- Visual: Aura subpath imports; IP tokens from existing `styles.css` (do not edit global CSS).

### UI expectations

1. **Outcome breakdown** — OK vs Not OK (and optional “other”) from `TaskResultDashboardData.breakdown` (cards / counts / simple bar — Aura first).
2. **Time-series** — `series` over the selected period (simple chart or Aura-friendly list/table of points if no chart primitive fits; avoid heavy new deps unless already in the app).
3. **Period control** — control bound to props (`24h` / `7d` / `30d`); calling `onPeriodChange` only — no `syncInternalState`.
4. Loading / error / empty states (FR-V2-004).

---

## Tarefas

- [ ] Replace stub `TaskResultDashboardPanel` with real UI + ViewModel (no `useState` inside the VM hook; shared storage/provider for load state).
- [ ] Wire `getTaskResultDashboard(periodPreset)` via injected service; refetch when period prop changes.
- [ ] Tests: loading / success / error / empty; period change calls `onPeriodChange`.
- [ ] Use Fixture (or mock service) in tests — do not call live CDF.
- [ ] PR → `main`.

## Cursor prompt sugerido

> Base: main after v2 Day-0. Edit only `src/checklist/dashboard/**`. Implement Task Result Dashboard UI (OK/Not OK breakdown + series) behind `TaskResultDashboardPanel` props. Period via props/callbacks only — no host sync. No edits to data/, shell/, or contracts.
