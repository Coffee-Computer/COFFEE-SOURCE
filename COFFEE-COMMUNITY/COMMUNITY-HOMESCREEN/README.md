# Community Homescreen (Devsumer)

Default **curated** Coffee Community launcher: same shell UI/layout as `../coffee-community-shell.html` (Coffee Control + Coffee UI, grid, full-screen app windows, shade), but apps come from **`devsumer-apps.json`** instead of the full `shell-apps.json` kitchen sink.

| Entry | Purpose |
|--------|---------|
| **`coffee-community-homescreen.html`** | Open this over HTTP from **this folder** (or parent `COFFEE-COMMUNITY`). |
| **`devsumer-apps.json`** | Array of `{ id, name, icon, color, url }`. URLs are relative to **this HTML file**. |

**Layout:** `#app-layer` is inset between the status bar and bottom nav so iframe apps (e.g. Coffee.Terminal) are not drawn under the chrome — full height was clipping the bottom input.

## Run

```bash
cd COFFEE-SOURCE/COFFEE-COMMUNITY/COMMUNITY-HOMESCREEN
python3 -m http.server 8765
```

→ **http://localhost:8765/coffee-community-homescreen.html**

## vs full demo shell

| | Homescreen (here) | `coffee-community-shell.html` |
|--|-------------------|-------------------------------|
| Registry | `devsumer-apps.json` (curated flagship; no Code/Notes/Files/Vault/Keyman/AI/Bee/Synth/Calc/Settings) | `shell-apps.json` (50+) |
| Status hint | “Devsumer” | Generic Community Edition |
| Use | Product-facing default | Internal / try-everything |

Edit **`devsumer-apps.json`** to add or remove apps; keep paths valid from `COMMUNITY-HOMESCREEN/` (`../apps/…`, `../FLAGSHIP/…`, `../../COFFEE-*-DEMO.html`).

## Related

- **Desk Mode** (DOS chrome): `../COMMUNITY-DESKTOP/COMMUNITY-DESKTOP-ALPHA.html` — open directly (not on the devsumer grid).
- **Arc / architecture**: `../COMMUNITY-ARC.md`
