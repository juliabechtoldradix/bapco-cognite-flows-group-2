# Scripts

## `seed-oec-apm-data.mjs`

Seeds ApmAppData `Checklist` / `ChecklistItem` instances into `bapco-flows-training-group-2` from the OEC route mapping (Excel → training data).

### When to run

Run once (or again after wiping the training space) so the Fusion app can show real CDF checklists instead of empty KPIs/lists.

### Prerequisites

Environment variables:

| Variable | Purpose |
| --- | --- |
| `CDF_URL` | Cluster base URL (e.g. `https://az-eastus-1.cognitedata.com`) |
| `CDF_PROJECT` | Project (e.g. `radix-dev`) |
| `IDP_TOKEN_URL` | Token endpoint |
| `IDP_CLIENT_ID` / `IDP_CLIENT_SECRET` | Client credentials |
| `IDP_SCOPES` | Token scopes for CDF |

Optional:

| Variable | Default / meaning |
| --- | --- |
| `SEED_SOURCE_JSON` | Local export JSON path |
| `SEED_SOURCE_SPACE` | `cognite-flows-grupo-4` — clone source space when no local export |

### Command

```bash
npm run seed:oec
```

PowerShell: load `.env` into the process environment first, then run the same command.

See also [`src/checklist/data/apm-property-map.md`](../src/checklist/data/apm-property-map.md).
