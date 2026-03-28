# COFFEE-CODE

Batteries-included **code / markdown editor**: `coffee.monaco` with stable defaults (markdown, dark theme, no minimap).

## Load order

1. `coffee-control.js` (optional)
2. `coffee-ui.js` (for demos / app chrome)
3. `coffee-frame.js`
4. `coffee-monaco.js`
5. `coffee-code.js`

## Defaults

| Option | Default |
|--------|---------|
| `language` | `markdown` |
| `theme` | `vs-dark` |
| `readOnly` | `false` |
| `minimap` | `false` |

Override any option by passing it to `create()`.

## API

Same as **`coffee.monaco`**:

```js
const api = await coffee.code.create(container, { value: '...', language: 'typescript' });
await api.getValue();
api.onChange((v) => {});
api.destroy();
```

## Demo

`CODE-DEMO.html` — split view: **coffee.code** (Monaco) + **coffee.markdown** preview (requires `marked` + `coffee-markdown.js`).

## Stack

`coffee.frame` → `coffee.monaco` → **`coffee.code`**
