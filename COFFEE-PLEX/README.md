# COFFEE-PLEX

**`coffee.plex`** — headless **Canvas 2D stroke styling** for painting apps (e.g. **Kite**).  
Not related to Plex media software.

## Load

```html
<script src="coffee-plex.js"></script>
```

No dependencies. Load **before** `coffee-draw.js` if draw should use plex for replay.

## API

| Call | Description |
|------|-------------|
| `coffee.plex.apply(ctx, { mode, color, size, opacity })` | Configure `ctx` for one polyline stroke. `opacity` is **0–1**. |
| `coffee.plex.reset(ctx)` | Clear shadow / alpha / composite op to safe defaults. |
| `coffee.plex.modes()` | `[{ id, label }, …]` — `pen`, `brush`, `sketch`, `marker`, `eraser`. |
| `coffee.plex.isMode(id)` | Whether `id` is built-in. |

## Modes

- **pen** — hard round stroke  
- **brush** — soft edge via `shadowBlur`  
- **sketch** — thin, semi-transparent  
- **marker** — square caps, softer alpha  
- **eraser** — white paint (matches white artboard; use on light backgrounds)

## Pairing

- **`coffee.draw`** — stores `mode` + `opacity` per stroke and calls `plex.apply` on replay when plex is loaded.

## CCE

Registered as **`plex`** in community validation.
