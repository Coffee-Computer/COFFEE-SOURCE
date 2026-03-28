# coffee-blob

Image-to-Blob converter. Standalone util — use with coffee.drive, CoffeeStorage, uploads, etc.

## Usage

```html
<script src="coffee-blob.js"></script>
```

```js
// Basic: compress image to JPEG
const blob = await coffee.imageToBlob(fileInput.files[0]);

// With options
const blob = await coffee.imageToBlob(file, {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  format: 'image/jpeg'  // or 'image/png', 'image/webp'
});

// Preserve original format (PNG stays PNG, keeps transparency)
const blob = await coffee.imageToBlob(file, { preserve: true });

// Save to drive
await coffee.drive('my-app').save({ id: 'pic-1', blob, name: file.name, added: Date.now() });
```

## Options

| Option | Default | Description |
|-------|---------|-------------|
| `maxWidth` | 1920 | Max width (maintains aspect) |
| `maxHeight` | 1920 | Max height (maintains aspect) |
| `quality` | 0.85 | 0–1 for JPEG/WebP (PNG ignores) |
| `format` | `'image/jpeg'` | `image/jpeg`, `image/png`, `image/webp` |
| `preserve` | false | If true, keep original format (PNG→PNG, JPEG→JPEG, WebP→WebP). Preserves transparency. GIF→PNG. |

No dependencies. Works standalone.
