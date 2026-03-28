# Snow Shoes — state & “fully Coffee” roadmap

Snapshot of how **Snow Shoes α** sits on the Coffee stack, what is still custom, and how to push toward **~100% Coffee** without losing the DAW shell behavior.

## Entry points

| Path | Role |
|------|------|
| **`SNOW-SHOES-ALPHA.html`** | Main DAW shell: `SnowShoesDaw.boot()`, transport, builtins, iframe plugins, mixer. |
| **`PLUGINS/COFFEE-SEQUENCER-ALPHA.html`** | Coffee α piano-roll plugin (manifest default). |
| **`PLUGINS/COFFEE-SUBZERO-MPC-ALPHA.html`** | Coffee α MPC + step plugin (manifest default). |
| **`TEST/*.html`** | Tailwind / early POCs — **reference only** (not default iframe `src`). |
| **`snow-shoes-plugins.json`** | Plugin registry (`builtin` \| `iframe` + `src`). |
| **`snow-shoes-daw.js`** | Workspace UI, plugin windows, builtins, manifest load + `DEFAULT_PLUGIN_MANIFEST` fallback. |
| **`snow-shoes.js`** | `coffee.snow` — master FX / reverb after analyzer. |
| **`snow-shoes-embed.js`** | Iframe helper: BPM / transport sync via `postMessage`. |

## What is already “Coffee”

- **Script chain (α page):** `coffee-control` → `coffee-ui` → `coffee-synth` → `coffee-fuzz` → `coffee-transport` → `coffee-pattern` → `coffee-cadence` → `snow-shoes.js` → `snow-shoes-daw.js`.
- **Host chrome:** `coffee.cadence.transportStrip` in header; builtins use `coffee-ui` patterns where wired in `snow-shoes-daw.js`.
- **Data model:** `coffee.pattern` (`hostPianoRoll` / `hostDrumPattern`), `coffee.transport` (steps, BPM, `onStep`).
- **Audio path:** `coffee.Synth` / analyzer → `coffee.snow` reverb → destination.
- **Iframe plugins:** Same Coffee modules + `../snow-shoes.js` + embed; pattern objects stay compatible with host concepts.

## What is hybrid / not yet abstracted

| Area | Today | Direction |
|------|--------|-----------|
| **Shell layout** | `.ss-daw-*` CSS in `SNOW-SHOES-ALPHA.html` (full-bleed, track list, workspace, grid texture) | Optional: `coffee-ui` layout helpers or a future `coffee.daw` shell that composes cadence + tokens. |
| **Typography / assets** | Inter + Google Fonts; workspace uses an external texture URL | Prefer **theme tokens** + local/static assets (or `coffee-ui` font stack) for offline / file:// parity. |
| **Cadence** | Only `transportStrip` in `coffee-cadence.js` | Move **piano roll, step row, pad grid, VU/LCD** from plugin pages into **`coffee.cadence.*`** (widgets on `coffee-pattern` data). |
| **DAW-specific JS** | `snow-shoes-daw.js` is the product shell | Keep here until you split **generic DAW shell** (`coffee.daw`) vs **Snow Shoes branding**. |
| **Plugin pages** | ~10% bespoke DOM/CSS per instrument | Shrink by calling **`coffee.cadence`** factories + shared CSS variables (`--coffee-accent` per plugin). |

## Recommended order toward “fully Coffee”

1. **Extract widgets to `coffee-cadence`** — e.g. `stepRow`, `padGrid`, `pianoRoll`, `levelMeter`; plugins become thin glue + audio callbacks.
2. **Token sweep** — replace one-off colors with `var(--coffee-*)` from `coffee-ui` / control theme; align accent per app via `:root`.
3. **Shell** — either document `.ss-daw-*` as “Snow Shoes theme layer” or gradually migrate layout to shared row/stack/card from `coffee-ui`.
4. **`coffee.daw` (later)** — only when you need **multi-track session**, mixer model, or plugin host API shared outside Snow Shoes; have **`coffee.daw` compose `coffee.cadence`**, not duplicate widgets.

## Community Desktop

**Snow Shoes α** is registered in **`COMMUNITY-DESKTOP/community-desktop-registry.json`** so **Desk Mode** can launch it in a window (same pattern as Scribe). Path is relative to `COMMUNITY-DESKTOP-ALPHA.html`:

`../FLAGSHIP/SNOW-SHOES/SNOW-SHOES-ALPHA.html`

## Run notes

- Use **HTTP** (not `file://`) for `fetch(snow-shoes-plugins.json)` and iframe plugin resolution.
- After changing **`PLUGINS/*.html`**, confirm **`snow-shoes-plugins.json`** / **`DEFAULT_PLUGIN_MANIFEST`** in `snow-shoes-daw.js` still point at the intended `src`.

---

*Last updated: aligns α shell + Coffee plugins + desktop registry; iterate this file when cadence/DAW split lands.*
