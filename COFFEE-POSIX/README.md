# COFFEE-POSIX

Small **path + shell-line** helpers for Coffee modules (CASH, Shell, future hosts).

## What it is

- **Vault-relative paths** — stored `cwd` has **no** leading slash; empty string = tree root.
- **`resolvePath(cwd, rel)`** — `.`, `..`, optional leading `/` (absolute within vault).
- **`parsePosixLine(line)`** — `pwd`, `cd`, `ls`/`dir`, `cat`/`read` → structured `{ verb, args }` (no execution).
- **`posixIntentFromParse(cwd, parsed)`** — neutral **`{ op: 'list'|'read'|'cd'|'pwd', path?, display? }`** (still no I/O).
- **`createPathSession()`** — mutable `cwd` + **`applyLine(raw)`** (updates cwd on successful `cd`).

## What it is not

- Not a full POSIX shell, globbing, pipes, redirects, or scripting.
- No `fetch`, IndexedDB, or **`IO.*`** handlers — hosts map **`op`** → their backend.

## Usage (CASH)

```js
import {
  createPathSession,
  parsePosixLine,
  posixIntentFromParse,
  intentToCashStep
} from '../COFFEE-POSIX/coffee-posix.js';

const session = createPathSession({ initialCwd: '' });
const intent = session.applyLine('ls media');
// intent.op === 'list', intent.path === 'media'

const step = intentToCashStep(intent);
// { action: 'IO.LIST_DIR', params: { path: 'media' } } or null for pwd/cd-only
```

**Shell / `coffee.drive('coffee-shell')`:** same `parsePosixLine` + `posixIntentFromParse`; map `list`/`read` to the shell VFS API instead of `IO.*`.

## Files

| File | Role |
|------|------|
| `coffee-posix.js` | All exports (ES module, browser + Node with `import`). |

Optional **`intentToCashStep`** is a convenience adapter for CASH; you can delete usage and map **`op`** yourself for stricter layering.

## Test

From repo root, open `COFFEE-SOURCE/COFFEE-POSIX/TEST/POSIX1-POC.html` via a static server (or Coffee Server) and check the log panel.
