---
version: alpha
name: International Paper × Aura
description: Brand design contract for the Cognite Flows app — International Paper palette on Aura primitives for data-heavy industrial UI.
colors:
  primary: '#006963'
  secondary: '#E8EAEC'
  tertiary: '#00AB5F'
  neutral: '#F1F3F5'
  background: '#FFFFFF'
  foreground: '#15191E'
  alternate-background: '#F9FAFA'
  card-background: '#F9FAFA'
  muted-background: '#F1F3F5'
  muted-foreground: '#6D767E'
  primary-background-hover: '#005550'
  secondary-background-hover: '#D4D7D9'
  foreground-on-primary: '#FFFFFF'
  secondary-foreground: '#40464A'
  link-foreground: '#00AB5F'
  border: '#E8EAEC'
  border-emphasized: '#D4D7D9'
  ring: '#4A9B94'
  ring-muted: '#A3D0CC'
  info-background: '#C5E8F0'
  info-foreground-on-info: '#0D5A6B'
  info-base: '#61C4DB'
  success-background: '#AED49A'
  success-foreground: '#00AB5F'
  success-foreground-on-success: '#006963'
  warning-background: '#FCBD44'
  warning-foreground-on-warning: '#5A4000'
  destructive-background: '#FCCAD2'
  destructive-foreground-on-critical: '#8D081F'
  decorative-earth: '#624C3B'
  overlay-background: '#7C868E80'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: -0.08px
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.08px
  h2:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.08px
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.04px
  h4:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.04px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: -0.04px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: -0.04px
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: -0.04px
  code:
    fontFamily: Source Code Pro
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  3xl: 24px
  4xl: 32px
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  prose-max: 600px
  container-2xl: 640px
  container-8xl: 1536px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.foreground-on-primary}'
    rounded: '{rounded.lg}'
    padding: '{spacing.md}'
    height: 36px
  button-primary-hover:
    backgroundColor: '{colors.primary-background-hover}'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: '{spacing.md}'
    height: 36px
  button-destructive:
    backgroundColor: '{colors.destructive-background}'
    textColor: '{colors.destructive-foreground-on-critical}'
    rounded: '{rounded.lg}'
    height: 36px
  button-sm:
    height: 28px
    rounded: '{rounded.lg}'
  button-lg:
    height: 40px
    rounded: '{rounded.lg}'
  button-secondary-hover:
    backgroundColor: '{colors.secondary-background-hover}'
  input-default:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    height: 36px
  input-muted:
    backgroundColor: '{colors.muted-background}'
    textColor: '{colors.muted-foreground}'
    rounded: '{rounded.lg}'
    height: 36px
  dialog-overlay:
    backgroundColor: '{colors.overlay-background}'
  divider-default:
    backgroundColor: '{colors.border}'
  divider-emphasized:
    backgroundColor: '{colors.border-emphasized}'
  badge-neutral:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.secondary-foreground}'
    rounded: '{rounded.sm}'
  panel-alternate:
    backgroundColor: '{colors.alternate-background}'
    textColor: '{colors.foreground}'
  card-default:
    backgroundColor: '{colors.card-background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.xl}'
    padding: '{spacing.lg}'
  link-default:
    textColor: '{colors.link-foreground}'
    typography: '{typography.body-md}'
  badge-xs:
    height: 20px
    rounded: '{rounded.sm}'
  alert-info:
    backgroundColor: '{colors.info-background}'
    textColor: '{colors.info-foreground-on-info}'
    rounded: '{rounded.lg}'
  alert-success:
    backgroundColor: '{colors.success-background}'
    textColor: '{colors.success-foreground-on-success}'
    rounded: '{rounded.lg}'
  alert-warning:
    backgroundColor: '{colors.warning-background}'
    textColor: '{colors.warning-foreground-on-warning}'
    rounded: '{rounded.lg}'
  alert-destructive:
    backgroundColor: '{colors.destructive-background}'
    textColor: '{colors.destructive-foreground-on-critical}'
    rounded: '{rounded.lg}'
---

## Overview

This app uses **Aura** primitives with an **International Paper** brand skin. The experience should feel like an industrial control room: quiet surfaces, stable hierarchy, immediate status signals, and controls that stay out of the operator’s way until action is needed.

International Paper Green (`#006963`) is the dominant brand signal — primary actions, focus rings, and chrome weight. Clover Green (`#00AB5F`) is the bright accent for links and strong success text. Most of the UI remains neutral white and light grey so semantic color can mean something when it appears.

**Tokens:** Reference values live in the YAML front matter above. Prose below carries design intent and constraints. Reference tokens as `{colors.<name>}`, `{spacing.<name>}`, `{typography.<name>}`, `{rounded.<name>}`, and `{components.<name>}`.

Product typography stays Aura Inter (and Space Grotesk for display). Do not introduce IP marketing typefaces into the product UI.

---

## Brand color hierarchy

Source of truth for brand weight: [`references/Radix Onsite Dune Certification Workshop Day 1.png`](references/Radix%20Onsite%20Dune%20Certification%20Workshop%20Day%201.png). **Larger box = higher priority in the system.**

| Order | Swatch | HEX | Role |
| --- | --- | --- | --- |
| 1 (largest) | International Paper Green | `#006963` | `{colors.primary}` — CTAs, brand chrome, primary actions |
| 2 | Clover Green | `#00AB5F` | `{colors.link-foreground}` / `{colors.tertiary}` / `{colors.success-foreground}` |
| 3 | White | `#FFFFFF` | `{colors.background}` — page canvas and popovers |
| 4 (medium) | Near-black | `#15191E` | `{colors.foreground}` — primary text and icons |
| 4 | Warning amber | `#FCBD44` | `{colors.warning-background}` |
| 4 | Info blue | `#61C4DB` | `{colors.info-base}` (family seed for info surfaces) |
| 4 | Soft green | `#AED49A` | `{colors.success-background}` |
| 4 | Brown | `#624C3B` | `{colors.decorative-earth}` — decorative only |
| 5 (smallest) | Light grey | `#F1F3F5` | `{colors.muted-background}` / `{colors.neutral}` |

**Destructive red is not in the IP board.** Keep Aura’s destructive pair (`#FCCAD2` / `#8D081F`) so error stays visually distinct from warning and accessible under pressure.

Logo reference: [`references/International Paper logo and symbol, meaning, history, PNG.png`](references/International%20Paper%20logo%20and%20symbol,%20meaning,%20history,%20PNG.png) — wordmark and leaf mark in IP Green on white.

---

## Colors

Aura color behaves like instrumentation: most of the interface is neutral structure; important changes appear as clear signals; decorative color is rare and never competes with status.

| Layer | Share of UI | Purpose |
| --- | --- | --- |
| Base | ~80–90% | Page, cards, text, borders, focus, chrome |
| Semantic | ~5–10% | Info, success, warning, destructive, validation |
| Decorative | ~5–10% | Non-status accents (earth brown, clover markers) |

Never hardcode hex in product components when a token exists. Prefer Tailwind semantic utilities (`bg-primary-background`, `text-foreground`, `bg-success-background`, …).

### Base

| Token | Value | Use |
| --- | --- | --- |
| `{colors.background}` | `#FFFFFF` | Page base |
| `{colors.alternate-background}` | `#F9FAFA` | Distinct blocks from page base |
| `{colors.card-background}` | `#F9FAFA` | Cards without drop shadow |
| `{colors.muted-background}` | `#F1F3F5` | Static fills, muted chrome |
| `{colors.primary}` | `#006963` | Primary actions (`primary-background`) |
| `{colors.primary-background-hover}` | `#005550` | Hover on primary |
| `{colors.foreground-on-primary}` | `#FFFFFF` | Text/icons on primary fill |
| `{colors.foreground}` | `#15191E` | Primary text and icons |
| `{colors.secondary-foreground}` | `#40464A` | Supporting text |
| `{colors.muted-foreground}` | `#6D767E` | Tertiary / low emphasis |
| `{colors.link-foreground}` | `#00AB5F` | Text links (Clover — distinct from primary fill) |
| `{colors.secondary}` | `#E8EAEC` | Secondary button / quiet fills |
| `{colors.border}` | `#E8EAEC` | Default strokes |
| `{colors.border-emphasized}` | `#D4D7D9` | Stronger separation |
| `{colors.ring}` | `#4A9B94` | Focus ring (IP-tinted) |
| `{colors.ring-muted}` | `#A3D0CC` | Focus ring companion |
| `{colors.neutral}` | `#F1F3F5` | Neutral badge / muted status surface |

### Semantic — status and alerts

Semantic tokens are **only** for status and system feedback (Alert, Banner, Sonner, badge status variants, validation). Do not use them as generic card fills, selection states, or decoration.

**Info** (seed `#61C4DB`)

| Token | Value | Use |
| --- | --- | --- |
| `{colors.info-base}` | `#61C4DB` | Brand info seed / strong accents near info |
| `{colors.info-background}` | `#C5E8F0` | Info Alert / Banner surface |
| `{colors.info-foreground-on-info}` | `#0D5A6B` | Text **on** info surface (AA) |

**Success** (surface `#AED49A`, strong `#00AB5F`, on-success `#006963`)

| Token | Value | Use |
| --- | --- | --- |
| `{colors.success-background}` | `#AED49A` | Success Alert surface |
| `{colors.success-foreground}` | `#00AB5F` | Success text near content (Clover) |
| `{colors.success-foreground-on-success}` | `#006963` | Text **on** success surface (IP Green) |

**Warning** (seed `#FCBD44`)

| Token | Value | Use |
| --- | --- | --- |
| `{colors.warning-background}` | `#FCBD44` | Warning Alert surface |
| `{colors.warning-foreground-on-warning}` | `#5A4000` | Text **on** warning surface |

**Destructive** (Aura — intentional)

| Token | Value | Use |
| --- | --- | --- |
| `{colors.destructive-background}` | `#FCCAD2` | Error / critical Alert surface |
| `{colors.destructive-foreground-on-critical}` | `#8D081F` | Text **on** destructive surface |

### Decorative

| Token | Value | Use |
| --- | --- | --- |
| `{colors.decorative-earth}` | `#624C3B` | Earth accent for illustrations, context badges, marketing — **never** health/status |
| `{colors.tertiary}` / Clover | `#00AB5F` | Non-status brand accent when not used as link or success foreground |

Brown must not mean “offline”, “degraded”, or “warning”. Those roles belong to semantic tokens.

---

## Status and alerts

Follow Aura escalation: repeated entity state → **Badge**; page-scoped awareness → one **Alert**; high-priority degraded shell state → **Banner**; transient confirmation → **Sonner**.

| Intent | Aura component | Tokens |
| --- | --- | --- |
| Informational, not urgent | `{components.alert-info}` | `info-background` + `info-foreground-on-info` |
| Positive completion / healthy | `{components.alert-success}` | `success-background` + `success-foreground-on-success` |
| Caution / needs attention | `{components.alert-warning}` | `warning-background` + `warning-foreground-on-warning` |
| Failure / blocking error | `{components.alert-destructive}` | `destructive-background` + `destructive-foreground-on-critical` |

### Rules

- Keep ~80–90% of the screen neutral. Status color is a signal, not a theme.
- Prefer **one** page-level Alert per independent incident; list item state belongs on Badges, not stacked Alerts.
- Pair color with text (and icon) so status remains clear without color alone.
- Do not paint entire list cards or table rows with success/info fills as decoration.
- Do not use Clover / soft green as the primary CTA fill — primary buttons use `{colors.primary}` (IP Green).
- Do not use brown for operational status.
- Do not replace destructive red with amber; warning and error must stay distinct.

---

## Typography

Inherit Aura type tokens unchanged. Product UI uses **Inter** for headings and body; **Space Grotesk** only for rare display; **Source Code Pro** for code.

| Style | Token |
| --- | --- |
| Page title | `{typography.h1}` / `{typography.h2}` |
| Section | `{typography.h3}` / `{typography.h4}` |
| Body | `{typography.body-md}` / `{typography.body-sm}` |
| Meta / labels | `{typography.label}` |
| Code | `{typography.code}` |

Do not introduce International Paper marketing fonts into Flows product chrome.

---

## Spacing and rounded

Use Aura spacing and radius scales. Product controls use `{rounded.lg}` (8px); cards use `{rounded.xl}` (12px). Density follows Aura industrial defaults (`{spacing.*}`).

The reference swatches use a single rounded bottom-right “leaf” corner for brand marketing boards. **Do not** apply that asymmetric radius to product Aura primitives — marketing assets only.

---

## Components

Aura primitives first. Import from component subpaths (`@cognite/aura/components/button`, …), never the barrel.

| Pattern | Spec |
| --- | --- |
| Primary button | `{components.button-primary}` — IP Green fill, white label |
| Primary hover | `{components.button-primary-hover}` |
| Secondary button | `{components.button-secondary}` |
| Destructive button | `{components.button-destructive}` — Aura red pair |
| Link | `{components.link-default}` — Clover `{colors.link-foreground}` |
| Card | `{components.card-default}` |
| Alerts | `{components.alert-info\|success\|warning\|destructive}` |

If a primitive almost fits, use variants/props before custom CSS. Document gaps instead of fighting Aura visuals.

---

## Assets

- **Logo:** International Paper wordmark / leaf in `{colors.primary}` on `{colors.background}`. See `references/International Paper logo and symbol, meaning, history, PNG.png` and workshop logo boards under `references/`.
- **Palette board:** `references/Radix Onsite Dune Certification Workshop Day 1.png` — brand hierarchy and status seeds.
- **Icons:** Prefer Aura / Tabler icons; keep stroke and size consistent with Aura guidance.
- **Motion:** Aura defaults — purposeful feedback, not decoration.

---

## Do's and Don'ts

### Do

- Use Aura primitives and semantic tokens for all product UI.
- Let IP Green (`{colors.primary}`) own primary actions and brand weight.
- Use Clover for links and strong success text; soft green for success surfaces.
- Reserve semantic color for status and feedback (~5–10% of the UI).
- Keep destructive as Aura red so errors stay distinct from warnings.
- Seed host-synced UI from Aura patterns for loading, empty, and error states.

### Don't

- Don't hardcode hex/rgb in components when a token exists.
- Don't use success/info/warning/destructive fills as generic decoration or selection.
- Don't use Clover as the primary button fill.
- Don't use brown (`{colors.decorative-earth}`) for health or alert meaning.
- Don't stack multiple Alerts for one user gesture.
- Don't apply marketing “leaf” corner radius to product controls.
- Don't override Aura primitive appearance with ad-hoc `className` color utilities when a variant exists.

---

## Implementation note

Runtime light-theme overrides live in [`src/styles.css`](src/styles.css) `:root` and must stay aligned with this file’s YAML. Consume color via Aura CSS variables / Tailwind role utilities (`bg-primary-background`, `text-link-foreground`, `bg-success-background`, `text-success-foreground-on-success`, …).

Hex values belong in this document and in theme `:root` overrides — not scattered in view components. When brand tokens change, update YAML here first, then `:root`, then verify Alert / Button / Badge contrast in light theme.
