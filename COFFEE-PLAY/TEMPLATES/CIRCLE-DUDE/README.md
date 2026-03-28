# Circle-Dude — Pac-ish template arc

Two HTML demos for the same **maze + pellets + ghosts** idea, built at different layers of the Coffee **play** stack. Together they show how a POC becomes a **reusable** template.

---

## The arc (story order)

1. **`CIRCLE-DUDE-POC1.html`** — **proof of concept**  
   - Manual **`requestAnimationFrame`** loop (no `coffee.play`).  
   - **`class Entity` / Pac / Ghost** — OOP, pixel grid, fixed tile size.  
   - **Numeric** `mapTemplate` (numbers per cell); map mutates when you eat pellets.  
   - Ghosts: **greedy chase** toward Pac + a bit of randomness.  
   - Framed canvas, touch D-pad, “replay” overlay.  
   - **Why keep it:** best reference for **tunnel math**, **greedy AI**, and **pixel-grid** patterns when you outgrow the simpler model.

2. **`CIRCLE-DUDE.html`** — **Coffee-stack template**  
   - **`coffee.play`** — CUP keys, `onUpdate` / `onDraw`, full-viewport canvas.  
   - **ASCII maze** (`RAW[]` lines): `#` wall, `.` pellet, `o` power, `S` start, `G` ghost.  
   - **Normalized grid** (`r`, `c` as cell centers) — logic stays separate from pixels.  
   - Game rules live in **`../../logic/coffee-play-maze-game.js`** (`coffee.playMazeGame`).  
   - Drawing uses **`../../shapes/coffee-play-shapes.js`** (`coffee.playShapes`) — same wedge/blob/pellet/wall helpers POC1 also loads.  
   - Power pellets, invulnerability after respawn, simpler wander ghosts.  
   - **Why use it:** shows the **intended** way to ship a small game on **play + shared logic + shared shapes**.

So: **POC1 = explore mechanics and architecture** → **Circle-Dude = productized slice** of that game on the shared modules.

---

## Files in this folder

| File | Role |
|------|------|
| **`CIRCLE-DUDE.html`** | Main template — play + maze logic + shapes |
| **`CIRCLE-DUDE-POC1.html`** | Historical / reference POC — RAF + classes |
| **`README.md`** | This doc |

---

## Scripts (from this folder)

```text
../../shapes/coffee-play-shapes.js   → coffee.playShapes
../../logic/coffee-play-maze-game.js → coffee.playMazeGame  (CIRCLE-DUDE.html only)
../../coffee-play.js                 → coffee.play           (CIRCLE-DUDE.html only)
```

Load order for **`CIRCLE-DUDE.html`**: shapes → maze logic → play.

---

## More docs

- **`../../PLAY-SHAPES.md`** — side-by-side comparison of the two HTML files + roadmap (grid module, AI snippets).  
- **`../../README.md`** — `coffee.play` API and COFFEE-PLAY folder layout (`shapes/`, `logic/`).

Open either HTML file in a browser from disk or via your static server; paths are relative to **COFFEE-PLAY**.
