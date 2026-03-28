# coffee.skater

Object-based CSS shader engine. JSON keyframes → CSS filter + transform.

## Schema

| Property | Range | Maps to |
|----------|-------|---------|
| `hue` | 0–360 | `hue-rotate()` |
| `scale` | 0.5–2 | `scale()` |
| `skew` | -90–90 | `skewX()` |
| `blur` | px | `blur()` |
| `invert` | 0–1 | `invert()` |

## API

```js
const s = coffee.skater({ target: '#stage', onState: (state) => {} });

s.compile([{ hue: 0, scale: 1 }, { hue: 360, scale: 2 }]);
s.start();
s.stop();
s.loadPreset('psycho');  // returns JSON string
s.getState();            // current state
```

## Presets

- `psycho` — hue + scale oscillation
- `ghost` — skew + blur + invert pulses
- `default` — sample keyframe set

## Demo

`SKATER-DEMO.html` — Coffee UI + live editor.
