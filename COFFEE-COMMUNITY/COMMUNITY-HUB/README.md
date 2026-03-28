# Community Hub

- **`COMMUNITY-HUB.html`** + **`COMMUNITY-HUB.css`** — Coffee-themed hub (no Tailwind): Community / Maintainers / Docs. CCE meta on the page.
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
