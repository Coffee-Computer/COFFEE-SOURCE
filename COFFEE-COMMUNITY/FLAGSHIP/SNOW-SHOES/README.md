# Snow Shoes (flagship)

Web DAW direction for Coffee Community: **transport** + **pattern** + **Cadence** (music UI) + **Synth/Fuzz**, composed by **`snow-shoes.js`**.

## α entry

| File | Role |
|------|------|
| **`SNOW-SHOES-ALPHA.html`** | Same shell + scripts for **`coffee.pattern`** + **`coffee.cadence`**. |
| **`snow-shoes-daw.js`** | `SnowShoesDaw.boot(container, opts?)` — **`coffee.cadence.transportStrip`** in header (fallback round play/stop if cadence missing); **`deps.hostPianoRoll`** / **`deps.hostDrumPattern`**; **`coffee.transport.totalSteps`** = piano-roll `stepCount`. Plugin manifest, builtins, iframe plugins, collapsible mixer as before. |
| **`snow-shoes-plugins.json`** | Registry: `plugins[]` with `kind`: `builtin` (`builtinType`: `synth` \| `drums`) or `iframe` (`src` relative to the α HTML URL). `bootIds` = plugins to open on load. |
| **`snow-shoes-embed.js`** | Drop into iframe plugin pages; pairs with host **`postMessage`** (`host.hello`, `transport.state`, …). See **`SNOW-SHOES-EMBED.md`**. |
| **`snow-shoes.js`** | `coffee.snow.init()` / `installMasterFx()` — **reverb after analyzer** → destination. |
| **`SNOW-SHOES-COFFEE-STATE.md`** | Current Coffee vs hybrid areas + roadmap toward **`coffee.cadence`** widgets / optional **`coffee.daw`** shell. |

Iframe plugins default to **`PLUGINS/COFFEE-SEQUENCER-ALPHA.html`** and **`PLUGINS/COFFEE-SUBZERO-MPC-ALPHA.html`** (see **`PLUGINS/README.md`**). Tailwind POCs in **`TEST/`** stay as reference only.

## Script order (α page)

```
coffee-control.js
coffee-ui.js
coffee-synth.js
coffee-fuzz.js
coffee-transport.js
coffee-pattern.js
coffee-cadence.js
snow-shoes.js
snow-shoes-daw.js
```

α loads **pattern + cadence**: `deps.hostPianoRoll` / `deps.hostDrumPattern` are ready for a built-in sequencer; **`coffee.cadence.transportStrip`** drives Play/Stop/BPM/step readout in the header (tempo slider row stays in sync for quick drags).

## Modules (COFFEE-SOURCE)

| Module | Namespace | Notes |
|--------|-----------|-------|
| `COFFEE-TRANSPORT/coffee-transport.js` | `coffee.transport` | BPM, steps, `onStep`, `play`/`stop`. |
| `COFFEE-PATTERN/coffee-pattern.js` | `coffee.pattern` | `emptyPianoRoll`, `emptyDrum`, `clone`. |
| `COFFEE-CADENCE/coffee-cadence.js` | `coffee.cadence` | `transportStrip(container, transport)`. |

## Run

```bash
cd COFFEE-SOURCE/COFFEE-COMMUNITY/FLAGSHIP/SNOW-SHOES
python3 -m http.server 8890
```

Open **http://localhost:8890/SNOW-SHOES-ALPHA.html** — use **Play** or play keys/pads (user gesture resumes **`AudioContext`**).

## POCs

Legacy Tailwind experiments live in **`TEST/`** (`SNOW-SHOES1-POC`, `SNOW-SHOES3-PLUGIN`, sequencer, etc.). α is the **coffee-ui + Coffee stack** port of the 1–3 DAW shell.
