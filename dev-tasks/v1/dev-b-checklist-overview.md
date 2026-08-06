# Dev B — Checklist overview UI

**Branch:** `feat/checklist-overview`  
**Base:** `main` (after Day-0)  
**Paths exclusivos:**
- `src/checklist/overview/**`

**Não tocar:** `src/checklist/data/**`, `src/checklist/quickview/**`, `src/checklist/shell/**`, `src/App.tsx`, `src/styles.css`, `src/checklist/contracts.ts` (salvo rebase se A mudar)

---

## Contexto

- SPEC: FR-002 (UI), FR-003, FR-006 (overview).
- Export Day-0: `ChecklistOverviewPanel` em `src/checklist/overview/index.ts` — **manter a assinatura de props** (ou estender de forma compatível).
- Dados: injetar `ChecklistService` (usar `FixtureChecklistService` / fixtures OEC nos testes).
- Host-sync (`syncInternalState`) **não** é seu — apenas props/callbacks: `searchQuery`, `onSearchChange`, `selectedId`, `onSelectChecklist`.
- Labels de lista: nomes das 4 rotas OEC (ex. “Route Two - Feed System”).

---

## Tarefas

- [x] Substituir o stub de `ChecklistOverviewPanel` pela UI real (Aura, import por subpath).
- [x] `KpiStrip` — To Do, Ongoing, Done, Overdue, Not OK (`ChecklistKpis`).
- [x] `ChecklistSearch` — debounce (SC-002).
- [x] `ChecklistList` — seleção, empty / loading / error.
- [x] `OverviewUiState` + `useChecklistOverviewViewModel` (ViewModel sem `useState` interno; estado no storage compartilhado).
- [x] `ChecklistOverviewViewModelContext` com DI do `ChecklistService`.
- [x] Testes de view + view model (loading / success / error / empty).
- [x] Alinhar visual a `DESIGN.md` (sem editar `styles.css` global — tokens vêm do Dev C).
- [x] Abrir PR para `main` — merged as PR #1.

## Cursor prompt sugerido

> Edite somente `src/checklist/overview/**`. Implemente KPI strip, search com debounce e lista usando `ChecklistService` injetado e fixtures OEC. Mantenha a API pública de `ChecklistOverviewPanel`. Não chame `syncInternalState`. Não altere App.tsx.
