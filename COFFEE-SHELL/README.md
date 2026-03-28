# Coffee Shell (`coffee-shell.js`)

Reusable **virtual terminal + VFS** for demos (`TEST/SHELL1-POC.html`) and CE apps.

## Control vs Drive — which to use?

| Backend | API | Best for |
|--------|-----|----------|
| **`drive`** (default in SHELL1-POC) | `coffee.drive('coffee-shell')` | **Recommended.** Same IndexedDB pattern as Anti-Social, Friendz, etc. Better quota than raw `localStorage` for a growing tree. |
| **`control`** | `coffee.save` / `coffee.load` | Optional. Still **localStorage** under the `coffee_*` prefix — nice if you want one namespace with other `coffee.save` data, but **~5MB limit** like raw storage. |
| **`localStorage`** | Raw `storageKey` | Legacy / zero-deps (no Drive script). Same size limits as control. |

**`coffee-control` alone** is not the main fit for the **whole VFS** — its `save`/`load` helpers are generic key/value (localStorage). Use them via **`persistence: 'control'`** only if you want that naming scheme.

**Use `createSessionAsync` + Drive** for production CE demos so the shell lines up with the rest of the stack.

## Load

```html
<script src="../COFFEE-CONTROL/TEST/coffee-control.js"></script>
<script src="../COFFEE-DRIVE/coffee-drive.js"></script>
<script src="../COFFEE-SHELL/coffee-shell.js"></script>
```

## API

| Export | Purpose |
|--------|---------|
| `coffee.shell.BANNER_COFFEE_OS` | COFFEE_VM2 ASCII |
| `coffee.shell.DEFAULT_INITIAL_FS` | Starter tree |
| `coffee.shell.createSession(opts)` | Sync — `persistence: 'localStorage'` \| `'control'` |
| `coffee.shell.createSessionAsync(opts)` | **Drive** — `persistence: 'drive'` (default fields: `driveId`, `vfsRecordId`) |
| `coffee.shell.getDir(fs, pathSegments)` | Navigate tree |
| `coffee.shell.getPathString(['root','a'])` | → `~/a` |

### `createSession` / `createSessionAsync` options

- **`outputEl`**, **`inputEl`**, **`pathDisplayEl`**, **`scrollEl`**
- **`persist`** — `false` = RAM only
- **`persistence`** — `'localStorage'` | `'control'` | `'drive'` (drive → use async only)
- **`storageKey`** — raw localStorage key (default `coffee_vfs`)
- **`controlKey`** — `coffee.save` key without `coffee_` prefix (default `shell_vfs`)
- **`driveId`** — default `coffee-shell`
- **`vfsRecordId`** — drive document id, default `vfs`
- **`initialFS`**, **`userHost`**, **`customCommands`**

Built-ins: `help`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`, `echo`, `clear`, `whoami`, `banner`, **`js`** (see below), `reset`.

### `js` — JavaScript in page context

Same behavior as **`TERMINAL/COFFEE_TERMINAL/coffee-terminal.js`**: shows

> About to execute JavaScript in page context. Reply with **y** to run, **y!** to run and don't show again, or **n** to cancel.

Uses localStorage key **`terminal_js_confirm`** (`dismissed` = skip prompt). Then runs code like `js 3+3` via async `Function` (expression first, then statement block), proxies **`console`**, and prints `=>` plus return value.

**Styling:** if you embed the shell outside SHELL1-POC, define `.warn-text`, `.info-text`, `.muted-text` on `.output-line` (see `TEST/SHELL1-POC.html`).

## SHELL1-POC

- Default: **`createSessionAsync`** + **Drive**.
- Query: **`?persist=localStorage`** or **`?persist=control`** to compare backends.

## Files

| Path | Role |
|------|------|
| `coffee-shell.js` | Module |
| `TEST/SHELL1-POC.html` | Demo |
