# Join / final integration — v3 Alerts and Notifications

Run **after** Day-0, A, B, and C are on `main`.  
**May be done directly on `main`** (checklist + docs only).

## Commit / PR order (recap)

| Order | Branch | What lands |
| --- | --- | --- |
| 1 | `feat/alerts-day0` | Contracts + stubs |
| 2a | `feat/alerts-data` | CDF + Fixture derivation (parallel with 2b) |
| 2b | `feat/alerts-notifications-ui` | Bell + popup UI (parallel with 2a) |
| 3 | `feat/alerts-shell` | Chrome mount + host sync wiring |
| 4 | this checklist | Smoke / docs / checkbox cleanup |

If A and B both open PRs, either merge order is fine (disjoint paths). **C must rebase after both.**

## Integration checklist

- [ ] `npm test` / `npm run lint` / `npm run build` green on `main`.
- [ ] Overview (v1) still works: KPIs, search, quick view, host restore of search + selected id.
- [ ] Dashboard (v2) still works: period + active view host restore, OK/Not OK breakdown.
- [ ] Bell visible in app chrome on Overview and Dashboard (SC-V3-001).
- [ ] Opening the popup shows Not OK and/or completed items when data exists (or Fixture/demo feed) (SC-V3-002).
- [ ] Empty / loading / error states in the open popup (FR-V3-005).
- [ ] Closing the popup leaves the current view unchanged.
- [ ] Marking read persists across reload / shared URL when `readNotificationIds` is host-synced (FR-V3-007).
- [ ] Confirm **no** external notification send path exists (FR-V3-004 / SC-V3-003).
- [ ] Confirm **no** new CDF notification views/spaces were added.
- [ ] Update this folder’s task checkboxes / mark v3 status in [README.md](./README.md) and root [dev-tasks/README.md](../README.md) when done.

## Conflict triage (if something still clashes)

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| TS: `ChecklistService` missing method | Branch not based on Day-0 | Rebase on `main` after Day-0 |
| Conflict in `contracts.ts` | Someone edited outside Day-0 | Revert local contract edits; extend via small Day-0 follow-up PR |
| Conflict in `ChecklistPage.tsx` | A/B touched shell | Keep C’s wiring; import only B’s `NotificationsBell` + A’s service via existing DI |
| Conflict in `notifications/index.ts` | Day-0 vs B | Prefer B’s implementation; keep Day-0 prop names |

## Out of scope (do not sneak into join)

- External delivery channels (email / SMS / push / agent).
- CDF schema changes for notification storage.
- Admin UX for customizable recipients / triggers / formats.

**Status:** Pending until Day-0 + A/B/C land.
