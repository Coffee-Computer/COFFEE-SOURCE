# Snap Shot (flagship)

Y2K / Win95-style **camera booth**: live **`getUserMedia`** preview, CSS filters, still capture, filmstrip, PNG download.

## Coffee stack

| Piece | Role |
|--------|------|
| **`SNAP-SHOT-ALPHA.html`** | CCE meta, `coffee.camera`, **`coffee.shot`**, **`coffee.filterCss`**, **`coffee.save` / `coffee.load`** (reel in `localStorage` via `coffee_snap-shot-reel`), `coffee.button` / `coffee.msg` / `coffee.injectTheme`. |
| **`snapshot.css`** | Layout + retro chrome (no Tailwind). |
| **`coffee.switchCamera`** (Control) | **FLIP** button — stops current `MediaStream`, reopens with `facingMode` `'user'` ↔ `'environment'`. |
| **[`COFFEE-SHOT`](../../../COFFEE-SHOT/README.md)** | **`coffee.shot.applyLive`**, **`coffee.shot.capture`**, **`coffee.shot.stopStream`** — preview/export filter parity. |

## Files

| File | Role |
|------|------|
| **`SNAP-SHOT-ALPHA.html`** | α entry — homescreen + Desk Mode. |
| **`snapshot.css`** | Styling. |
| **`TEST/SNAPSHOT1-POC.html`** | Early POC (Tailwind) — sidebar filters. |
| **`TEST/SNAPSHOT2-CROSSPLATFORM.html`** | POC — horizontal pills, mobile tweaks. |

## Run

Serve over **HTTP** (camera). From homescreen or:

`../FLAGSHIP/SNAP-SHOT/SNAP-SHOT-ALPHA.html`

## Registry

**`COMMUNITY-HOMESCREEN/devsumer-apps.json`**, homescreen **`FALLBACK_APPS`**, **`COMMUNITY-DESKTOP/community-desktop-registry.json`** — **Snap Shot** / **SNAP.EXE**.

---

## POC → α (reference)

Legacy POCs used Tailwind + raw `ctx.filter` strings. The α replaces that with **`coffee.filterCss` objects** for presets and **`coffee.shot`** for capture so the same logic is reusable in other apps.
