# Terminal plugins (folder-based)

Each plugin is usually a **folder** next to this README:

| File | Role |
|------|------|
| `plugin.json` | Declares `commands[]` (merged into `coffee.terminalSlash.commands`). Use `handler` for a string id. |
| `plugin.js` | Optional. Registers handlers: `coffee.terminalExtensions.registerHandler('ext:…', fn)`. |

The **root** `../terminal-extensions.json` lists plugins by **URL-relative path** (same idea as `TERMINAL/COFFEE_TERMINAL/…` — separate files, not inlined in the flagship JS):

```json
"plugins": [
  { "manifest": "PLUGINS/demo-grind/plugin.json", "script": "PLUGINS/demo-grind/plugin.js" }
]
```

Paths resolve relative to the **folder containing** `terminal-extensions.json`. Serve the flagship over HTTP so `fetch` + dynamic `<script src>` work.
