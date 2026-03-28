# coffee.coil

Template/preset house for generative art. Step 1 of COIL → FORGE → ART pipeline.

## Usage

```js
const preset = await coffee.coil.load('flow', 'default', { baseUrl: './presets/' });
// { engine: 'flow', params: { complexity, speed, hue, zoom }, seed? }
```

## API

- `coffee.coil.load(engine, preset, opts)` — load preset (Promise)
- `coffee.coil.list(opts)` — list available presets (Promise)

## Preset format

```json
{
  "params": {
    "complexity": 0.005,
    "speed": 1.2,
    "hue": 30,
    "zoom": 1
  },
  "seed": 123.45
}
```

Optional `seed` for engines that use randomness (e.g. flow).

## Presets (from ART-POC1)

- **flow**: default, warm, cool
- **fractal**: default
- **orbit**: default
- **glitch**: default

## Demos

- `COIL-DEMO.html` — load presets, display JSON
