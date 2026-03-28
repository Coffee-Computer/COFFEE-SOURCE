# COFFEE-SHADER

WGSL shader content, demos, and POC for the **shadow → shade → shader** tri-arc.

## Tri-Arc

- **Shadow** (COFFEE-SHADOW) — preset loader, fetches JSON
- **Shade** (COFFEE-SHADE) — WebGPU engine, runs shaders
- **Shader** (here) — WGSL, demos, POC

## Contents

| Item | Description |
|------|-------------|
| `SHADER-DEMO.html` | Full demo: shadow + shade + Coffee UI. Layered & liquid presets, JSON editor |
| `TEST/SHADER-POC1.html` | Original inline POC (liquid plasma) |
| `TEST/shadernotes.md` | Architecture notes, tri-arc, layering |

## Layer Modes (WGSL)

- `background` — solid color
- `liquid` — plasma / iterative distortion
- `waves` — sine/cosine wave pattern
- `lines` — grid overlay

## Usage

```js
// Via shadow (loads preset from JSON)
const shade = await coffee.shadow.run({ canvas: '#c', shader: 'layered', preset: 'ocean' });

// Via shade directly
const shade = coffee.shade({ canvas: '#c', config: { layers: [...] } });
await shade.start();
```

## Serve

Requires HTTP (fetch for presets). `npx serve COFFEE-SOURCE` or your dev server.
