# Coffee Community — Current Status

> **Community Edition — FROZEN (March 2026)**  
> The **Coffee Community Edition** slice of this tree is **feature-frozen**: treat `COFFEE-COMMUNITY/`, devsumer homescreen, Desk Mode, CCE tooling, and flagship α pages as a **stable baseline**, not an active product sprint. **New platform work** belongs in a **fork / Pro** line or other repos; here you may still apply **small fixes** (broken paths, security, typos) without re-opening the edition.  
> **Where we are (short):** **`SOURCE-STATUS.md`** (this folder) — edition stance, entrypoints, doc map.

Snapshot of the Coffee Community / COFFEE-SOURCE stack at **freeze: March 2026**.

**Tri-Arc (Shader Stack):** Shadow → Shade → Shader. Presets (JSON) → engine (WebGPU) → WGSL. Layered modes: background, liquid, waves, lines.

---

## Overview

Coffee Community is a vanilla-JS app platform: shell, UI primitives, data modules, and a strict packaging format (`.cce`). No React/Vue/Tailwind. Apps run in iframes and use approved `coffee.*` APIs only.

**Coffee Community Edition** (`COFFEE-COMMUNITY/`): curated **homescreen** + **Desk Mode** (desktop), `.cce` packager/validator, flagship apps (e.g. **Bright House** — `coffee.pix` + **`coffee.filterCss`**; **Snap Shot** — `coffee.camera` + **`coffee.shot`** + **`coffee.filterCss`**; **DUCK IDE** — browser studio on top of **`coffee.play`** / **COFFEE-PLAY** templates). Arc & philosophy: **`COFFEE-COMMUNITY/COMMUNITY-ARC.md`**.

**Verdict (at freeze):** Stack is **solid and shippable** for building notes, forms, dashboards, CRUD, chat UIs, file browsers, and similar apps. **Scene 3D** and **Scene 2D** add declarative 3D (Three.js) and 2D (Canvas). **Synth** and **Fuzz** add Web Audio (polyphonic synth, ADSR, note names, FX chain). AI (completions, context, chat) via **AI**, **Context**, **Bee**. Creative engines (canvas, audio) and productivity tools (docs, spreadsheets) remain out of scope for core. **No further Community Edition feature roadmap** is implied by this repo state—see **`SOURCE-STATUS.md`**.

---

## Core Platform

| Component | Status | Notes |
|-----------|--------|-------|
| **Shell** | ✓ | `coffee-community-shell.html` — home grid, iframe app windows, nav bar (back/home/recents) |
| **Store** | ✓ | `apps/store.html` — browse/install `.cce` packages |
| **Routing** | Missing | No URL-based routing or deep links; shell is flat, no back stack |
| **App lifecycle** | Thin | Apps torn down on close; no save/restore or lifecycle hooks |
| **Notifications** | Partial | `coffee.toast()` for inline feedback; no shell notification API |

---

## COFFEE-SOURCE Modules

### Base (required)

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **Coffee Control** | `COFFEE-SOURCE/COFFEE-CONTROL/TEST/coffee-control.js` | — | Base loader, `coffee` namespace |
| **Coffee UI** | `COFFEE-UI/coffee-ui.js` | `button`, `input`, `slider`, `textarea`, `select`, `label`, `link`, `text`, `para`, `spinner`, `msg`, `card`, `glass`, `progressBar`, `announce`, `scoreRow`, `hud`, `heading`, `row`, `col`, `stack`, `appShell`, `container`, `injectTheme`, `theme`, `chatInput`, `chatBubble`, **`floatGroup`**, **`floatStack`**, **`iconButton`**, **`toolDock`**, **`pillStrip`** | Layout, inputs, design tokens, HUD, **floating tool panels + bottom docks** (see **Kite α**) |

### Data & Storage

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **Drive** | `COFFEE-DRIVE/coffee-drive.js` | `coffee.drive(appName)` → `{ save, load, list, remove, clear, count, getInfo }` | IndexedDB wrapper |
| **Install** | `COFFEE-INSTALL/coffee-install.js` | `coffee.install.install`, `mergeGridApps`, `uninstall`, `notifyParentInstallChanged` | User apps → Drive + manifest; Community shells merge grid; loader: `apps/installed-app-loader.html` |
| **Git** | `COFFEE-GIT/coffee-git.js` | `coffee.git.fetchFromInput`, `parseSpec` | Public GitHub raw fetch (Store POC) |
| **Base** | `COFFEE-BASE/coffee-base.js` | `coffee.base(projectKey)`, `init`, `applyPreset`, delegates to `que`/`wire.drive` | Local faux BaaS (JSON collections, IndexedDB). Demo: `BASE-DEMO.html` |
| **File** | `COFFEE-FILE/coffee-file.js` | `coffee.file.open()`, `coffee.file.save()`, `coffee.file.directory()` | File System Access API. Native picker (Chrome). Fallback: input + download |
| **Request** | `COFFEE-REQUEST/coffee-request.js` | `coffee.request(url, opts)` | Fetch wrapper, baseUrl, defaultHeaders, timeout, JSON by default |
| **Masto** | `COFFEE-MASTO/coffee-masto.js` | `coffee.masto({ instanceUrl, token })` → timelines, post, media, fav, boost, search, … | Mastodon-compatible REST on **request**. Demo: `MASTO-DEMO.html`. Flagship: **Anti-Social α** (planned) |
| **Save/Load** | (Control) | `coffee.save`, `coffee.load` | Key-value persistence |

### UI Components

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **List** | `COFFEE-LIST/coffee-list.js` | `coffee.list(items, opts)` | Generic list, `renderItem`, `onItemClick`, `setItems` |
| **Table** | `COFFEE-TABLE/coffee-table.js` | `coffee.table(data, opts)` | Tabular data, columns, `onRowClick`, `setData` |
| **Modal** | `COFFEE-MODAL/coffee-modal.js` | `coffee.modal()`, `coffee.dialog()` | Overlay modals, confirm/cancel |
| **Forms** | `COFFEE-FORMS/coffee-forms.js` | `coffee.form({ fields, onSubmit, validate })` | Form wrapper, validation |
| **Toast** | `COFFEE-TOAST/coffee-toast.js` | `coffee.toast(text, type, duration)` | Inline feedback (success, warning, error, info) |

### Media

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **Blob** | `COFFEE-BLOB/coffee-blob.js` | `coffee.imageToBlob(file, opts)` | Image-to-blob, resize, quality |
| **Camera** | (Control) | `coffee.camera` | Camera capture |
| **Scene 3D** | `COFFEE-SCENE3D/coffee-scene3d.js` | `coffee.scene3d(opts)` | Declarative 3D (Three.js). Shapes: box, sphere, plane, cylinder, torus, cone. Orbit controls, `custom()` escape hatch |
| **YAY** | `COFFEE-YAY/coffee-yay.js` | `coffee.yay(opts)` | Spatial 3D builder: mutable meshes + HTML cards projected in view. Orbit drag, `toJSON`/`fromJSON`. Flagship: **`YAY-ALPHA.html`** |
| **Scene 2D** | `COFFEE-SCENE2D/coffee-scene2d.js` | `coffee.scene2d(opts)` | Declarative 2D (Canvas 2D). Shapes: rect, circle, line, arc, ellipse, path. No deps. `custom()` escape hatch |
| **Animate** | `COFFEE-ANIMATE/coffee-animate.js` | `coffee.animate(target, props, opts)` | Standalone tween engine. duration, ease, onUpdate, onComplete. Works with scene2d, DOM, any object |
| **Plex** | `COFFEE-PLEX/coffee-plex.js` | `coffee.plex.apply(ctx, spec)`, `.reset`, `.modes()` | Headless Canvas2D stroke presets (pen, soft brush, sketch, marker, eraser). Pair with **draw** |
| **Draw** | `COFFEE-DRAW/coffee-draw.js` | `coffee.draw(opts)` | Interactive drawing. Depends on scene2d. Strokes store `mode` + `opacity`; uses **plex** when loaded. `setBrush`, `getBrush`, `undo`, `loadStrokes`, `exportStrokes`. Demo: `DRAW-DEMO.html`. Flagship: **`KITE-ALPHA.html`** |
| **Synth** | `COFFEE-SYNTH/coffee-synth.js` | `coffee.Synth`, `coffee.synth` | Web Audio synth. Polyphonic, ADSR, note names (A4). `connect(dest)`, `output`, `analyzer`, `note()` |
| **Fuzz** | `COFFEE-FUZZ/coffee-fuzz.js` | `coffee.fuzz` | Audio FX chain. `reverb()`, `delay()`, `fuzz()`, `filter()`. Returns `{ input, output }` for chaining |
| **Nebula** | `COFFEE-NEBULA/coffee-nebula.js` | `coffee.nebula` | Multi-source search. Wikipedia + DuckDuckGo. No API keys |
| **Brick** | `COFFEE-BRICK/coffee-brick.js` | `coffee.brick` | Headless 2D physics. `world()`, `addBody()`, `step()`, `getBodies()` |
| **Pix** | `COFFEE-PIX/coffee-pix.js` | `coffee.pix(opts)` | Canvas pixel engine: `load()`, `adjust()`, `preset()`, `reset()`. Primary: brightness / contrast / saturation offsets; presets include grayscale, sepia, invert, vintage |
| **Filter** | `COFFEE-FILTER/coffee-filter.js` | `coffee.filterCss(opts)`, `.overlay()`, `.apply()`, `.applyOverlay()` | CSS `filter` string builder for elements and `CanvasRenderingContext2D.filter`. Pairs with **Pix** / **Shot** for preview + export. Demo: `FILTER-DEMO.html` |
| **Shot** | `COFFEE-SHOT/coffee-shot.js` | `coffee.shot.applyLive()`, `.capture()`, `.stopStream()`, `.resolveFilter()` | Live `<video>` filter + matching still capture (`ctx.filter`). Uses **`coffee.camera`** + optional **`coffee.filterCss`**. Demo: `SHOT-DEMO.html`. Flagship: **`SNAP-SHOT-ALPHA.html`** |
| **SVG** | `COFFEE-SVG/coffee-svg.js` | `coffee.svg(opts)` | Vector graphics. Draw rect, circle, text. `setTool()`, `getSelected()`, `updateSelected()`, `clear()`, `export()`. Flagship: **`VECTOR-ALPHA.html`** (+ **Inspector**) |
| **Inspector** | `COFFEE-INSPECTOR/coffee-inspector.js` | `coffee.inspector(opts)` | Schema-driven property panel. `syncFrom` / `syncTo`, `update()`, `destroy()`. Optional with **Coffee UI**. Demo: `INSPECTOR-DEMO.html` |
| **OMNI** | `COFFEE-OMNI/coffee-omni.js` | `coffee.omni` | Hyper/CCE host helpers: `parseSchemaFromManifest`, `inspectorSectionsFromControls`, `vizTick`, `hyperPropMessage`, `validateHtml`. Demo: `OMNI-DEMO.html`. Flagship: **`HYPER-WEB-ALPHA.html`** |
| **Que** | `COFFEE-QUE/coffee-que.js` | `coffee.que(opts)` | In-memory document store. Collections, add, remove, filter. No persistence without adapter |
| **Wire** | `COFFEE-WIRE/coffee-wire.js` | `coffee.wire` | Persistence adapters for que. Unified with Control/Drive. `wire.control()`, `wire.drive()`, `wire.localStorage()`, `wire.memory()` |
| **Snake** | `COFFEE-SNAKE/coffee-snake.js` | `coffee.snake(opts)` | Python execution (Pyodide WASM). Control saves scripts. `init()`, `execute()`, `loadExample()` |
| **Rusty** | `COFFEE-RUSTY/coffee-rusty.js` | `coffee.rusty(opts)` | Rust execution via Playground API. Control saves scripts. `execute()`, `loadExample()` |
| **Skater** | `COFFEE-SKATER/coffee-skater.js` | `coffee.skater(opts)` | Object-based CSS shader. hue, scale, skew, blur, invert. `compile()`, `start()`, `stop()`, `loadPreset()` |
| **Dot** | `COFFEE-DOT/coffee-dot.js` | `coffee.dot.create(canvas)`, `coffee.dot.draw(state)` | 2D canvas render engine for games. Consumes state (entities, projectiles). No logic |
| **Cup** | `COFFEE-CUP/coffee-cup.js` | `coffee.cup.create(opts)` | Game logic framework (headless). `spawn()`, `shoot()`, `step(dt)` → state. Physics, collision, input |
| **Play** | `COFFEE-PLAY/coffee-play.js` | `coffee.play(canvas, setup)` | Game API built on CUP + DOT. `onUpdate`, `onDraw`, `onAnnounce`. Spawn, shoot, keys, mouse |
| **Coil** | `COFFEE-COIL/coffee-coil.js` | `coffee.coil.load()`, `coffee.coil.list()` | Template/preset house for generative art. JSON presets by engine |
| **Forge** | `COFFEE-FORGE/coffee-forge.js` | `coffee.forge.create(preset)`, `coffee.forge.register()` | Generative art engine. Produces drawables from presets |
| **Art** | `COFFEE-ART/coffee-art.js` | `coffee.art.create(canvas)`, `coffee.art.draw(drawables)` | Renderer for drawables. COIL → FORGE → ART pipeline |
| **GPU** | `COFFEE-GPU/coffee-gpu.js` | `coffee.gpu(opts)` | Raw WebGPU 3D. Declarative shapes (box, sphere). CSS colors. `rotationSpeed`, `custom()` escape hatch |
| **Shade** | `COFFEE-SHADE/coffee-shade.js` | `coffee.shade(opts)` | Headless WebGPU shader engine. Layered config (background, liquid, waves, lines). `start()`, `stop()`, `update()` |
| **Shadow** | `COFFEE-SHADOW/coffee-shadow.js` | `coffee.shadow.load()`, `coffee.shadow.run()` | Preset loader for shade. Fetches JSON from `presets/{shader}/{preset}.json` |
| **Shader** | `COFFEE-SHADER/` | — | WGSL content, demos. Tri-arc: shadow → shade → shader |

### AI

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **AI** | `COFFEE-AI/coffee-ai.js` | `coffee.ai.complete(opts)` | Completions (GitHub, OpenAI, Gemini, Ollama). BYOK API keys |
| **Context** | `COFFEE-CONTEXT/coffee-context.js` | `coffee.context(driveName)` | AI threads. `create`, `append`, `load`, `list`, `save`, `remove` |
| **Bee** | `COFFEE-BEE/coffee-bee.js` | `coffee.bee(config)` | Chat layer on AI + context. `createThread`, `listThreads`, `loadThread`, `send` |

### Community / Social

| Module | Path | API | Description |
|--------|------|-----|-------------|
| **Chat** | `COFFEE-CHAT/coffee-chat.js` | `coffee.chat`, `coffee.chatInput`, `coffee.chatBubble` | Chat UI primitives |
| **Connect** | `COFFEE-CONNECT/coffee-connect.js` | `coffee.connect` | Nostr + PeerJS unified transport. Flagship: **`GHOST-NETWORK-ALPHA.html`** (Nostr channels / `?channel=`) |
| **Nostr** | `COFFEE-NOSTR/coffee-nostr.js` | `coffee.nostr` | Kind `0` profiles + cache on top of `coffee.connect` (nostr). `handleEvent`, `lookupProfile`, `publishProfile`. Used by **Ghost Network** |
| **Graph** | `COFFEE-GRAPH/coffee-graph.js` | `coffee.graph` | Graph visualization |

---

## Shell Apps (Home Grid)

| App | Source | Type |
|-----|--------|------|
| Store | `apps/store.html` | Built-in |
| Browser | wikipedia.org | External |
| Maps | openstreetmap.org | External |
| Terminal | `apps/terminal.html` | Built-in |
| Notes | `apps/notes.html` | Built-in |
| Calculator | `apps/calculator.html` | Built-in |
| Camera | `apps/camera.html` | Built-in |
| Settings | `apps/settings.html` | Built-in |
| Files | `apps/files.html` | Built-in |
| Chat | `COFFEE-CHAT/CHAT-DEMO.html` | COFFEE-SOURCE demo |
| Drive | `COFFEE-DRIVE/DRIVE-DEMO.html` | COFFEE-SOURCE demo |
| Request | `COFFEE-REQUEST/REQUEST-DEMO.html` | COFFEE-SOURCE demo |
| Modal | `COFFEE-MODAL/MODAL-DEMO.html` | COFFEE-SOURCE demo |
| Forms | `COFFEE-FORMS/FORMS-DEMO.html` | COFFEE-SOURCE demo |
| List | `COFFEE-LIST/LIST-DEMO.html` | COFFEE-SOURCE demo |
| Table | `COFFEE-TABLE/TABLE-DEMO.html` | COFFEE-SOURCE demo |
| Scene 3D | `COFFEE-SCENE3D/SCENE3D-DEMO.html` | COFFEE-SOURCE demo |
| Scene 2D | `COFFEE-SCENE2D/SCENE2D-DEMO.html` | COFFEE-SOURCE demo |
| Animate | `COFFEE-ANIMATE/ANIMATE-DEMO.html` | COFFEE-SOURCE demo |
| Draw | `COFFEE-DRAW/DRAW-DEMO.html` | COFFEE-SOURCE demo |
| Plex | `COFFEE-PLEX/PLEX-DEMO.html` | Stroke presets (use with draw / Kite) |
| AI | `COFFEE-AI/AI-DEMO.html` | COFFEE-SOURCE demo |
| Context | `COFFEE-CONTEXT/CONTEXT-DEMO.html` | COFFEE-SOURCE demo |
| Bee | `COFFEE-BEE/BEE-DEMO.html` | COFFEE-SOURCE demo |
| Synth | `COFFEE-SYNTH/SYNTH-DEMO.html` | COFFEE-SOURCE demo |
| Shader | `COFFEE-SHADER/SHADER-DEMO.html` | COFFEE-SOURCE demo |
| Fuzz | `COFFEE-FUZZ/FUZZ-DEMO.html` | COFFEE-SOURCE demo |
| Nebula | `COFFEE-NEBULA/NEBULA-DEMO.html` | COFFEE-SOURCE demo |
| Brick | `COFFEE-BRICK/BRICK-DEMO.html` | COFFEE-SOURCE demo |
| Pix | `COFFEE-PIX/PIX-DEMO.html` | COFFEE-SOURCE demo |
| Filter | `COFFEE-FILTER/FILTER-DEMO.html` | COFFEE-SOURCE demo |
| Shot | `COFFEE-SHOT/SHOT-DEMO.html` | COFFEE-SOURCE demo |
| SVG | `COFFEE-SVG/SVG-DEMO.html` | COFFEE-SOURCE demo |
| Que | `COFFEE-QUE/QUE-DEMO.html` | COFFEE-SOURCE demo |
| Play | `COFFEE-PLAY/PLAY-DEMO.html` | COFFEE-SOURCE demo |
| DUCK IDE | `COFFEE-COMMUNITY/FLAGSHIP/DUCK-IDE/DUCK-IDE-ALPHA.html` | Flagship α (studio on **coffee.play**) |
| Art | `COFFEE-ART/ART-DEMO.html` | COFFEE-SOURCE demo |
| GPU | `COFFEE-GPU/GPU-DEMO.html` | COFFEE-SOURCE demo |
| File | `COFFEE-FILE/FILE-DEMO.html` | COFFEE-SOURCE demo |

---

## CCE Package Format

- **Spec:** `CCE-SPEC.md`
- **Tools:** `tools/cce-validate.js`, `cce-packager.js`, `cce-check.js`
- **Structure:** ZIP with `manifest.json`, `index.html`, optional `assets/`
- **Metadata:** Meta tags or `data-cce-config` JSON for single-HTML uploads
- **Validation:** Strict — only approved `coffee.*` APIs; no React/Vue/Tailwind/jQuery

### Approved APIs (cce-validate.js)

**Source of truth:** `COFFEE-COMMUNITY/tools/cce-validate.js` (same alternation in `cce-packager.js`). Update **`CCE-SPEC.md`** when the list changes.

`ai`, `animate`, `announce`, `appShell`, `art`, `bee`, `brick`, `button`, `camera`, `card`, `chat`, `chatBubble`, `chatInput`, `coil`, `col`, `connect`, `container`, `context`, `cup`, `dialog`, `dot`, `draw`, `drive`, `file`, **`filterCss`**, `floatGroup`, `floatStack`, `forge`, `form`, `fuzz`, `glass`, `gpu`, `graph`, `heading`, `hud`, `iconButton`, `imageToBlob`, `injectTheme`, `input`, `label`, `link`, `list`, `load`, `microphone`, `modal`, `msg`, `nebula`, `para`, `pillStrip`, `pix`, `plex`, `play`, `progressBar`, `que`, `record`, `request`, `row`, `rusty`, `save`, `scene2d`, `scene3d`, `scoreRow`, `select`, `shade`, `shadow`, **`shot`**, `skater`, `slider`, `snake`, `spinner`, `stack`, `storageQuota`, `streamSpectrum`, `switchCamera`, `synth`, `table`, `text`, `textarea`, `theme`, `toast`, `toolDock`, `wire`, **`yay`**, **`nostr`**

---

## Gaps & Roadmap

**At Community Edition freeze:** the table below is a **historical snapshot** of what the stack covered vs. gaps; it is **not** a commitment to close gaps in this edition.

See `COMMUNITY-STACK-GAPS.md` for full list. Summary:

| Area | Status |
|------|--------|
| **Covered** | HTTP, modals, forms, lists/tables, drive, toast, request, scene3d, **yay**, **nostr**, scene2d, animate, draw, **plex**, synth, fuzz, nebula, brick, pix, **filterCss**, svg, **inspector**, que, wire, AI, context, bee, shade, shadow, shader, dot, cup, play, coil, forge, art, gpu, file |
| **Missing** | Routing, shared state, user model, permissions, i18n, testing |
| **Thin** | Docs, store flow, theming, loading/error patterns, app lifecycle |

---

## File Layout

```
COFFEE-SOURCE/
├── SOURCE-STATUS.md         ← edition freeze + “where we are” (start here)
├── COMMUNITY-STATUS.md      ← this file (module / shell inventory)
├── COMMUNITY-STACK-GAPS.md
├── COFFEE-AI/
├── COFFEE-ANIMATE/
├── COFFEE-BEE/
├── COFFEE-BLOB/
├── COFFEE-BRICK/
├── COFFEE-CHAT/
├── COFFEE-COMMUNITY/
│   ├── apps/                 (notes, calc, camera, store, etc.)
│   ├── COMMUNITY-HOMESCREEN/ (devsumer grid, devsumer-apps.json)
│   ├── COMMUNITY-DESKTOP/    (Desk Mode, community-desktop-registry.json)
│   ├── FLAGSHIP/             (e.g. BRIGHT-HOUSE, DUCK-IDE, FRUGAL, SPEAK, SCRIBE, SNOW-SHOES)
│   ├── tools/                (cce-validate, cce-packager, cce-check)
│   ├── coffee-community-shell.html
│   ├── shell-apps.json
│   ├── COMMUNITY-ARC.md
│   ├── CCE-SPEC.md
│   └── AI-BUILDERS.md
├── COFFEE-ART/            ← Drawable renderer (coffee-art.js, ART-DEMO.html)
├── COFFEE-CONNECT/
├── COFFEE-CONTEXT/
├── COFFEE-COIL/           ← Preset house (coffee-coil.js, presets/)
├── COFFEE-DRIVE/
├── COFFEE-CUP/            ← Game logic framework (coffee-cup.js, CUP-DEMO.html)
├── COFFEE-DOT/            ← 2D canvas render engine (coffee-dot.js, DOT-DEMO.html)
├── COFFEE-DRAW/
├── COFFEE-FORGE/          ← Generative engine (coffee-forge.js, FORGE-DEMO.html)
├── COFFEE-FILE/           ← File System Access (coffee-file.js, FILE-DEMO.html)
├── COFFEE-FILTER/        ← CSS filter strings (coffee-filter.js, FILTER-DEMO.html)
├── COFFEE-SHOT/          ← Filtered video stills (coffee-shot.js, SHOT-DEMO.html)
├── COFFEE-FORMS/
├── COFFEE-GPU/            ← Raw WebGPU 3D (coffee-gpu.js, GPU-DEMO.html)
├── COFFEE-FUZZ/
├── COFFEE-GRAPH/
├── COFFEE-LIST/
├── COFFEE-MODAL/
├── COFFEE-NEBULA/
├── COFFEE-PIX/
├── COFFEE-PLAY/           ← Game API on CUP + DOT (coffee-play.js, PLAY-DEMO.html)
├── COFFEE-QUE/
├── COFFEE-REQUEST/
├── COFFEE-SCENE2D/
├── COFFEE-SCENE3D/
├── COFFEE-SHADE/           ← WebGPU engine (coffee-shade.js, SHADE-DEMO.html)
├── COFFEE-SHADER/          ← WGSL, demos (SHADER-DEMO.html, TEST/)
├── COFFEE-SHADOW/          ← Presets (coffee-shadow.js, presets/liquid, presets/layered)
├── COFFEE-SVG/
├── COFFEE-SYNTH/
├── COFFEE-TABLE/
├── COFFEE-TOAST/
├── COFFEE-WIRE/
└── COFFEE-UI/
```
