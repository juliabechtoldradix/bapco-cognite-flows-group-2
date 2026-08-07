# Dev B — Notifications bell + popup UI

**Branch:** `feat/alerts-notifications-ui`  
**Base:** `main` **after Day-0 is merged**  
**Paths exclusivos:**
- `src/checklist/notifications/**` *(replace Day-0 stubs)*

**Não tocar:**
- `src/checklist/contracts.ts`
- `src/checklist/data/**`
- `src/checklist/shell/**`, `src/checklist/state/**`, `src/App.tsx`, `src/styles.css`
- `src/checklist/overview/**`, `src/checklist/quickview/**`, `src/checklist/dashboard/**`

**Merge:** after Day-0; **parallel with A**. Prefer merge **before C**.

---

## Contexto

- SPEC: FR-V3-001, FR-V3-005, FR-V3-006 (UI states + Aura / DESIGN tokens).
- Public export Day-0: `NotificationsBell` — **keep the props API** from `notifications/index.ts` (or extend compatibly with optional props only).
- Data: inject `ChecklistService` via context/provider pattern (mirror dashboard/overview — local `NotificationsViewModelProvider` or consume `ChecklistServiceContext`; prefer a local provider so tests do not need the full page).
- Host-sync of `readNotificationIds` is **not** your job — receive `readNotificationIds` + `onMarkRead` as props (C wires host state).
- Popup open/closed is **local UI state** (shared storage/provider under `notifications/`, not host sync).
- Visual: Aura subpath imports (`@cognite/aura/components/...`); IP tokens from existing `styles.css` (do not edit global CSS). Check Aura for IconButton / Popover / Menu / EmptyState before custom markup (`design` skill).

### UI expectations

1. **Bell control** — icon button visible; opens a popup/popover/panel (FR-V3-001).
2. **Feed list** — rows from `listInAppNotifications()` showing trigger-appropriate copy (Not OK vs completed). Unread vs read affordance using `readNotificationIds` (e.g. emphasis / badge count).
3. **Mark read** — interacting with a row (or an explicit control) calls `onMarkRead(id)` only — no `syncInternalState`.
4. **Loading / error / empty** states inside the open popup (FR-V3-005).
5. Closing the popup (click bell again / dismiss) leaves the underlying page view unchanged.
6. Optional: call `onSelectNotification` when a row is chosen (nice-to-have; C may no-op or select checklist later).

---

## Tarefas

- [x] Replace stub `NotificationsBell` with real UI + ViewModel (no `useState` inside the VM hook; shared storage/provider for load + popup-open state).
- [x] Wire `listInAppNotifications()` via injected service; show loading/error/empty correctly.
- [x] Tests: loading / success / error / empty; open/close popup; mark-read calls `onMarkRead`; unread badge behavior if implemented.
- [x] Use Fixture (or mock service) in tests — do not call live CDF.
- [x] PR → `main` — PR #8.

## Cursor prompt sugerido

> Base: main after v3 Day-0. Edit only `src/checklist/notifications/**`. Implement NotificationsBell (Aura bell + popup feed) behind Day-0 props. Read markers via props/callbacks only — no host sync. Loading/error/empty required. No edits to data/, shell/, or contracts.
