# Dev tasks — Checklist KPIs + Overview

Day-0 (`src/checklist/` contracts + OEC fixtures + stubs) is already on `main`.

Work **in parallel** from updated `main`. Own only the paths listed in your file.

| Dev | Branch | Task file |
| --- | --- | --- |
| A — Data / CDF | `feat/checklist-data` | [dev-a-checklist-data.md](./dev-a-checklist-data.md) |
| B — Overview UI | `feat/checklist-overview` | [dev-b-checklist-overview.md](./dev-b-checklist-overview.md) |
| C — Shell / host / quick view | `feat/checklist-shell` | [dev-c-checklist-shell.md](./dev-c-checklist-shell.md) |

Sources: `SPEC.md`, `DESIGN.md`, `references/A Line OEC Routes.xlsx`.

**Status:** PRs #1 (overview), #2 (data), and #3 (shell) are merged to `main`. Production wires `CdfChecklistService`; seed with `npm run seed:oec` when the training space is empty.
