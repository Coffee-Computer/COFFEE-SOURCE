# coffee.chat — Message Format & API

Chat layer over coffee.connect(). Exposes send, sendBroadcast, and call (media).

---

## Message Format

```json
{
  "type": "chat",
  "text": "Hello",
  "from": "peer-id or pubkey",
  "ts": 1234567890123
}
```

Apps can send raw data via `conn.sendTo()` / `conn.send()` — this format is optional.

---

## API

### `coffee.chat({ conn, myId? })`

| Option | Description |
|--------|-------------|
| `conn` | Connection from coffee.connect() (required) |
| `myId` | Sender ID for `from` field (default: conn.myId for Peer) |

### Return

| Method/Prop | Description |
|-------------|-------------|
| `chat.send(peerId, text)` | Send to one peer (Peer only) |
| `chat.sendBroadcast(text)` | Send to all peers (Peer) or publish (Nostr kind 1) |
| `chat.sendRaw(peerId, data)` | Send raw data to one peer |
| `chat.call(peerId, stream)` | Start media call (Peer only, forwards to conn.call) |
| `chat.conn` | Underlying connection |
| `chat.peers` | Set of peer IDs (Peer only) |

---

## Media (Peer)

Register `onIncomingCall` when creating the connection:

```js
const conn = coffee.connect({
  method: 'peer',
  room: 'lobby',
  onIncomingCall: (call) => {
    call.answer(localStream);
    call.on('stream', (remote) => { videoEl.srcObject = remote; });
  }
});
const chat = coffee.chat({ conn });
chat.call(peerId, myStream);
```

---

## Load Order

```
coffee-control.js → coffee-ui.js → coffee-connect.js → coffee-chat.js
```

## Coffee UI Components

For chat UIs, use:
- **coffee.chatBubble(text, outgoing)** — Message bubble (outgoing = true/false)
- **coffee.chatInput({ placeholder, onSend })** — Input + Send button row, returns `{ el, input, sendBtn }`
