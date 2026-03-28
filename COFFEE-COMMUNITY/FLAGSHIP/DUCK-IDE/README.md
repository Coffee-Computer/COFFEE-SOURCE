# DUCK IDE

**Community launchers:** **`COMMUNITY-HOMESCREEN/devsumer-apps.json`** (tile **DUCK IDE** → α) · **`COMMUNITY-DESKTOP/community-desktop-registry.json`** (**DUCK.EXE**) · homescreen **`FALLBACK_APPS`** in `coffee-community-homescreen.html` · full shell **`shell-apps.json`** · **`community-app-registry.json`**.

## Entry points

| File | Purpose |
|------|---------|
| **`DUCK-IDE-ALPHA.html`** + **`DUCK-IDE-ALPHA.css`** | **Community α** — same behavior as the POC, **no Tailwind** on the shell (local CSS + **CCE** meta + **coffee-control** / **coffee-ui** like other FLAGSHIP alphas). |
| **`TEST/DUCK1-POC.html`** | Dev POC — Tailwind CDN on the chrome; loads shared **`duck-ide-shell.js`**. |
| **`duck-ide-shell.js`** | Shared logic: editor, preview, snippets, manifest, repair banner, panel resizer. Resolves **`COFFEE-SOURCE`** from the script URL so **one** manifest works for both α and TEST. |

## Game templates

**`projects/duck-templates.json`** lists every **`COFFEE-PLAY/TEMPLATES/*/*.html`** game shell (not `*POC*`). Each **`file`** is **relative to `COFFEE-SOURCE`** (e.g. `COFFEE-PLAY/TEMPLATES/CIRCLE-DUDE/CIRCLE-DUDE.html`). The IDE sidebar **GAMES** section fetches the manifest and loads a template into the editor + preview.

Preview uses a temporary **`<base href>`** pointing at the template’s directory so existing `../../` script paths keep working when the document is injected via `document.write`.

---

**DUCK IDE** is a small **browser game studio**: one pane edits HTML/JS, the other runs a **live iframe preview**. The **default project** matches **`TEMPLATES/CIRCLE-DUDE/CIRCLE-DUDE.html`**: **`coffee.playMazeGame`** + **`coffee.playShapes`** (walls, pellets, Pac, ghosts) + HUD + mobile D-pad — Coffee scripts in the starter use **absolute URLs** rooted at **`COFFEE-SOURCE`**.

## How it maps to Coffee

| Layer | Role in DUCK IDE |
|-------|------------------|
| **`coffee.play`** | One-call game loop: `onUpdate` / `onDraw`, `game.keys`, `game.mouse`, resize. Use this in the **preview document** starter. |
| **`coffee.cup` / `coffee.dot`** | Loaded automatically when you load `coffee-play.js` (same order as **COFFEE-PLAY** templates). |
| **`coffee.playShapes`** | **Preset buttons** can inject `coffee.playShapes.drawPac(ctx, { ... })` (and friends) inside `onDraw` — dumb drawing, no game rules. |
| **`logic/coffee-play-*-game.js`** | Optional: inject `coffee.playMazeGame.create()` etc. + `step` / `getState` like **TEMPLATES/** — headless rules, you draw from state. |
| **`coffee.frame`** | **Not required for the preview.** It’s for **iframe RPC** (e.g. Monaco in a guest iframe, like CANOPY / SCRIBE). You *could* later host the **editor** in a `coffee.frame` guest; the **game preview** stays a plain iframe or `srcdoc` for simplicity. |

## Preview URL / scripts

The **default starter** in the editor uses **absolute** `file://` or `http(s)://` script URLs derived from **`COFFEE-SOURCE`** (via `duck-ide-shell.js`), so the live preview works even when the iframe document is `srcdoc` / `about:blank`-based.

Loaded **game templates** keep their own relative `<script src="../../…">` tags; DUCK IDE injects **`<base href>`** pointing at the template folder so those paths still resolve.

Serve the repo over **HTTP** from **`COFFEE-SOURCE`** (or above) so fetches to templates and Coffee modules succeed. Pure **`file://`** may still block some loads depending on the browser.

- Legacy note: opening only **`TEST/DUCK1-POC.html`** used to rely on **`../../../../`** from the parent page; resolution is now centralized on the shell script URL.

## Broken preview / “anchor not found”

If **JavaScript was ever inserted on line 1** (old IDE used the text cursor), you’ll see **`}<!DOCTYPE html>`** and the preview will show **code as text**. Your **`localStorage`** may still contain that string.

**Fix:** click **Restore Circle-Dude starter** (sidebar) or the **yellow bar** → **Restore Circle-Dude starter**. That reloads valid HTML plus all three `// DUCK_IDE_ANCHOR_*` lines.

## Snippet injection (anchors)

Sidebar buttons **do not use the editor cursor** (that pasted JS above `<!DOCTYPE html>` and broke the preview). They **replace anchor comments** in the game source:

| Anchor | Location | Snippet types |
|--------|-----------|----------------|
| `// DUCK_IDE_ANCHOR_DRAW` | Inside `onDraw` | Coffee shapes, raw canvas, particles |
| `// DUCK_IDE_ANCHOR_UPDATE` | Inside `onUpdate` | movement, gravity |
| `// DUCK_IDE_ANCHOR_SCRIPT` | After `var t0 = 0` | `collision` helper |

Each click replaces the anchor line with **snippet + the same anchor again** so the next inject stacks. Keep those three comments in your HTML.

1. Load **`coffee-play-shapes.js`** before your inline script.
2. Shape presets call `coffee.playShapes.drawShip(ctx, { … })` with **`thrusting`**, not `thrust` (see **COFFEE-PLAY** shapes API).

## Rename note

Legacy strings **CanvasForge** / **`canvas_forge_code`** were renamed to **DUCK IDE** / **`duck_ide_code`**. Old localStorage keys are not migrated automatically.
