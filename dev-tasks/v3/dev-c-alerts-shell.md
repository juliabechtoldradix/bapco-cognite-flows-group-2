# Dev C — Shell chrome + host-synced notification read state

**Branch:** `feat/alerts-shell`  
**Base:** `main` **after Day-0**; **rebase onto `main` after A and B merge** before opening/updating the PR  
**Paths exclusivos:**
- `src/checklist/shell/**`
- `src/checklist/state/**`
- `src/App.tsx`, `src/App.test.tsx` *(only if needed for smoke)*

**Não tocar:**
- `src/checklist/contracts.ts` (Day-0)
- `src/checklist/data/**` (A)
- `src/checklist/notifications/**` internals (B) — **only import** public `NotificationsBell`
- `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/checklist/dashboard/**` *(except tiny prop-pass if unavoidable — prefer leave alone)*
- Prefer **not** editing `src/styles.css` unless a shell-level layout token is required (coordinate if so)

**Merge:** **LAST** among A/B/C (after A + B are on `main`).

---

## Contexto

- SPEC: FR-V3-001 (visible in chrome), FR-V3-007, SC-V3-001.
- Day-0 already extended `HostSyncedState` with:
  - `readNotificationIds: string[]`
- `HostSyncedStateProvider` already syncs the whole state object — expose a setter / updater for read ids from the page ViewModel (append-only or toggle — document; prefer mark-read without duplicates).
- Mount B’s `NotificationsBell` in the app chrome (header / top of `ChecklistPage`) so it remains visible on Overview **and** Dashboard.
- Pass:
  - `readNotificationIds` from host storage
  - `onMarkRead` → updates host-synced state via existing sync path
  - optional `onSelectNotification` → may set `selectedChecklistId` + switch to overview (nice-to-have; skip if it risks overview churn — document choice in PR)

### UX (minimal)

- Bell always visible in shell chrome while the checklist app is shown.
- Opening/closing the popup must not change `activeView` or wipe overview selection.
- Reload / shared URL restores `readNotificationIds` (and existing v1/v2 fields).

---

## Tarefas

- [x] Extend page ViewModel / storage usage for `readNotificationIds` (no local `useState` for these — host storage only).
- [x] Update `ChecklistPage` (or shell header) layout: mount `NotificationsBell` with host-wired props.
- [ ] Ensure overview + dashboard + host sync of search / selection / view / period still work.
- [ ] Tests: restore `readNotificationIds` from `initialState`; marking read updates `syncInternalState`; bell present on overview and dashboard.
- [ ] Rebase on latest `main` (with A+B), fix any import-only conflicts, PR → `main`.

**Note:** `onSelectNotification` skipped for MVP (avoids overview selection churn). Feed is mark-read + display only until a later follow-up.

## Cursor prompt sugerido

> Base: main after v3 Day-0; rebase after A and B merge. Edit shell/ and state/ only. Wire host-synced `readNotificationIds`, mount `NotificationsBell` in app chrome on overview and dashboard. Do not edit data/ or notifications internals.
