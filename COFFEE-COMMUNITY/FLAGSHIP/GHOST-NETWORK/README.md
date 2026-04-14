# Ghost Network

- **`GHOST-NETWORK-ALPHA.html`** — Nostr-backed channels: each channel slug maps to a `t` tag value `coffee-ghost-v1-{slug}`. Same relay + same tag = same room. **Default channel is `ghost`** (fresh-ish public lobby); **`general`** stays in the list for legacy/tests. Override with `?channel=…`.
- **`TEST/GHOST-NETWORK1-POC.html`** — UI mock only (no network); use Alpha for real chat.

## Share / join

- Open: `GHOST-NETWORK-ALPHA.html?channel=my-room` (or `?room=my-room`).
- In-app: **Copy room link** copies the current page URL with `channel` set.

## Stack

`coffee-control` → **`coffee-ui`** (`coffee.input`, `coffee.button`, `coffee.label`) → `coffee-toast` → **nostr-tools** (bundle) → **`coffee-connect.js`** (`method: 'nostr'`) → **`coffee-nostr.js`** (`coffee.nostr` — kind `0` display names, `localStorage` cache).

Layout / chat chrome still uses **`GHOST-NETWORK-ALPHA.css`** (`.gh-*`); controls use Coffee theme tokens (`--coffee-accent`, etc.).

**Narrow layout (≤720px shell width):** relay rail hidden; **hamburger** opens a **slide-out drawer** (channels, join, relay). Uses **`container-type: inline-size`** on `.gh-app` (named **`ghost-app`**) so **narrow iframes** (e.g. `ANTI-SOCIAL-SWITCHER.html`) match phone behavior, not only `viewport` width; `@media (max-width: 720px)` duplicates rules when container queries are unavailable. In narrow mode the **main header wraps**: **Copy room link** moves to a **full-width row** under the title so it does not overlap or float. Tap backdrop, **×**, **Escape**, or pick a channel to close. Widen shell or desktop viewport closes the drawer.

**Query flags:** `?compact=1` or `?embed=1` hides the long hint line and tightens message/composer padding (used by the Anti-Social switcher’s Ghost tab). The same query adds **`gh-compact` in `<head>`** so layout runs on first paint; an **inlined `<style id="gh-embed-layout-critical">`** keeps **`#gh-root` → `.gh-chat-area` → `#gh-messages`** as a **flex column with `min-height: 0`** so the message list isn’t height-zero inside the parent iframe (narrow layout uses **`display: flex` on `.gh-app`** instead of a single-cell grid with three children).

**Viewport:** `viewport-fit=cover` for safe-area on notched devices.

Identity: random **hex** secret key in `localStorage` (`ghost_network_sk_hex`).

## Relay caveat

Everyone must use relays that **index** the same events (default `wss://relay.damus.io`). Changing relay = different visibility unless you multi-relay later.

## vs DND

- **Ghost** — many people, **async** on relays, **channel** = tag filter.
- **DND** — **WebRTC** dial **1:1** (or small PeerJS room), not Nostr feed.
