# coffee.Synth

Web Audio synthesizer. Oscillator types: sine, square, sawtooth, triangle. Lazy AudioContext init (requires user gesture).

## Usage

```html
<script src="coffee-synth.js"></script>
```

```js
const s = new coffee.Synth('sawtooth');
s.play(440);
s.stop(0.5);
```

## API

- `new coffee.Synth(type)` — type: 'sine' | 'square' | 'sawtooth' | 'triangle'
- `s.play(freq)` — play frequency in Hz
- `s.stop(time)` — fade out over time seconds
- `coffee.synth.volume` — master volume 0–1 (default 0.5)
- `coffee.synth.analyzer` — AnalyserNode for visualizers (after init)
- `coffee.synth.init()` — unlock AudioContext (call on user gesture)
- `coffee.Synth.types` — ['sine', 'square', 'sawtooth', 'triangle']

## No dependencies

Uses Web Audio API only. Merges with window.coffee.
