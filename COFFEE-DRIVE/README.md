# coffee.drive()

Simple IndexedDB storage for Community apps. Load after `coffee-control.js`.

## Diff from full CoffeeStorage (coffee-storage.js)

| Feature | coffee.drive() | CoffeeStorage |
|---------|----------------|---------------|
| Schema | None (single store) | Yes |
| API | `coffee.drive(appName)` → `{ save, load, list, remove, clear, count, getInfo }` | Class-based, full CRUD |
| Export/import | No | Yes |
| Query / range / search | No | Yes |
| Use case | Community apps, quick persistence | Pro apps, complex data |

## Usage

```html
<script src="path/to/coffee-control.js"></script>
<script src="path/to/coffee-drive.js"></script>
```

```js
const drive = coffee.drive('my-app');

// Save (id required; auto-generated if omitted)
await drive.save({ id: 'note-1', text: 'Hello', updated: Date.now() });

// Load
const item = await drive.load('note-1');

// List all
const items = await drive.list();

// Remove
await drive.remove('note-1');

// Clear
await drive.clear();

// Count
const n = await drive.count();

// Storage info (quota, usage)
const info = await drive.getInfo();
```

## Related

`coffee.wire.drive(appName)` uses Drive for que persistence. See COFFEE-WIRE/README.md.

## Demo

Open `DRIVE-DEMO.html` in a browser.
