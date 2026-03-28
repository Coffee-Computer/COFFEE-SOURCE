# coffee.shade

Headless WebGPU shader engine. Receives config (preset params or layers), maps to uniforms, runs WGSL, renders to canvas. No UI.

## Tri-Arc

Part of the **shadow → shade → shader** stack:

- **Shadow** — preset loader (COFFEE-SHADOW)
- **Shade** — this engine
- **Shader** — WGSL (COFFEE-SHADER)

## API

```js
const s = coffee.shade({ canvas: '#gpuCanvas', config: { density: 8 } });
await s.start();
s.update({ density: 12 });
s.stop();
```

## Config

### Flat (backward compat)

```js
{ density: 8, color_shift: 2, zoom: 1.2, speed: 1, brightness: 1, complexity: 5 }
```

### Layered

```js
{
  layers: [
    { mode: 'background', opacity: 1, blend: 'normal', params: { color: [0.05, 0.05, 0.1] } },
    { mode: 'liquid', opacity: 0.8, blend: 'add', params: { density: 6, color_shift: 2, ... } },
    { mode: 'waves', opacity: 0.4, blend: 'add', params: { frequency: 8, amplitude: 0.3 } },
    { mode: 'lines', opacity: 0.3, blend: 'normal', params: { grid: 24, thickness: 0.02 } }
  ]
}
```

## Layer Modes

| Mode | Params |
|------|--------|
| `background` | `color` [r,g,b] |
| `liquid` | `density`, `color_shift`, `zoom`, `speed`, `brightness`, `complexity` |
| `waves` | `frequency`, `amplitude`, `speed` |
| `lines` | `grid`, `thickness` |

## Blend Modes

- `normal` — alpha blend
- `add` — additive

## Demo

`SHADE-DEMO.html` — minimal canvas + preset buttons (no shadow).
