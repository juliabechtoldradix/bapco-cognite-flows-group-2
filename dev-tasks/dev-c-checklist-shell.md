# Dev C — Shell, host state, quick view, brand

**Branch:** `feat/checklist-shell`  
**Base:** `main` (after Day-0)  
**Paths exclusivos:**
- `src/checklist/shell/**`
- `src/checklist/quickview/**`
- `src/checklist/state/**` (criar)
- `src/App.tsx`, `src/App.test.tsx`
- `src/styles.css`

**Não tocar:** `src/checklist/data/**` (só importar o service), internals de `src/checklist/overview/**` (só importar o export público)

---

## Contexto

- SPEC: FR-004, FR-005, FR-006 (quick view), FR-007.
- Day-0 já tem `ChecklistPage` com slots overview + quick view (estado local temporário).
- Host state: `{ searchQuery, selectedChecklistId }` — helpers em `contracts.ts` (`parseHostSyncedState`).
- Quick view: agrupar por `section` / `equipment` quando vier nos `ChecklistResultRow`; mostrar OK/Not OK e `reading` (°F etc.) das fixtures OEC.
- Brand: tokens International Paper em `DESIGN.md`.

---

## Tarefas

- [ ] Criar `src/checklist/state/**` — storage host-synced (seed de `initialState`, push via `syncInternalState`).
- [ ] Atualizar `ChecklistPage` para usar host state (não `useState` local para search/selected).
- [ ] Implementar `ChecklistQuickView` real (substituir stub) + ViewModel + loading/error/empty.
- [ ] Wire `App.tsx`: remover welcome boilerplate; montar `ChecklistPage` dentro do `CogniteSdkProvider`.
- [ ] DI: factory `FixtureChecklistService` até CDF existir; trocar/permitir `CdfChecklistService` quando Dev A mergear.
- [ ] Aplicar tokens IP em `styles.css`.
- [ ] Atualizar `App.test.tsx` para o novo shell.
- [ ] Remover código legado fora do SPEC (`src/asset-list` etc.) se ainda existir.
- [ ] Abrir PR para `main`.

## Cursor prompt sugerido

> Edite shell, quickview, state, App.tsx e styles.css. Host-sync search + selectedChecklistId. Quick view com results agrupados (section/equipment) das fixtures OEC. Não edite overview/ nem a implementação CDF em data/.
