# Aura Topbar setup (blocked — next steps)

The Flows `use-topbar` skill requires installing `@aura/topbar` via the **shadcn CLI only** (no custom header fallback).

## Blocker (2026-08-06)

1. Without registry config: `Unknown registry "@aura"`.
2. After adding `components.json` registries entry  
   `"@aura": "https://cognitedata.github.io/aura/r/{name}.json"`:

```text
npx shadcn@latest add @aura/topbar
→ The item at https://cognitedata.github.io/aura/r/topbar.json was not found.
```

Confirm the current Aura registry URL / item name with Cognite docs or the skill `IMPLEMENTATION.md` before retrying. Do **not** build a custom nav bar.

`components.json` in the repo root already includes the registries stub for the next attempt.

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

1. Verify the live Aura registry URL and topbar item name.
2. Run `npx shadcn@latest add @aura/topbar` successfully.
3. Compose exactly one Topbar above `ChecklistPage` content (skill RULES §12).
4. If install still fails, stop and fix the registry — no workaround header.

References: `.claude/skills/use-topbar/SKILL.md`, `IMPLEMENTATION.md`, `RULES.md`.
