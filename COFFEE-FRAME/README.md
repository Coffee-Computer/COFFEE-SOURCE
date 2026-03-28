# COFFEE-FRAME

Reusable **iframe + `postMessage` RPC** for embedding same-origin guests (Monaco host, tools, sandboxes).

## Protocol

| Direction | Payload |
|-----------|---------|
| Guest → parent | `{ cf: 1, t: 'ready' }` when ready |
| Parent → guest | `{ cf: 1, t: 'req', id, method, args }` |
| Guest → parent | `{ cf: 1, t: 'res', id, ok, result?, err? }` |
| Guest → parent (optional) | `{ cf: 1, t: 'evt', name, payload }` |

## API

```js
const rpc = coffee.frame.mount(container, srcUrl, { title?, sandbox?, readyTimeoutMs? });
await rpc.ready;
const value = await rpc.request('methodName', [arg1, arg2]);
rpc.onEvent((name, payload) => { ... });
rpc.destroy();
```

## Load order

`coffee-control.js` (optional) → `coffee-frame.js`

## Guests

- `guest/echo.html` — test guest for FRAME-DEMO
- `COFFEE-MONACO/host/monaco-host.html` — Monaco editor (used by `coffee.monaco`)

Use a **specific `targetOrigin`** instead of `*` in production when both frames are on a known origin.
