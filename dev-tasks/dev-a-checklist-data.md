# Dev A — Checklist data / CDF

**Branch:** `feat/checklist-data`  
**Base:** `main` (after Day-0)  
**Paths exclusivos:**
- `src/checklist/data/**` (exceto manter a interface usada pelo shell)
- `src/checklist/mappers.ts` (criar se precisar)
- Atualizar `src/checklist/contracts.ts` **somente** se propriedades reais do `ApmAppData:v13` exigirem — avisar B/C para rebase

**Não tocar:** `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/checklist/shell/**`, `src/App.tsx`, `src/styles.css`

---

## Contexto

- SPEC: FR-001, FR-002 (cálculo), leitura APM.
- Model: `cdf_apm` / `ApmAppData:v13`.
- Instance space: `bapco-flows-training-group-2` (`INSTANCE_SPACE` em `contracts.ts`).
- Domínio OEC: 4 rotas em `references/A Line OEC Routes.xlsx` ↔ fixtures em `src/checklist/fixtures/oecRoutes.ts`.
- Views alvo: `Checklist` (status/KPIs/search), `ChecklistItem` (results + Not OK). Confirmar property names no projeto.

### Status SPEC ↔ InField (esperado)

| SPEC (UI) | Regra / origem |
| --- | --- |
| To Do | Ready (ou equivalente) |
| Ongoing | In progress |
| Done | Done |
| Overdue | due date no passado e status ≠ Done |
| Not OK KPI | checklists com ≥1 item Not OK |

---

## Tarefas

- [x] Inspecionar `ApmAppData:v13` no CDF e documentar no PR a tabela `property → uso`.
- [x] Implementar `CdfChecklistService` (classe + interface `ChecklistService`), DI com `CogniteClient`.
- [x] `getKpis()` — To Do / Ongoing / Done / Overdue + `withNotOk`.
- [x] `searchChecklists(query)` — preferir `instances.search` + hydrate (`dm-graph-traversal`).
- [x] `getResults(checklistId)` — `instances.query` Checklist → ChecklistItems (+ measurements).
- [x] Mapear títulos das rotas OEC ↔ checklists no training space quando existirem.
- [x] Manter `FixtureChecklistService` utilizável para UI local / testes sem CDF.
- [x] Testes: request shape, parse, erro non-OK; mappers puros.
- [ ] Abrir PR para `main` (pode mergear em qualquer ordem após Day-0).

## Cursor prompt sugerido

> Edite somente `src/checklist/data/**` e mappers. Implemente `CdfChecklistService` contra `ApmAppData:v13` no space `bapco-flows-training-group-2`. Respeite `src/checklist/contracts.ts`. Não altere App.tsx nem overview/quickview/shell.
