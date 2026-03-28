# COFFEE-CASH

- **`cash-core.js`** — loads **`cash-domains.json`**, dynamic-imports each **`module`**, merges handlers, dispatches `{ action, params }`.
- **`cash-context.js`** — browser/host: **`attachCashIoContext({ registerHandlers, initCash, baseCashUrl, ctx, … })`** registers **`CASH.SET_IO_CONTEXT`** (manifest swap). Helpers: **`ioParamToMode`**, **`DEFAULT_MANIFEST_BY_MODE`**.
- **`cash-cli.js`** — **human → step** only: `parseCashCliLine(line)`, `isCashCliLine(line)`, `CASH_CLI_HELP`. Lines prefixed with **`cash`**, **`flow`**, or **`io`**.
- **`domains/*.js`** — register **handlers** (execution). No aliases inside domains.
- **`TEST/CASH1-POC.html`** — Coffeefied POC: **`cash-cli`** + raw JSON + `help` / `clear` / `exit`.

**IO backends (CE):** **drive** (IndexedDB), **control** (localStorage), **memory** (RAM). No Coffee Server vault client in this tree — vault HTTP stays **Pro** (`coffee-server`).

## Run the POC

ES modules + `fetch` need **HTTP** (not `file://`):

```bash
# from repo root
npx serve . -p 8765
```

Open `http://localhost:8765/COFFEE-SOURCE/COFFEE-CASH/TEST/CASH1-POC.html` (or serve `COFFEE-SOURCE` only and use `/COFFEE-CASH/TEST/CASH1-POC.html`).

IO manifest swap: **`?io=control`**, **`?io=memory`**. Default = **drive** (IndexedDB).

## IO backends (pick one in manifest)

Only **one** `./domains/cash-io*.js` row per manifest.

| Manifest file | IO module | Storage |
|---------------|-----------|---------|
| **`cash-domains.json`** (default) | `cash-io-drive.js` | **`coffee.drive('coffee-cash-io')`**, doc id **`cash_io_vfs`** |
| **`cash-domains.control.json`** | `cash-io-control.js` | **`coffee.save('cash_io_vfs')`** / **`coffee.load`** |
| **`cash-domains.memory.json`** | `cash-io.js` | RAM only (reload clears) |

Runtime: **`io drive` / `io control` / `io memory`** → **`CASH.SET_IO_CONTEXT`**.

**Other `ctx`:** `cashIoDriveId`, `cashIoVfsRecordId`, `cashIoControlKey`.

See **`cash-arch.md`** for catalog, naming rules, and IO backend notes.

## Example steps

```json
{"action":"CASH.LIST","params":{}}
```

```json
{"action":"IO.WRITE_FILE","params":{"path":"note.txt","content":"hello"}}
```

## Coffeefying CASH

1. **`coffee.cash`** — `{ execute, listActions, ctx, init(baseUrl?) }` (+ legacy `__cashExecute` / `__cashCtx`).
2. **Brand** — **`COFFEE-BRAND/coffee-os-ascii.js`** + shell-aligned header.
3. **Drive** — load **`coffee-drive.js`** for **`coffee.drive`** when using the default manifest.

Script order: `coffee-control.js` → `coffee-drive.js` → … → module: `cash-core.js` + `cash-cli.js` + **`cash-context.js`**.
