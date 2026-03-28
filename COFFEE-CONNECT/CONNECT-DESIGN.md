# coffee.connect() — Design Doc

Unified connection API supporting **Nostr** (relay/WebSocket) and **PeerJS** (P2P/private room). Both methods you already use and know work.

---

## The Two Methods

| Method | Transport | Discovery | Identity | Use Case |
|--------|-----------|-----------|-----------|----------|
| **nostr** | WebSocket → relay | Relay queries (kind 0, etc.) | Hex pubkey | Decentralized messaging, global feed |
| **peer** | WebRTC via PeerJS | Room-key prefix scan | `roomKey-{slot}` | Private rooms, local drop, agent join |

**Nostr** — `NOSTR-DISCOVERY-ENGINE1.html`: `wss://relay.damus.io`, REQ/EVENT, discovery via relay.

**PeerJS** — Two patterns you use:
1. **Room key** (`PEERJS-DISCOVERY-ENGINE1.html`): `global-lobby-7` — shared key, scan `roomKey-0`..`roomKey-N`
2. **Local drop** (`PEERJS-LOCALDROP-RTC.html`): `local-drop-{ipHash}-{slot}` — same WiFi, IP-hash room

---

## Proposed Structure: One API, Two Transports

```js
coffee.connect({
  method: 'nostr',   // or 'peer'
  // Nostr-specific
  relay: 'wss://relay.damus.io',
  // Peer-specific (pick one style)
  room: 'my-secret-room',           // room-key style
  // room: 'local-drop',             // IP-hash style (auto-detect)
  // room: 'agent-xyz123',           // agent join style
  // Callbacks (same for both)
  onOpen: () => {},
  onMessage: (msg) => {},
  onClose: () => {},
  onPeerJoin: (peerId) => {},       // peer only
  // Options
  autoReconnect: true,
});
// Returns: { send, subscribe, close, status, peers? }
```

---

## Why One API, Not Two

**Option A: `coffee.connectNostr()` + `coffee.connectPeer()`**
- Pros: Explicit, no config branching
- Cons: Two surfaces to maintain, apps must choose at call site

**Option B: `coffee.connect({ method: 'nostr' })` + `coffee.connect({ method: 'peer' })`**
- Pros: Single entry point, same return shape, easy to add `method: 'webrtc'` later
- Cons: Config differs by method (relay vs room)

**Recommendation: Option B.** One `coffee.connect()`, `method` selects transport. Return object is normalized so app code doesn't care which backend is used.

---

## Unified Return Interface

Both methods return the same shape:

```js
const conn = coffee.connect({ method: 'nostr', relay: '...' });
// or
const conn = coffee.connect({ method: 'peer', room: 'lobby' });

conn.status;        // 'connecting' | 'connected' | 'disconnected'
conn.send(data);    // Send (format depends on method, but app can pass { type, payload })
conn.subscribe(filter);  // Nostr: filter; Peer: N/A (all peers)
conn.close();
conn.on(event, fn); // Optional event emitter style
```

**Method-specific extras:**
- **Nostr:** `conn.publish(event)` — signed event to relay
- **Peer:** `conn.peers` — Set of peer IDs, `conn.sendTo(peerId, data)`

---

## File Layout

```
COFFEE-SOURCE/COFFEE-CONNECT/
├── coffee-connect.js      # Main API, dispatches to transports
├── connect-nostr.js       # Nostr transport (or inline)
├── connect-peer.js        # PeerJS transport (or inline)
├── CONNECT-DESIGN.md      # This file
└── AI-CONNECT-GUIDE.md    # For AI usage (later)
```

**Dependencies:**
- **Nostr:** `nostr-tools` (or minimal NIP-01 impl) — you already use it
- **Peer:** `peerjs` — you already use it

Load order: `coffee-control` → `coffee-ui` → `coffee-connect`. Transports can be lazy-loaded or bundled.

---

## Config by Method

### Nostr

```js
coffee.connect({
  method: 'nostr',
  relay: 'wss://relay.damus.io',
  relays: ['wss://a', 'wss://b'],  // optional multi-relay
  privateKey: 'hex...',           // optional, for signing
  onOpen: () => {},
  onMessage: (event) => {},       // { kind, pubkey, content, ... }
  onClose: () => {},
  autoReconnect: true,
});
```

### Peer (room-key)

```js
coffee.connect({
  method: 'peer',
  room: 'my-secret-room',
  scanRange: 20,                  // IDs to scan: room-0..room-19
  onOpen: (myId) => {},
  onMessage: (peerId, data) => {},
  onPeerJoin: (peerId) => {},
  onPeerLeave: (peerId) => {},
  onClose: () => {},
});
```

### Peer (local-drop)

```js
coffee.connect({
  method: 'peer',
  room: 'local-drop',             // Special: use IP hash
  scanRange: 10,
  // ... same callbacks
});
```

---

## Implementation Notes

1. **Nostr transport** — Wrap your existing `connectToRelay()` logic. Handle REQ/EVENT, expose `subscribe(filter)`, `publish(event)`.
2. **Peer transport** — Wrap `new Peer(roomKey-slot)`, `peer.on('connection')`, scan loop. Expose `peers`, `sendTo(peerId, data)`.
3. **Shared** — `status`, `close`, `autoReconnect` (exponential backoff), `onOpen`/`onClose`.
4. **Message format** — Let app pass objects; Nostr serializes to NIP-01, Peer sends `JSON.stringify`.

---

## Summary

- **One** `coffee.connect(config)` with `method: 'nostr' | 'peer'`
- **Same** return interface: `status`, `send`, `close`
- **Method-specific** options: `relay` vs `room`, `subscribe` vs `peers`/`sendTo`
- **Both** use what you already have: Nostr relays + PeerJS room/local-drop

This keeps the API small while supporting both patterns you know work.
