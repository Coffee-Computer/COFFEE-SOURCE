# coffee.peer

**Direct PeerJS data channels** by explicit peer ID — for apps like **DND** (dial a friend), not room-slot discovery (that stays in `coffee.connect`).

## Load order

```html
<script src="coffee-control.js"></script>
<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
<script src="coffee-peer.js"></script>
```

Optional: `coffee-ui.js`, `coffee-toast.js` for app UI.

## API

### `coffee.peer.open(opts) → handle | null`

| Option | Type | Description |
|--------|------|-------------|
| `id` | string | Fixed Peer id |
| `generateId` | `() => string` | If `id` omitted, use this as Peer id |
| *(omit both)* | | Let PeerJS assign a random id |
| `debug` | number | PeerJS debug (default `0`) |
| `peerHost`, `peerPort`, `peerPath`, `peerSecure` | | Custom PeerServer (default: public cloud) |
| `onOpen` | `(myId) => void` | Local peer ready |
| `onError` | `(err) => void` | Peer-level errors |
| `onIncoming` | `(conn, handle) => void` | New `DataConnection`; `handle.bind(conn, {…})` or `conn.close()` |

### `handle`

- `id` — your peer id when open
- `connect(remoteId, { onOpen, onData, onClose, onError })` — outbound; returns wrapped API
- `bind(conn, handlers)` — attach handlers to any `DataConnection` (e.g. incoming)
- `destroy()` — teardown Peer

### Wrapped connection (from `bind` / `connect`)

- `peerId`, `send(data)`, `close()`, `raw`, `open` (boolean when channel open)

## See also

- `../COFFEE-CONNECT/coffee-connect.js` — `method: 'peer'` room scan + Nostr
- `../COFFEE-COMMUNITY/FLAGSHIP/DND/DND-ALPHA.html` — first consumer
