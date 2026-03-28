# coffee.shadow

Preset loader for coffee.shade. Fetches JSON from `presets/{shader}/{preset}.json`, passes config to shade.

## Tri-Arc

Part of the **shadow → shade → shader** stack:

- **Shadow** — this module (preset holder)
- **Shade** — WebGPU engine (COFFEE-SHADE)
- **Shader** — WGSL (COFFEE-SHADER)

## API

```js
// Load preset only
const config = await coffee.shadow.load('layered', 'ocean', { baseUrl: 'presets/' });

// Load preset and start shade
const shade = await coffee.shadow.run({
  canvas: '#gpuCanvas',
  shader: 'layered',
  preset: 'ocean',
  baseUrl: 'presets/'
});
```

## Preset Structure

```
presets/
├── liquid/           # Flat params (backward compat)
│   ├── default.json
│   ├── ocean.json
│   ├── plasma.json
│   └── intense.json
└── layered/          # Layered config (background + liquid + waves + lines)
    ├── default.json
    ├── sunset.json
    ├── ocean.json
    └── matrix.json
```

## Preset Format

### Liquid (flat)

```json
{
  "color_shift": 2,
  "density": 8,
  "zoom": 1.2,
  "speed": 1,
  "brightness": 1,
  "complexity": 5
}
```

### Layered

```json
{
  "layers": [
    { "mode": "background", "opacity": 1, "blend": "normal", "params": { "color": [0.05, 0.05, 0.1] } },
    { "mode": "liquid", "opacity": 0.8, "blend": "add", "params": { "density": 6, ... } }
  ]
}
```

## Demo

`SHADOW-DEMO.html` — canvas + preset buttons (layered + liquid). Requires HTTP for fetch.
