# COFFEE-NOSTR

**`coffee.nostr`** — small Nostr layer on top of **`coffee.connect`** (`method: 'nostr'`).

## Load order

```
coffee-control.js → nostr-tools (bundle) → coffee-connect.js → coffee-nostr.js
```

## Requirements

- Your app’s **`onMessage`** must forward **kind `0`** events:

```js
onMessage(ev) {
  if (coffee.nostr.handleEvent(ev)) return;
  // … kind 1, etc.
}
```

Otherwise **`lookupProfile`** subscriptions never populate.

## API

| Method | Description |
|--------|-------------|
| **`handleEvent(ev)`** | Ingest kind `0`; updates cache + pending lookups. Returns `true` if handled. |
| **`lookupProfile(conn, pubkeyHex, cb)`** | Cache-first; else `subscribe` kind `0` + `authors`. `cb(err, { name, about, picture, pubkey })`. |
| **`publishProfile(conn, { name, about, picture })`** | Publish kind `0` JSON `content` (signed by `conn`). |
| **`displayLabel(pubkey, myPubkeyHex)`** | `"You"` / cached `name` / `pubkey.slice(0,8)`. |
| **`getCached(pubkey)`** | Read from memory + `localStorage` cache. |
| **`initials(label)`** | Two-letter avatar hint. |
| **`onProfileUpdate(fn)`** | `fn(pubkey)` on cache updates; returns unsubscribe. |

## Cache

`localStorage` key **`coffee_nostr_profile_cache_v1`**: `{ [pubkey]: { name, about, picture, t } }`.

## See also

- **`coffee.connect`** — `COFFEE-CONNECT/coffee-connect.js`
- Flagship: **`GHOST-NETWORK-ALPHA.html`**
