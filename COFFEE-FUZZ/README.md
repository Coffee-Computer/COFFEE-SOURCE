# coffee.fuzz

Audio FX chain. Homage to the fuzz pedal. Works with coffee.Synth or any AudioNode.

## Usage

```html
<script src="coffee-synth.js"></script>
<script src="coffee-fuzz.js"></script>
```

```javascript
// Synth → reverb → output
const synth = new coffee.Synth('sawtooth');
const reverb = coffee.fuzz.reverb(2, 3, 0.3);
synth.connect(reverb.input);
reverb.output.connect(coffee.synth.output);
synth.play('A4');

// Chain: synth → reverb → delay → fuzz → output
const rev = coffee.fuzz.reverb(2, 3, 0.35);
const dly = coffee.fuzz.delay({ time: 0.3, feedback: 0.4, mix: 0.5 });
const fz = coffee.fuzz.fuzz(0.5);
synth.connect(rev.input);
rev.output.connect(dly.input);
dly.output.connect(fz.input);
fz.output.connect(coffee.synth.output);
```

## API

| Effect | Params | Returns |
|--------|--------|---------|
| `coffee.fuzz.fuzz(drive)` | drive 0–1 | `{ input, output }` |
| `coffee.fuzz.delay(opts)` | `{ time, feedback, mix }` | `{ input, output }` |
| `coffee.fuzz.reverb(seconds, decay, dryWet)` | seconds, decay, dryWet 0–1 | `{ input, output }` |
| `coffee.fuzz.filter(type, freq, Q)` | lowpass\|highpass\|bandpass, Hz, resonance | `{ input, output }` |

## Demo

`FUZZ-DEMO.html` — Synth + FX toggles (reverb, delay, fuzz).
