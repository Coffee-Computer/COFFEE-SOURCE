# Coffee — Community Profile (starter)

Fork or copy this folder, host it statically, edit **`profile.json`**, open `COMMUNITY-PROFILE.html`. No build step, no tokens.

## Files

| File | Role |
|------|------|
| `profile.json` | **All copy & config** — edit this. |
| `COMMUNITY-PROFILE.html` | Shell + icons; content filled by JS. |
| `community-profile.css` | Layout & theme. |
| `community-profile.js` | Fetches JSON, renders the page. |
| `index.html` | Redirects to `COMMUNITY-PROFILE.html`. |

## `profile.json` fields

| Field | Notes |
|--------|--------|
| `ceProfileVersion` | **CE contract version** (number). Bump when you make breaking shape changes; apps can warn or migrate. |
| `ceReserved` | **Road-map placeholders** — `identity`, `presence`, `links`, `wallet`, etc. Ignored by the profile page today; fill in as Anti-Social / other CE apps grow. See `__spec` string in the JSON. |
| `pageTitle` | Browser tab title. |
| `badgeLabel` | Small strip (e.g. `Community Edition`). |
| `status.label` | e.g. `ONLINE`. |
| `status.showDot` | `false` hides the green pulse dot. |
| `avatar` | `imageUrl` if set uses that; else **Dicebear** via `style`, `seed`, `backgroundColor`. |
| `name`, `handle` | Display name and @handle. |
| `meta` | Rows: `{ "label", "value" }` or `{ "label", "type": "bars", "filled", "total" }`. |
| `qrImageUrl` | If set, used as the QR **image** (PNG/SVG you exported). **Overrides** generated QR. |
| `qrUseCurrentPage` | `true` → encodes **this page’s URL** (strip `#…`) in a real QR via the [qrcode](https://www.npmjs.com/package/qrcode) script from jsDelivr. Handy on **GitHub Pages**; on `file://` it encodes a useless `file:` URL. |
| `qrTargetUrl` | String to encode (e.g. `https://you.github.io/repo/COMMUNITY-PROFILE.html`). Used only if `qrImageUrl` is empty and `qrUseCurrentPage` is not `true`. |
| `showAchievements` | `false` hides the whole achievements card; **`achievements[]` can stay in the file** for later. Omit the key or set `true` to show. **Default:** `true`. |
| `achievementsSectionTitle` | Heading above badges. |
| `achievements[]` | `{ "icon", "color", "title" }` — icons: `git-pull`, `flame`, `bug`, `coffee`. Colors: `emerald`, `orange`, `blue`, `gold`. Still stored when `showAchievements` is `false`. |
| `about` | `{ "title", "body" }`. |
| `goals` | `{ "title", "items": [ { "text", "dim" } ] }`. |
| `snippet` | `{ "title", "filename", "code" }` — `code` is plain text (syntax colors are a future option). |
| `pings` | `{ "title", "items": [ { "handle", "time", "text", "avatarSeed" } ], "moreButtonLabel" }` — omit or empty `moreButtonLabel` to hide the button. |

## Alternate JSON

Same origin only (or CORS-enabled URL):

`COMMUNITY-PROFILE.html?profile=other.json`

## External deps

- **Google Fonts** in CSS (optional; remove `@import` for system fonts).
- **Dicebear** for generated avatars (unless `avatar.imageUrl` is set).
- **QR** image URL is yours.

## Beam / fork

Others can point at your hosted **`profile.json`** URL once you allow CORS or they proxy it; same-folder default needs no CORS.
