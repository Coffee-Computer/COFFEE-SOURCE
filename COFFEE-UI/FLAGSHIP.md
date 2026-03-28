# coffee-ui-flagship (optional layer)

Shared **flagship app** styling and small DOM helpers for Coffee CE apps that want the KATI-style shell (dark violet chrome, Space Grotesk, sidebar + neural status bar + prompt cards + composer dock).

## Load order

```html
<script src="coffee-ui.js"></script>
<link rel="stylesheet" href="coffee-ui-flagship.css">
<script src="coffee-ui-flagship.js"></script>
```

Add `class="coffee-flagship-root"` on `<html>` if you want modal/toast typography to match.

## CSS

- Tokens: `--flagship-bg`, `--flagship-accent`, … on `:root`
- Layout/classes: `ff-app-shell`, `ff-sidebar`, `ff-top-bar`, `ff-viewport`, `ff-prompt-grid`, `ff-msg`, `ff-composer-box`, …

Override brand color per app:

```js
coffee.flagship.applyTokens({ accent: '#38bdf8' });
```

## JS (`coffee.flagship`)

| API | Purpose |
|-----|--------|
| `applyTokens(opts)` | Set CSS variables on `:root` |
| `markRoot()` | Add `coffee-flagship-root` on `<html>` |
| `promptCard({ title, blurb, onClick })` | Welcome grid tile |
| `messageRow({ role, avatarChar?, text, html })` | Chat row |
| `loadingRow({ id?, label })` | Pending assistant row |
| `formatChatText(str)` | Escape + light `**bold**` / `` `code` `` |

Compose with core **coffee-ui** (`coffee.modal`, `coffee.button`, …) for dialogs and forms.

**Example apps:** `FLAGSHIP/KATI/KATI-CHAT-ALPHA.html` (violet), `FLAGSHIP/HELIX/HELIX-ALPHA.html` (cyan via `applyTokens`).
