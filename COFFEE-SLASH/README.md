# COFFEE-SLASH

`/` **slash menu** for inserting snippets (markdown blocks by default). **Editor-agnostic** via adapters.

## Load order

- **Textarea:** `coffee-control` (opt) → `coffee-ui` (opt, for CSS vars) → `coffee-slash.js`
- **Monaco:** `coffee-control` → `coffee-ui` → `coffee-frame` → `coffee-monaco` → `coffee-slash.js`  
  (Monaco host must support `getSelectionOffsets`, `replaceRange`, `getCursorScreenPosition` — shipped in `COFFEE-MONACO/host`.)

## API

```js
// Presets: coffee.slash.markdownPresets  →  { id, label, insert }[]

const ta = document.querySelector('textarea');
const h = coffee.slash.attach(coffee.slash.adapters.textarea(ta), {
  commands: coffee.slash.markdownPresets,  // optional
  mountParent: document.body,
  onAfterInsert: () => refreshPreview(),
  onEditorInput: () => refreshPreview()       // textarea: runs on each input
});
h.destroy();

// Monaco / coffee.code
const api = await coffee.code.create(container, opts);
const h = coffee.slash.attach(coffee.slash.adapters.monaco(api), {
  onAfterInsert: () => { api.getValue().then(updatePreview); }
});
api.onChange((payload) => {
  h.notifyChange(payload);   // { value, offset } from host
  updatePreview(payload.value);
});
```

## Scribe stack

`coffee.code` + `coffee.slash` + `coffee.markdown` + `coffee-ui` + `coffee.control` → flagship editor with live preview and slash blocks.
