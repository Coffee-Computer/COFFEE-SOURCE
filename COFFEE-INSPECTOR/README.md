# COFFEE-INSPECTOR

Domain-agnostic property panel: **`coffee.inspector(opts)`** on `window.coffee`.

## API

| Option | Description |
|--------|-------------|
| `mount` | CSS selector or `HTMLElement` |
| `title` | Panel heading (default `Properties`) |
| `emptyText` | Message when nothing is selected |
| `sections` | `[{ title?, fields: [{ key, type, label, ... }] }]` |
| `syncFrom` | `() => null \| object` — `null` shows empty state; object keys map to fields |
| `syncTo` | `(key, value) => void` — user edited a field |
| `onDelete` | Optional; shows Delete button |
| `showDelete` | Default `true` if `onDelete` is set |

**Field `type`:** `color` | `range` | `text` | `number` — for `range`, use `min`, `max`, `step`.

**Returns:** `{ update(), destroy() }` — call **`update()`** after selection or external changes.

## Load order

1. **`coffee-control.js`** (optional; for save/load in apps)
2. **`coffee-ui.js`** (optional; themed inputs/sliders/buttons)
3. **`coffee-inspector.js`**

Works without `coffee-ui` using plain HTML controls.

## Pairing with engines

- **coffee.svg** — `syncFrom` reads selected shape attrs; `syncTo` writes them; `update()` after select/drag.

## CCE

Registered as **`inspector`** in the Coffee Community Extension surface.
