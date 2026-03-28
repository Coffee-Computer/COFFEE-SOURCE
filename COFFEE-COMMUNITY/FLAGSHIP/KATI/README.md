# KATI (flagship)

Runtime + UI for **KATI Chat α** and future builder surfaces. Not a `COFFEE-*` library unless shared across multiple apps.

## Files

| File | Role |
|------|------|
| `kati-instructions.js` | System prompts + suggested starters (`window.KATI`). No Coffee deps. |
| `kati-chat.js` | `coffee.bee` setup (`driveName: kati-chat`), `window.katiChat` helpers. |
| `kati-chat-shell.js` | Shared **UI controller** for chat surfaces: `katiChatShell.boot(opts)`. Wires DOM ids (`#kati-welcome`, `#kati-thread-list`, …), send flow, keys modal. Optional **mobile threads sheet** + `applyTokens`. |
| `KATI-CHAT-ALPHA.html` | Desktop flagship shell; boot: `katiChatShell.boot({ logLabel: 'KATI α' })`. |
| `KATI-CHAT-MOBILE.html` | Phone-first UI; boot with `applyTokens` + `threadsSheet: { rootId, toggleBtnId, … }`. Styles: `kati-chat-mobile.css`. |
| `kati-chat-mobile.css` | Layout + sheet chrome only (load after `coffee-ui-flagship.css`). |

## Script order (ALPHA / MOBILE)

1. `coffee-control.js` — `save` / `load` / `remove` (BYOK)
2. `coffee-ui.js`, `coffee-toast.js`, `coffee-modal.js`
3. `coffee-request.js` → `coffee-drive.js` → `coffee-ai.js` → `coffee-context.js` → `coffee-bee.js`
4. `kati-instructions.js` → `kati-chat.js` → **`kati-chat-shell.js`**

### `katiChatShell.boot(opts)`

- **`applyTokens`** — `object` or `true` (uses `katiChatShell.DEFAULT_TOKENS`). Omit on α if default flagship accent is fine.
- **`threadsSheet`** — omit for desktop. For mobile, pass ids: `rootId`, `toggleBtnId`, `backdropId`, `closeBtnId`, `sheetId`; optional `openClass` (default `kati-threads-panel-open`).
- **`safeInitBee`** — default `true` (`try/catch` around `getBee()`).
- **`logLabel`** — console prefix.

## BYOK

Keys use the same storage names as **BEE-DEMO**: `ai-api-key-github`, `ai-api-key-openai`, `ai-api-key-gemini`.

## Legacy POCs

`TEST/KATI-2-CHAT.html` and `TEST/KATI-WEBSITEBUILDER.html` are Tailwind + direct Gemini demos for design reference; **KATI-CHAT-ALPHA** / **KATI-CHAT-MOBILE** are the Coffee-native surfaces (shared Bee drive).
