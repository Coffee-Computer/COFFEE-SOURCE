# Ghost Network

- **`GHOST-NETWORK-ALPHA.html`** — Nostr-backed channels: each channel slug maps to a `t` tag value `coffee-ghost-v1-{slug}`. Same relay + same tag = same room. **Default channel is `ghost`** (fresh-ish public lobby); **`general`** stays in the list for legacy/tests. Override with `?channel=…`.
- **`TEST/GHOST-NETWORK1-POC.html`** — UI mock only (no network); use Alpha for real chat.

## Share / join

- Open: `GHOST-NETWORK-ALPHA.html?channel=my-room` (or `?room=my-room`).
- In-app: **Copy room link** copies the current page URL with `channel` set.

## Stack

`coffee-control` → **`coffee-ui`** (`coffee.input`, `coffee.button`, `coffee.label`) → `coffee-toast` → **nostr-tools** (bundle) → **`coffee-connect.js`** (`method: 'nostr'`) → **`coffee-nostr.js`** (`coffee.nostr` — kind `0` display names, `localStorage` cache).

Layout / chat chrome still uses **`GHOST-NETWORK-ALPHA.css`** (`.gh-*`); controls use Coffee theme tokens (`--coffee-accent`, etc.).

**Narrow layout (≤720px shell width):** relay rail hidden; **hamburger** opens a **slide-out drawer** (channels, join, relay). Uses **container queries** on `.gh-app` so **narrow iframes** (e.g. `ANTI-SOCIAL-SWITCHER.html`) get the same behavior as a phone, not only `viewport` width. Tap backdrop, **×**, **Escape**, or pick a channel to close. Widen shell or desktop viewport closes the drawer.

**Query flags:** `?compact=1` or `?embed=1` hides the long hint line and tightens message/composer padding (used by the Anti-Social switcher’s Ghost tab).

**Viewport:** `viewport-fit=cover` for safe-area on notched devices.

Identity: random **hex** secret key in `localStorage` (`ghost_network_sk_hex`).

## Relay caveat

Everyone must use relays that **index** the same events (default `wss://relay.damus.io`). Changing relay = different visibility unless you multi-relay later.

## vs DND

- **Ghost** — many people, **async** on relays, **channel** = tag filter.
- **DND** — **WebRTC** dial **1:1** (or small PeerJS room), not Nostr feed.
