# COFFEE-SCREEN

Headless viewport / PWA helpers aligned with **`COFFEE_HUB/COFFEE_HUB_SPLASH.html`**:

- **Breakpoint `1024`**: `innerWidth < 1024` → “small” / **Twin**; else “large” / **workstation**.
- **Standalone**: `matchMedia('(display-mode: standalone)')` or `navigator.standalone` (iOS).

## Script tag

```html
<script src="../COFFEE-SOURCE/COFFEE-SCREEN/coffee-screen.js"></script>
```

(Adjust path from your page.)

## API (`coffee.screen`)

| Method / property | Description |
|-------------------|-------------|
| `DEFAULT_BREAKPOINT` | `1024` |
| `snapshot()` | Object: `innerWidth/Height`, `devicePixelRatio`, `standalone`, `visualViewport`, `isSmall`, `profile`, `hubProfile`, `splashMessage`, etc. |
| `isStandalone()` | Installed PWA? |
| `isSmall(breakpoint?, width?)` | Below breakpoint (default 1024), optional explicit width. |
| `profile(breakpoint?)` | `'small'` \| `'large'` |
| `hubProfile(breakpoint?)` | `'twin'` \| `'workstation'` |
| `splashMessage(breakpoint?)` | Same strings as Hub splash card. |
| `hubIframeSrc({ twinSrc, workstationSrc, breakpoint? })` | Returns which full-hub iframe URL to load. |
| `onChange(cb, { immediate?, debounceMs? })` | `cb(nextSnapshot, prevSnapshot)` on resize / orientation / visualViewport; returns `unsubscribe`. |

## Load order with coffee-control

`coffee-control.js` ends with `window.coffee = coffee` and **replaces** the whole object. Load **`coffee-screen.js` after `coffee-control.js`** so `coffee.screen` is preserved, or re-attach in your boot file.

## Note

**`COFFEE_HUB/COFFEE_HUB_SPLASH.html`** keeps its own inline checks; this module mirrors that behavior for other pages. Opt in by adding the script and calling `coffee.screen` yourself.

**Community homescreen** (`COMMUNITY-HOMESCREEN/coffee-community-homescreen.html`) loads this script and writes **`localStorage['coffee_community_screen_profile']`** (JSON: `hubProfile`, `profile`, `isSmall`, `innerWidth`/`Height`, `breakpoint`, `standalone`, `updatedAt`) on load and when the screen changes. Apps in **`devsumer-apps.json`** may set **`"desktop": true`**; those open only when `!coffee.screen.isSmall()` (same **1024** breakpoint as Hub splash).
