# COFFEE-BASE (`coffee.base`)

**Local-first “faux BaaS”** — document **collections** (think tables) backed by **`coffee.que` + `coffee.wire.drive` → IndexedDB**. No SQL; JSON documents only.

## Load order

```html
<script src="…/coffee-control.js"></script>
<script src="…/coffee-ui.js"></script>
<script src="…/coffee-drive.js"></script>
<script src="…/coffee-wire.js"></script>
<script src="…/coffee-que.js"></script>
<script src="…/coffee-base.js"></script>
```

## API

```js
const b = coffee.base('my-project'); // DB name: coffee-base-my-project
await b.init();

b.collection('users');
b.add({ id: '1', name: 'Ada' });
b.filter('ada');       // substring on JSON.stringify(doc)
b.list();             // filtered
b.listAll();
b.collections();
b.newCollection('orders');
b.applyPreset('saas'); // creates users, subscriptions, teams, api_logs if missing
```

## Presets

`coffee.base.PRESETS` — `saas`, `ecommerce`, `freelance` (collection name arrays).

## Demo

Open **`BASE-DEMO.html`** over HTTP (IndexedDB). See also **`TEST/COFFEE-BASE-POC1.html`** (Tailwind UI shell — not CCE).

## vs real Supabase

Single browser, no HTTP API, no Postgres. A **sidecar** can later expose the same JSON collection shape over the network while storing SQL server-side.
