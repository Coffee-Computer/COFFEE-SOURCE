# COFFEE-BRAND

Shared visual / copy tokens for Coffee demos (no build step).

| File | Purpose |
|------|---------|
| `coffee-os-ascii.js` | Sets `window.COFFEE_OS_ASCII_BANNER` — COFFEE VM2 “COFFEE OS” block ASCII. |

## Load order

```html
<script src="path/to/COFFEE-BRAND/coffee-os-ascii.js"></script>
<!-- then coffee-shell.js, CASH POC, etc. -->
```

`coffee-shell.js` uses the same string if this script ran first; otherwise it keeps an inline fallback.
