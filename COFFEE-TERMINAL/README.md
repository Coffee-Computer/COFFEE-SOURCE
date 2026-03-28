# COFFEE-TERMINAL (Coffee.Terminal α, CE)

**Location:** `COFFEE-SOURCE/COFFEE-TERMINAL/` — **POSIX + CASH** only; no Coffee Server / vault reachability UI.

| File | Role |
| :--- | :--- |
| `COFFEE-TERMINAL-ALPHA.html` | CE α shell: clock + uptime, POSIX/CASH runtime + deferred UI. |
| `COFFEE-TERMINAL-ALPHA.css` | α chrome (no Tailwind). |
| `coffee-terminal-runtime.mjs` | Imports **`../COFFEE-POSIX/`**, **`../COFFEE-CASH/`**; `?io=` CASH mode. |
| `coffee-terminal-alpha.js` | Line dispatch, builtins, slash palette, extensions. |
| `terminal-slash.js` | Slash command registry. |
| `terminal-extensions.js` + `terminal-extensions.json` | Merge extra commands from JSON. |
| `PLUGINS/` | Optional plugin handlers. |
| `TEST/` | POC pages. |

**Launchers:** `COFFEE-COMMUNITY/` homescreen, desktop registry, shell-apps, PWA shortcut → `COFFEE-TERMINAL/COFFEE-TERMINAL-ALPHA.html` (paths relative to each launcher).

**Serve** `COFFEE-SOURCE` (or repo root) over HTTP so module imports resolve.
