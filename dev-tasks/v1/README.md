# Dev tasks — v1 Checklist KPIs + Overview *(complete)*

Day-0 (`src/checklist/` contracts + OEC fixtures + stubs) landed on `main`. Devs A/B/C worked in parallel; all PRs merged.

| Dev | Branch | Task file |
| --- | --- | --- |
| A — Data / CDF | `feat/checklist-data` | [dev-a-checklist-data.md](./dev-a-checklist-data.md) |
| B — Overview UI | `feat/checklist-overview` | [dev-b-checklist-overview.md](./dev-b-checklist-overview.md) |
| C — Shell / host / quick view | `feat/checklist-shell` | [dev-c-checklist-shell.md](./dev-c-checklist-shell.md) |

**Status:** PRs #1 (overview), #2 (data), and #3 (shell) are merged to `main`. Production wires `CdfChecklistService`; seed with `npm run seed:oec` when the training space is empty.

For the next release see [../v2/](../v2/).
