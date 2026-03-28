# coffee.connect() — AI Builder Guide

Architecture, API, and usage notes for AI assistants.

---

## Overview

**coffee.connect()** is a unified connection API supporting two transports:
- **nostr** — WebSocket to Nostr relays (decentralized messaging)
- **peer** — WebRTC via PeerJS (private rooms, local drop)

Load after `coffee-control.js`. Requires `nostr-tools` for Nostr, `peerjs` for Peer.

---

## Load Order

```html
<script src="coffee-control.js"></script>
<script src="https://unpkg.com/nostr-tools@1.17.0/lib/nostr.bundle.js"></script>
<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
<script src="coffee-connect.js"></script>
```

Load nostr-tools and peerjs only when using that method.

---

## API

### `coffee.connect(config)`

| Option | Type | Method | Description |
|--------|------|--------|-------------|
| `method` | `'nostr'` \| `'peer'` | both | Transport (default: `'nostr'`) |
| `relay` | string | nostr | Relay URL (default: `wss://relay.damus.io`) |
| `room` | string | peer | Room key or `'local-drop'` for IP-hash |
| `privateKey` | string | nostr | Hex key for signing events |
| `scanRange` | number | peer | IDs to scan (default: 20) |
| `onOpen` | `() => void` | both | Called when connected |
| `onMessage` | `(event)` or `(peerId, data)` | both | Incoming data |
| `onClose` | `() => void` | both | Called when disconnected |
| `onPeerJoin` | `(peerId) => void` | peer | Peer joined |
| `onPeerLeave` | `(peerId) => void` | peer | Peer left |
| `onIncomingCall` | `(call) => void` | peer | Incoming media call (call.answer(stream)) |
| `onStatus` | `(status) => void` | both | Status changes |
| `autoReconnect` | boolean | nostr | Reconnect on close (default: false) |
| `maxReconnectAttempts` | number | nostr | Cap (default: 10) |

---

## Return Interface

### Common (both methods)

| Property/Method | Description |
|-----------------|-------------|
| `status` | `'connecting'` \| `'connected'` \| `'disconnected'` |
| `close()` | Disconnect and cleanup |

### Nostr-specific

| Method | Description |
|--------|-------------|
| `subscribe(filter)` | Send REQ. Returns `{ close() }` |
| `publish(event)` | Send signed event. Auto-signs if `privateKey` in config |
| `send(data)` | Publish as kind 1 or pass event object |

### Peer-specific

| Property/Method | Description |
|-----------------|-------------|
| `peers` | `Set` of peer IDs |
| `myId` | This peer's ID |
| `sendTo(peerId, data)` | Send to one peer |
| `send(data)` | Broadcast to all connected peers |
| `call(peerId, stream)` | Start media call (returns MediaConnection) |
| `scan()` | Re-run discovery scan |

---

## Room Patterns

### Room-key (`room: 'my-secret'`)

- Peer IDs: `my-secret-0`, `my-secret-1`, ... `my-secret-(scanRange-1)`
- Anyone with the room key can discover others
- Uses PeerJS cloud (0.peerjs.com) for signaling

### Local-drop (`room: 'local-drop'`)

- Peer IDs: `local-drop-{ipHash}-{slot}`
- `ipHash` = first 8 chars of `btoa(publicIP)`
- Same WiFi = same IP = same room
- Requires `api.ipify.org` for IP (or falls back to random)

### Agent join (`room: 'agent-xyz123'`)

- Same as room-key; use a unique key per session
- e.g. `agent-` + random string for one-time join links

---

## Nostr Event Format

```js
conn.publish({
  kind: 1,
  pubkey: '...',      // optional if privateKey in config
  created_at: Math.floor(Date.now() / 1000),
  content: 'Hello',
  tags: []
});
```

With `privateKey` in config, `publish` auto-adds `id` and `sig`.

---

## Implementation Notes

- **Nostr:** Single WebSocket per connection. `subscribe` sends REQ; incoming EVENTs go to `onMessage`.
- **Peer:** `peer.on('connection')` sets up DataChannels. Scan loops through `room-0`..`room-N` and attempts connect; successful opens add to `peers`.
- **Local-drop:** `init()` fetches IP, hashes, then creates Peer. Scan uses same prefix derived from `myId`.

---

## File Layout

```
COFFEE-SOURCE/COFFEE-CONNECT/
├── coffee-connect.js
├── CONNECT-DEMO.html
├── CONNECT-DESIGN.md
└── AI-CONNECT-GUIDE.md
```

---

## Minimal Examples

**Nostr:**
```js
const conn = coffee.connect({
  method: 'nostr',
  relay: 'wss://relay.damus.io',
  onOpen: () => conn.subscribe({ kinds: [0], limit: 10 }),
  onMessage: (ev) => console.log(ev)
});
```

**Peer:**
```js
const conn = coffee.connect({
  method: 'peer',
  room: 'my-room',
  onOpen: (id) => console.log('My ID:', id),
  onMessage: (peerId, data) => console.log(peerId, data),
  onPeerJoin: (id) => conn.sendTo(id, { hello: true })
});
```
