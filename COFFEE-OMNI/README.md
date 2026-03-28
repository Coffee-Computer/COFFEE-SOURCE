# COFFEE-OMNI

Headless helpers for **Hyper-Web**, **Coffee Viz** (legacy wire), and **CCE** hosts: manifest `hyper` / `omni` schema, inspector section shapes, and timeline **`postMessage`** payloads.

## Load

```html
<script src="../COFFEE-CONTROL/TEST/coffee-control.js"></script>
<!-- Optional: browser CCE checks -->
<script src="../COFFEE-COMMUNITY/tools/cce-validate.js"></script>
<script src="./coffee-omni.js"></script>
```

## API (`window.coffee.omni`)

| Method | Description |
|--------|-------------|
| `parseSchemaFromManifest(manifest)` | Reads `manifest.hyper` or `manifest.omni` → `{ controls: [...] }` |
| `inspectorSectionsFromControls(controls, sectionTitle?)` | Builds `coffee.inspector` `sections` |
| `defaultPropsFromControls(controls)` | Flat default props object |
| `mergeRegistryEntry(layer, registryEntry)` | Merge name, src, schema from a registry row |
| **`hyperTick(time, playing)`** | **`{ type: 'hyper-tick', time, playing }`** — **Hyper-Web α** host → guest |
| **`isHyperTickMessage(data)`** / **`isHyperReadyMessage(data)`** | Guards for **`hyper-tick`** / **`hyper-ready`** |
| **`hyperReadyMessage()`** | **`{ type: 'hyper-ready' }`** (guest → host) |
| `hyperPropMessage(key, value)` | `{ type: 'hyper-prop', key, value }` |
| `validateHtml(html)` / `validateContent(content)` | Delegates to `cceValidate` if present |
| **`vizTick`**, **`isVizReadyMessage`**, **`isVizTickMessage`** | **Legacy** — `{ type: 'coffee-viz', … }` for **Coffee Viz β** / `html-clip-protocol.md` |

## Hyper-Web guests

Use **`FLAGSHIP/HYPER-WEB/hyper-web-guest.js`** + **`hyper-tick`** / **`hyper-prop`**. Example: **`HYPER-GUEST-DEMO.html`**.

## Manifest extension (optional)

See **`omni-schema.example.json`** and **`CCE-SPEC.md`**.

## Demos

- `OMNI-DEMO.html` — CCE-safe page + validate snippet
- `../COFFEE-COMMUNITY/FLAGSHIP/HYPER-WEB/HYPER-WEB-ALPHA.html` — Hyper-Web host
