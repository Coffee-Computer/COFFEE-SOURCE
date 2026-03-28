# .cce (Coffee Community Edition) File Format Spec

A `.cce` file is a **ZIP archive** containing a Coffee-stack app. If it ain't Coffee, it ain't Community.

---

## ⚠️ CRITICAL: Strict Validation (AI / Builders Read This)

**Validation is intentionally STRICT.** Only a curated list of Coffee APIs passes. Do NOT relax this.

- **Why:** Lax validation (e.g. any `coffee.*`) would let custom/dangerous code through. Community targets basic users; we keep the surface safe and controlled.
- **Rule:** Apps must use **only** the approved Coffee UI/Control APIs. The validator checks a fixed list. New APIs require updating `cce-validate.js`.
- **If building Coffee apps:** Use `coffee.button`, `coffee.textarea`, `coffee.input`, `coffee.stack`, `coffee.row`, etc. — the known APIs. Do not invent `coffee.customThing` and expect it to pass.
- **If modifying cce-check / cce-validate / packager:** Do NOT change the Coffee usage check to a generic `coffee\.[a-zA-Z]+` pattern. Keep the curated list. Add new methods explicitly when the Coffee stack grows.

- **Lax validation (forked):** Use at your own risk. The Coffee team does not ship malicious code; we cannot speak for forks or third parties. Relaxing validation removes the safety guardrail.

---

## Structure

```
myapp.cce (zip)
├── manifest.json    # Required. App metadata.
├── index.html       # Required. Entry point (or path in manifest).
└── assets/          # Optional. Images, fonts, etc.
    ├── icon.png
    └── ...
```

---

## manifest.json

```json
{
  "name": "Notes",
  "id": "notes",
  "version": "1.0.0",
  "entry": "index.html",
  "icon": "assets/icon.png",
  "permissions": []
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Display name |
| `id` | yes | Unique slug (a-z, 0-9, -) |
| `version` | yes | Semver string |
| `entry` | yes | Path to HTML entry (default `index.html`) |
| `icon` | no | Path to icon (PNG/SVG) or emoji |
| `color` | no | Hex color for shell icon (e.g. `#eab308`) |
| `description` | no | Short description for store |
| `permissions` | no | Array of requested permissions (e.g. `camera`, `storage`) |
| `hyper` / `omni` | no | Optional **OMNI** schema: `{ "controls": [ { "key", "type", "label", "min", "max", "default", "section" } ] }` for host inspectors (Hyper-Web). See `COFFEE-OMNI/README.md`. |

---

## Inline Config (Single HTML)

For single `.html` uploads without a manifest, metadata can be embedded in the HTML.

### Meta tags

```html
<meta name="cce:name" content="Notes">
<meta name="cce:id" content="notes">
<meta name="cce:icon" content="📝">
<meta name="cce:color" content="#eab308">
<meta name="cce:description" content="Quick notes with save">
```

| Meta | Required | Description |
|------|----------|-------------|
| `cce:name` | yes | Display name |
| `cce:id` | yes | Slug (a-z, 0-9, -) |
| `cce:icon` | no | Emoji or path to icon |
| `cce:color` | no | Hex color |
| `cce:description` | no | Short description |

### JSON script block (alternative)

```html
<script type="application/json" data-cce-config>
{"name":"Notes","id":"notes","icon":"📝","color":"#eab308","description":"Quick notes with save"}
</script>
```

The validator parses meta tags first; if none found, it looks for `data-cce-config`.

---

## Validation Rules (Foundry)

For a package to be valid `.cce`:

### Must have
- `manifest.json` at root
- `index.html` (or path in `manifest.entry`)
- **Coffee Control** — script must load `coffee-control.js` (or equivalent)
- **Coffee UI** — script must load `coffee-ui.js` (or equivalent)
- **Coffee usage** — entry HTML/JS must use **approved APIs only** (curated list in cce-validate.js). Not any `coffee.*` — only: button, textarea, input, slider, select, label, link, text, para, spinner, msg, card, heading, row, col, stack, appShell, container, injectTheme, inspector, camera, switchCamera, microphone, record, streamSpectrum, save, load, list, storageQuota, theme, graph, chatInput, chatBubble, connect, chat, drive, imageToBlob, toast, request, modal, dialog, form, table, scene3d, scene2d, animate, draw, synth, fuzz, nebula, brick, ai, context, bee, pix, plex, filterCss, shot, svg, que, wire, snake, rusty, skater, floatGroup, floatStack, iconButton, pillStrip, toolDock, **omni** (Hyper / OMNI schema + viz helpers), **frame** (`coffee.frame` iframe RPC)

### Must NOT have
- React, Vue, Angular, Svelte
- Tailwind, Bootstrap, other CSS frameworks
- jQuery, Lodash (unless minimal and justified)
- Google Analytics, tracking scripts
- External CDNs for UI/framework code (fonts OK if minimal)

The **Coffee Packager** and **cce-check** (CLI + Store upload) enforce these. Invalid packages are rejected.

### Validation verified

| App | Result |
|-----|--------|
| `notes-cce` (manifest + Coffee stack) | ✓ Valid |
| `notes.html` (inline meta + Coffee stack) | ✓ Valid |
| `notes-json-config.html` (data-cce-config + Coffee stack) | ✓ Valid |
| `tailwind-test` (Tailwind CDN) | ❌ Rejected — Tailwind, no Coffee stack, no metadata |
| Raw HTML (no metadata) | ❌ Rejected — No metadata found |

**Implementation verified:** Single HTML uploads require inline metadata (meta tags or `data-cce-config`). Raw HTML with no metadata is rejected.

---

## Packager

```bash
node tools/cce-packager.js ./myapp-folder
# → myapp.cce
```

Validates → zips → outputs `.cce` with Coffee signature in manifest.

---

## Loading .cce in Community Shell

1. **Hosted** — App is extracted and served; shell loads `https://.../myapp/index.html` (current model).
2. **Direct** — Shell fetches `myapp.cce`, unzips in-browser (JSZip), creates blob URLs, loads entry in iframe. (Future.)
