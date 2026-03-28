# Coffee Distro — Verification Page Template

Every legitimate Coffee distro must serve this page at `/distro` or `/about-coffee`.

**The rule:** If a visitor doesn't see this page, the site is **not** built on the core.

## Usage

1. Copy `distro.html` to your fork's root (or a `/distro` subfolder).
2. Configure your server to serve it at `/distro` or `/about-coffee`.
3. Update script paths if your folder structure differs.

## `distro-config.json`

Edit **`distro-config.json`** next to `distro.html`. The page fetches it at load and renders:

| Field | Type | Notes |
|--------|------|--------|
| `distro` | string | Shown as the main heading; also used in `<title>`. |
| `version` | string | Shown under the title (e.g. `v0.1.0`). |
| `maintainerGithub` | string | GitHub username, `@user`, or full `https://github.com/...` URL. |
| `purpose` | string | Paragraph under **Purpose**. |
| `whoItsFor` | string or string[] | Bullet list **Who it’s for**. |
| `whoItsNotFor` | string or string[] | Bullet list **Who it’s not for**. |
| `requirements` | string or string[] | Bullet list **Requirements**. |

Requires a normal HTTP(S) server so `fetch('distro-config.json')` works (not `file://` in most browsers).

## Content

- Loads manifest from `distro-config.json` when available.
- States: "This is the Coffee Distro page." (fallback heading if config missing)
- States: "This distro is built on the original Coffee Community base + wiring."
- Verifies use of core bricks: que, wire, Control, Drive.
- Explains the rule: no page = not built on the core.

## Community Edition variant

The **Community Edition** uses the same page pattern with its own copy and config:

- `COFFEE-COMMUNITY/COMMUNITY-DISTRO.html` + `community-distro-config.json`
- Optional JSON field **`maintainerDisplayName`** (e.g. `"Kyle"`) for the maintainer link label; **`maintainerGithub`** still sets the URL.

## See Also

`cc-keypassideation.md` — Full key/distro/git protocol spec.
