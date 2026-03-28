# COFFEE-MONACO

**Monaco Editor** embedded in an iframe, using **`coffee.frame`** for RPC.

## Load order

1. `coffee-control.js` (optional)
2. `coffee-ui.js` (for demos / page chrome — buttons, cards, theme tokens)
3. `coffee-frame.js`
4. `coffee-monaco.js`

Monaco assets load from **jsDelivr** inside `host/monaco-host.html` (AMD `loader.js` + `vs/` path).

## API

```js
const api = await coffee.monaco.create(container, {
  hostUrl,    // optional override to monaco-host.html
  value: '',
  language: 'markdown',
  theme: 'vs-dark',
  readOnly: false,
  minimap: false
});

await api.getValue();
await api.setValue(text);
await api.layout();
await api.focus();
await api.setTheme('vs');
await api.setLanguage('typescript');
await api.configure({ theme: 'vs-dark' });
api.onChange((payload) => {}); // payload: `{ value, offset }` (offset = UTF-16 index for `coffee.slash`)
await api.getSelectionOffsets(); // `{ start, end }`
await api.replaceRange(start, end, text);
await api.getCursorScreenPosition(); // `{ top, left }` viewport coords or null
api.destroy();
```

## Host page

Serve `host/monaco-host.html` **same-origin** as your app (or set `hostUrl` to full URL). The parent resolves `host/monaco-host.html` relative to `coffee-monaco.js` by default.

## See also

- `COFFEE-CODE` — opinionated defaults on top of `coffee.monaco`
- `COFFEE-FRAME` — generic iframe RPC
