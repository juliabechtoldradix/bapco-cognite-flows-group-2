# Dev C — Shell navigation + host-synced dashboard state

**Branch:** `feat/task-result-shell`  
**Base:** `main` **after Day-0**; **rebase onto `main` after A and B merge** before opening/updating the PR  
**Paths exclusivos:**
- `src/checklist/shell/**`
- `src/checklist/state/**`
- `src/App.tsx`, `src/App.test.tsx` *(only if needed for routing/smoke)*

**Não tocar:**
- `src/checklist/contracts.ts` (Day-0)
- `src/checklist/data/**` (A)
- `src/checklist/dashboard/**` internals (B) — **only import** public `TaskResultDashboardPanel`
- `src/checklist/overview/**`, `src/checklist/quickview/**` *(except tiny prop-pass if unavoidable — prefer leave alone)*
- Prefer **not** editing `src/styles.css` unless a shell-level layout token is required (coordinate if so)

**Merge:** **LAST** among A/B/C (after A + B are on `main`).

---

## Contexto

- SPEC: FR-V2-003, FR-V2-004 (shell-level empty when view switches), SC-V2-001/002.
- Day-0 already extended `HostSyncedState` with:
  - `activeView: 'overview' | 'dashboard'`
  - `periodPreset: '24h' | '7d' | '30d'`
- `HostSyncedStateProvider` already syncs the whole state object — expose setters for the new fields from the page ViewModel.
- Mount B’s `TaskResultDashboardPanel` when `activeView === 'dashboard'`; keep v1 overview + quick view when `activeView === 'overview'`.

### UX (minimal)

- Clear control to switch Overview ↔ Dashboard (Aura Tabs / Segmented / buttons — Aura first).
- On Dashboard: pass `periodPreset` + `onPeriodChange` that updates host-synced state.
- Reload / shared URL restores `activeView` + `periodPreset` (and existing search/selection).

---

## Tarefas

- [ ] Extend page ViewModel / storage usage for `activeView` + `periodPreset` (no local `useState` for these — host storage only).
- [ ] Update `ChecklistPage` layout: nav + conditional render overview/quickview vs dashboard panel.
- [ ] Ensure overview search/selection still host-sync when on overview.
- [ ] Tests: restore `activeView`/`periodPreset` from `initialState`; switching view updates `syncInternalState`.
- [ ] Rebase on latest `main` (with A+B), fix any import-only conflicts, PR → `main`.

## Cursor prompt sugerido

> Base: main after v2 Day-0; rebase after A and B merge. Edit shell/ and state/ only. Wire host-synced `activeView` + `periodPreset`, navigate Overview ↔ Task Result Dashboard, mount `TaskResultDashboardPanel`. Do not edit data/ or dashboard internals.
