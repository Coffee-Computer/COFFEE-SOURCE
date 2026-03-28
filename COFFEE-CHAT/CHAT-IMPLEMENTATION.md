# coffee.chat() — Working Implementation Guide

Documentation of the working chat implementation, architecture, and critical bugs encountered during development.

---

## Architecture: How Chat Uses Connect

```
┌─────────────────────────────────────────────────────────────────┐
│  CHAT-DEMO.html (UI)                                             │
│  - Room input, Connect/Disconnect                                │
│  - Peer list (number buttons + Call)                             │
│  - Message area (chatBubbles)                                    │
│  - chatInput (input + Send)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  coffee.chat({ conn })                                           │
│  - Wraps conn, adds message format { type, text, from, ts }      │
│  - send(peerId, text) → conn.sendTo(peerId, msg)                  │
│  - sendBroadcast(text) → conn.send(msg)                          │
│  - call(peerId, stream) → conn.call(peerId, stream)               │
│  - chat.peers = conn.peers                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  coffee.connect({ method: 'peer', room, ... })                   │
│  - Creates Peer with room-0, room-1, ... (or local-drop-{ip}-n)   │
│  - runScan(): peer.connect(targetId) for each slot               │
│  - KEEPS connections when they open (WHISPER pattern)            │
│  - sendTo(peerId, data): uses connections.get(peerId) or        │
│    ensureConnection(peerId, callback) for on-demand connect     │
│  - onMessage(peerId, data), onPeerJoin, onPeerLeave, onIncomingCall │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Connect**: User enters room key → `coffee.connect({ method: 'peer', room })` → Peer gets ID `room-0` (or next free slot) → `runScan()` probes `room-1`, `room-2`, ...
2. **Discovery**: When a probe connection opens → `setupConnection(conn)` → peer added to `peers` and `connections` → `onPeerJoin` fires → UI renders peer buttons.
3. **Send**: User selects peer (clicks number) → `msgInput.dataset.target = pid` → User types and hits Send → `chat.send(target, text)` → `conn.sendTo(target, { type:'chat', text, from, ts })` → DataConnection.send().
4. **Receive**: Remote peer's DataConnection emits `data` → `config.onMessage(peerId, parsed)` → Demo's `addMsg(text, from, false)`.

---

## Load Order

```
coffee-control.js → coffee-ui.js → peerjs.min.js → coffee-connect.js → coffee-chat.js
```

---

## Critical Bugs We Faced & Fixes

### 1. **Status went red immediately on Connect**

**Cause**: PeerJS emits `peer-unavailable` when scan probes connect to non-existent peers. We treated it as a fatal error and disconnected.

**Fix**: Ignore `peer-unavailable` in the Peer error handler — it's expected during scan when probing empty slots.

```js
} else if (err.type === 'peer-unavailable') {
  // Expected during scan; our Peer is still connected
}
```

---

### 2. **Default PeerJS server unreliable**

**Cause**: `new Peer(id)` with no options uses default server (api.peerjs.com), which can fail.

**Fix**: Use explicit server config: `0.peerjs.com` (used elsewhere in codebase).

```js
peer = new PeerClass(fullId, {
  host: config.peerHost || '0.peerjs.com',
  port: config.peerPort ?? 443,
  path: config.peerPath || '/',
  secure: config.peerSecure !== false
});
```

---

### 3. **Scan connections closed too aggressively (LOCALDROP vs WHISPER)**

**Cause**: We tried LOCALDROP-style scan (discover only, close connections, connect on click). That added complexity and timing issues.

**Fix**: Use **WHISPER pattern** — when a scan connection opens, **keep it** for chat. Only close connections that never open within the timeout.

```js
conn.on('open', () => setupConnection(conn)); // KEEP for chat
setTimeout(() => {
  if (!peers.has(targetId)) conn.close();  // only close if never connected
}, 2000);
```

---

### 4. **Send button did nothing — message UI never updated**

**Cause**: `coffee.chatInput({ onSend: fn })` — `extractStyle(opts)` only returns a fixed set of keys (`type`, `placeholder`, `value`, etc.). `onSend` was put into the `style` rest object and never returned. So `onSend` was `undefined`, and `if (typeof onSend === 'function')` was false — the click handler was never attached.

**Fix**: Get `onSend` directly from `opts`, not from `extractStyle`:

```js
const onSend = opts.onSend;  // extractStyle puts this in style, so get directly
const { placeholder = 'Type a message...', style } = extractStyle(opts);
```

---

### 5. **Send button type / form submit**

**Cause**: Buttons default to `type="submit"` in some contexts; could trigger form submit.

**Fix**: `btn.type = 'button'` and `e.preventDefault()` on Enter key in chatInput.

---

### 6. **Connection timing — send before connection ready**

**Cause**: User clicks peer, then immediately types and sends. Connection might not be open yet.

**Fix**: `ensureConnection(peerId, callback)` — if no connection, create one and queue the send in the callback. `pendingConnect` map batches multiple sendTo calls while connecting.

---

## Reference Implementations

| File | Pattern | Notes |
|------|---------|-------|
| `COFFEE_SNAX/SNAX-APPS/WHISPER/WHISPER-4-NEWCHATS.html` | Keep scan connection for chat | One-to-one, simple |
| `COFFEE-DECKER/.../PEERJS/PEERJS-LOCALDROP-RTC.html` | Connect on click | Discover then connect when user selects |
| `COFFEE_2000/APPS/SEECHAT/SEECHAT-4-CHATJUMP.html` | Multi-peer chat | Similar to our demo |

---

## Demo Wiring Checklist

- [ ] `conn` from `coffee.connect()` passed to `coffee.chat({ conn })`
- [ ] `onOpen` → set `chat`, enable `sendBtn`, call `renderPeers()`
- [ ] `onMessage(peerId, data)` → `addMsg(text, from, false)` (extract `data.text`)
- [ ] `onPeerJoin` / `onPeerLeave` → `renderPeers()`
- [ ] Peer button click → set `msgInput.dataset.target = pid`, optionally `conn.connectTo(pid)`
- [ ] `chatInput` `onSend` → `chat.send(target, text)` + `addMsg(text, 'you', true)` for local echo
- [ ] `onIncomingCall` → `call.answer(stream)`, show remote video

---

## Message Format

```json
{
  "type": "chat",
  "text": "Hello",
  "from": "chat-demo-0",
  "ts": 1710789012345
}
```

Receiver parses: `const text = typeof data === 'object' && data.text ? data.text : String(data)`.

---

## App Store / Registry

**CCE validation** (`COFFEE-SOURCE/COFFEE-COMMUNITY/tools/cce-validate.js`):
- Added `chatInput`, `chatBubble`, `connect`, `chat` to allowed Coffee APIs so chat apps can pass validation when packaged as `.cce`.

**App registries** (for home screen / launcher):
- `COFFEE-SOURCE/COFFEE-COMMUNITY/community-app-registry.json` — Chat added (Community shell apps)
