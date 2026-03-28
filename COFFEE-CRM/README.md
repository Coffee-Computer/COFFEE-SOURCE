# COFFEE-CRM

**`coffee-crm.js`** — deals, contacts, companies, activities + search on **`coffee.base('crm')`** (IndexedDB via que + wire + drive).

## Run

Serve **`COFFEE-SOURCE`** (or repo root) over HTTP:

- **`COFFEE-CRM/CRM-DEMO.html`** — full UI (local data only).

Stack order matches **`COFFEE-BASE/BASE-DEMO.html`**: control → ui → drive → wire → que → toast → base → **`coffee-crm.js`**.

## Server snapshot API (optional)

Coffee Server still exposes **`GET/PUT /api/crm/vault/snapshot`** under **`COFFEE-PRO/coffee-server`** (writes **`apps/crm/snapshot.json`** in the vault). There is **no** bundled browser client in this repo anymore — use **`fetch`** from your own tooling if you need sync.

See **[`COFFEE-BASE/README.md`](../COFFEE-BASE/README.md)**.
