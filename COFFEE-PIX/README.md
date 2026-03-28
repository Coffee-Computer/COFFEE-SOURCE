# coffee.pix

Headless image manipulation engine. Canvas 2D pixel ops. No UI.

## API

```js
const pix = coffee.pix({ canvas });
pix.load(image);                    // Load HTMLImageElement
pix.adjust({ brightness, contrast, saturation });  // -100 to 100
pix.preset('grayscale' | 'sepia' | 'invert' | 'vintage');
pix.reset();
pix.render();                      // Redraw from original + adjustments
pix.hasImage;                      // boolean
pix.adjustments;                   // { brightness, contrast, saturation }
```

## Presets

- `grayscale` — B&W
- `sepia` — Warm brown tone
- `invert` — Negative
- `vintage` — Desaturated warm

## Pair with COFFEE-FILTER

For **CSS** `filter` strings (sepia, blur, grayscale, hue-rotate, …) on the canvas element or **`CanvasRenderingContext2D.filter`**, use **[`coffee.filterCss`](../COFFEE-FILTER/README.md)** — e.g. **`coffee.filterCss.overlay({ sepia, blur, grayscale })`** in **Bright House** so preview and export stay in sync.

## Demo

`PIX-DEMO.html` — Coffee UI (sliders, buttons) + pix engine. Load/drop image, adjust, apply presets.
