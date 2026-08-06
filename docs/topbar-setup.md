# Aura Topbar setup (blocked — next steps)

The Flows `use-topbar` skill requires installing `@aura/topbar` via the **shadcn CLI only** (no custom header fallback).

## Blocker (2026-08-06)

```text
npx shadcn@latest add @aura/topbar
→ Unknown registry "@aura". Make sure it is defined under "registries"
  in your components.json or package.json
```

This repo has **no** `components.json` / Aura registry entry yet.

## Inferred product defaults (for when install is unblocked)

From `SPEC.md`, `DESIGN.md`, and `app.json`:

| Interview topic | Default for this app |
| --- | --- |
| App name | Checklist overview / International Paper · Kamyr OEC |
| Breadcrumbs | App mark + app name (no object breadcrumb on overview) |
| Middle | None (single overview page; no Tabs/Segmented) |
| Right strip | Theme menu; Share/Atlas optional later |
| Theme | Light/dark via `document.documentElement` class |
| Brand | IP green tokens already in `src/styles.css` |

## Unblock checklist

1. Add Aura shadcn registry + `components.json` per Cognite Aura docs / skill `IMPLEMENTATION.md`.
2. Run `npx shadcn@latest add @aura/topbar` (or the registry URL Cognite publishes).
3. Compose exactly one Topbar above `ChecklistPage` content (skill RULES §12).
4. Do **not** invent a custom nav bar if the registry install still fails — fix the registry instead.

References: `.claude/skills/use-topbar/SKILL.md`, `IMPLEMENTATION.md`, `RULES.md`.
