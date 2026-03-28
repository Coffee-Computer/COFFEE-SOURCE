# Coffee Community Edition — Arc & Discovery

> **Status (March 2026):** **Community Edition is feature-frozen.** See **`../SOURCE-STATUS.md`** for what that means and **`../COMMUNITY-STATUS.md`** for the full module/shell snapshot. This doc stays the **arc & philosophy** reference (CE vs Pro, surfaces, design principles).

## The Discovery

**Fork yourself, then make a Pro version.**

- **Community Edition** → Public repo, open source (MIT or similar), full source
- **Pro** → Fork or private repo, add premium features, different license / commercial terms

You keep Community as the base; Pro becomes "Community + more." People can see how it's built, contribute to Community, and you keep Pro as the paid/advanced tier. Same pattern as GitLab CE vs EE, Sentry open source vs hosted.

---

## The Community Edition Arc

### What We Built

**Coffee Community Edition** — A Chrome OS–style shell and apps using Coffee Control + Coffee UI (no Tailwind, no Font Awesome).

**Shell** (`coffee-community-shell.html`):
- Status bar with ☕️ + clock
- App grid (home screen)
- Nav bar
- Notification shade
- Vanilla rainbow gradient: `linear-gradient(135deg, #FF6F00 0%, #FFB300 30%, #E91E63 70%, #9C27B0 100%)` (Frugal flagship wordmark uses the same stops)
- Apps load in iframes

**Apps** (standalone HTML in `apps/`):
- `notes.html` — `coffee.textarea`, `coffee.save` / `coffee.load`
- `calculator.html` — Coffee UI calculator (standard layout, max-width 320px)
- `camera.html` — `coffee.camera()`, `coffee.capture()`
- `terminal.html` — Static terminal-style output
- `settings.html` — `coffee.storageQuota()`
- `files.html` — `coffee.list()` for storage keys
- External iframes: Browser (Wikipedia), Maps (OpenStreetMap)

### Architecture

- **Coffee Control** — Device/browser APIs; singleton; no framework
- **Coffee UI** — UI primitives; extends `window.coffee`; uses `injectTheme()` for tokens
- **Community shell** — Loads both; apps are iframes; each app loads Coffee Control + Coffee UI as needed

### Community Shell vs Homescreen vs Desktop (three surfaces)

| Surface | Where | Vibe | App list |
|--------|--------|------|----------|
| **Community homescreen** | `COMMUNITY-HOMESCREEN/coffee-community-homescreen.html` | Same UI as full shell; **curated devsumer** default | `COMMUNITY-HOMESCREEN/devsumer-apps.json` |
| **Community shell (demo)** | `coffee-community-shell.html` (this folder) | **Kitchen-sink** grid — try everything | `shell-apps.json` (50+); richer `community-app-registry.json` |
| **Community Desktop** | `COMMUNITY-DESKTOP/COMMUNITY-DESKTOP-ALPHA.html` | **Desk Mode** — DOS-style chrome + CRT | `COMMUNITY-DESKTOP/community-desktop-registry.json` (`label` can be `THING.EXE`). *Curated examples:* Scribe, Snow Shoes (full DAW), Frugal, **Speak**, **Bright House** (`coffee.pix` + `coffee.filterCss`), **Snap Shot** (`coffee.camera` + `coffee.shot` + `coffee.filterCss` photobooth). |

Same *apps* can appear on both; they don’t have to share one JSON file on day one.

**Registry options (pick one later):**

1. **Keep two files** — Shell stays a flat grid list; desktop stays a short curated list with DOS labels. Easiest mentally.
2. **One canonical registry** — e.g. extend `community-app-registry.json` with optional `surfaces: ["shell","desktop"]` and optional `desktopLabel`; shell maps `name`/`url`, desktop maps `desktopLabel` → `title` + `src`/`url`. Single source of truth, one `fetch` pipeline to maintain.

The shell is the “phone/tablet home screen”; the desktop is a **Coffee-flavored retro layer** for a smaller set of apps (or the same set if you generate the desktop registry from the big one).

### Design Principles (from Coffee UI)

- Fixed shell, touch-first
- No `alert()` — use loading states and inline feedback
- Visual consistency via theme tokens

---

## Workflow Philosophy

**Flow first, sort later.**

When in vibe/cook mode, keep building. Don't stop to "sort it out" yet. Flesh out Coffee Community until it feels done enough — more apps, polish, edge cases. Then pause, look at what you have, and decide what goes in the open repo vs. what becomes Pro. Better decisions with a fuller picture.

---

## Possible Next Steps

- Open source: public repo + link from main site
- Add more apps or improve existing ones
- App registry (e.g. JSON) for community apps
- Pro/paid variant built on the open Community Edition fork

---

## .cce File Format

**If it ain't Coffee, it ain't Community.** A `.cce` file is a ZIP of a Coffee-stack app with `manifest.json` + `index.html` + optional `assets/`. The **Coffee Packager** (`tools/cce-packager.js`) validates (no React/Tailwind/etc., must use Coffee UI/Control) and zips. See `CCE-SPEC.md`.

**Validation verified:** `notes-cce` ✓ passes; `tailwind-test` ❌ rejected (Tailwind); raw HTML with no metadata ❌ rejected. Same check runs in the Store upload.
