# Community Hub

- **`COMMUNITY-HUB.html`** + **`COMMUNITY-HUB.css`** — Coffee-themed hub (no Tailwind): Community / Maintainers / Docs; CCE meta on the page. The **full** `.ch-*` stylesheet is **inlined** in `COMMUNITY-HUB.html` as `#ch-hub-inlined-css` so the shell renders if the external `.css` URL breaks. **`MAINTAINER-FORM.html`** links `COMMUNITY-HUB.css` and adds **`#ch-maint-form-skin`** for iframe-safe form layout. Edit **`COMMUNITY-HUB.css`**, then run **`python3 sync-hub-css.py`** to refresh the hub’s inlined block (and the form’s, if that file contains `#ch-hub-inlined-css`).
- **`community-hub-apps.json`** — cards on the **Community** tab; **whole card** is clickable (opens `url` in a new tab). Paths are relative to **this folder**.

### JSON shape (each item)

| Field | Required | Notes |
|-------|----------|--------|
| `id` | ✓ | Stable id |
| `title` | ✓ | Card heading |
| `description` | ✓ | Body text |
| `url` | ✓ | Opens in new tab (resolved vs current page) |
| `tag` | | Pill label (default `App`) |
| `tagTone` | | `yellow` \| `blue` \| `green` (default `yellow`) |
| `footer` | | Small mono line under the rule |
| `buttonLabel` | | CTA label shown on card (default `OPEN`); entire card opens `url` |

Serve **`COMMUNITY-HUB/`** over HTTP so `fetch('./community-hub-apps.json')` works.

### Layout / CSS / iframe issues

See **[CSS-AND-EMBED-TROUBLESHOOTING.md](./CSS-AND-EMBED-TROUBLESHOOTING.md)** for half-styled pages, modal overlay bugs, overlapping form fields, iframe + stylesheet failures, and related fixes.
