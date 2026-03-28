# Helix (flagship)

Coffee OS CE **build engine** UI — **`coffee.bee`** on drive **`helix-build`** (same BYOK keys as KATI / BEE-DEMO).

## Files

| File | Role |
|------|------|
| `helix-instructions.js` | `window.HELIX` — `PERSONA_CORE`, `SYSTEM_BUILD`, `SYSTEM_CHAT`, `SUGGESTED_PROMPTS`, `SUGGESTED_CHAT_PROMPTS` |
| `helix-build.js` | `window.helixBuild` — Bee wrapper; `getSystem('build'|'chat')`, `getSuggestedPrompts(mode)` |
| `HELIX-ALPHA.css` | Helix-only layout + **sliding threads drawer** (hamburger in top bar, backdrop on narrow viewports). Load after `coffee-ui-flagship.css`. |
| `HELIX-ALPHA.html` | **Build | Chat** toggle; **Build** uses a KATI POC–style split (~420px chat rail + **large preview** with browser chrome + `helix://…` URL bar). Chat hides the preview and full-widths the rail. |

## Script order

Same stack as KATI Chat α: Control → UI → **coffee-ui-flagship.css** → fonts → **`HELIX-ALPHA.css`** → flagship js → Toast → … → **Bee** → `helix-instructions.js` → `helix-build.js` → `cce-validate.js` (optional / future wiring).

## Preview & export

- Last **assistant** message is scanned for a **```html** fenced block (or raw `<!DOCTYPE` / `<html`).
- **Export** downloads `helix-build.html` when extractable HTML exists.

## Persona

Helix is written as **Clank-adjacent**: capable, industrial, dry wit OK if still helpful—not cruel. **Kip and Kati’s older, rougher brother** on the CE crew; hands-dirty, open-source aligned.

## Relation to KATI

- **KATI** — companion chat (`kati-chat` drive).  
- **Helix** — same Bee persistence (`helix-build` drive); **Build** mode for structured HTML + preview, **Chat** mode for ordinary conversation without forcing ` ```html `.

Legacy POC: `../KATI/TEST/KATI-WEBSITEBUILDER.html` (if present).
