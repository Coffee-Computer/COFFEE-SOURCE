# Anti-Social α

Mastodon-compatible **fediverse client** built on **`coffee.masto`** + **Coffee UI**, **List**, **Drive**, **Toast**.

## Run

Serve **`COFFEE-SOURCE`** over HTTP (not `file://`). Open:

**Default (hub / homescreen / devsumer / desktop):** `ANTI-SOCIAL-SWITCHER.html` — Anti-Social + DnD + Ghost + Friendz dock (horizontally scrollable tabs).

**Feed only:** `ANTI-SOCIAL-ALPHA.html`

Or launch from **Community splash**, **homescreen**, **devsumer** (`devsumer-apps.json`), or **desktop registry**.

**Switcher** — bottom dock, four iframes (😈 · 👹 · 👻 · 🤝). Swipe/drag the tab row horizontally on small screens (same pattern as `COFFEE-SOCIAL-SWITCHER`). Optional query: `?tab=anti-social` | `?tab=dnd` | `?tab=ghost` | `?tab=friendz`. Ghost uses `?compact=1&embed=1` inside its iframe.

## Behavior (matches `TEST/ANTI-SOCIAL4-POST.html`)

- **Instance** defaults to **`https://mastodon.social`** (same as POC `const instance = 'mastodon.social'`).
- **Hashtag row** — `#pixelart` (default), `#webdev`, `#lofi`, `#coding`, `#linux`, `#gamedev`. Feed = **public tag timeline** — **no token required** to read.
- **On load** — fetches `#pixelart` automatically (`window.onload = fetchPosts` in POC).
- **Local signals** — posts without a token are saved to **`localStorage['anti-social-created']`** and merged on top of the tag feed (POC behavior).
- **Token optional** — add in SYSTEM for **Verify**, **fav/boost**, and **posting** to your account; append **current tag** when posting with token.

## Setup

1. **Open the app** — feed loads immediately from the default tag.
2. **SYSTEM (avatar)** — override instance URL or add token if you want a different server or interactions.
3. **Save locally** — persists instance + token in **`coffee.drive('anti-social')`**.
4. **Verify** — `GET /api/v1/accounts/verify_credentials` (needs token)
5. **Refresh** — same tag + instance again
6. **Post** — with token: Mastodon status + `#tag`; without: local-only signal

## Community Profile (`profile.json`)

When **`COMMUNITY-PROFILE/profile.json`** loads successfully (same-origin), Anti-Social uses it **until you Verify** with Mastodon:

- **Profile panel** — `name`, `handle`, `avatar` (Dicebear / `imageUrl`), **SYSTEM_BIOS** from `about.body`.
- **Nav avatar** — same avatar.
- **Local signals** — author row matches that profile.

**Resolution order**

1. Query **`?ceProfile=relative-or-path.json`** (resolved against this page).
2. Else **`as-ce-profile.json`** in this folder — field **`profileJsonUrl`** (path to your `profile.json`).
3. Else default **`../../COMMUNITY-PROFILE/profile.json`**.

If the file is missing or invalid, the app falls back to **NERD_NULL**. After **Verify**, the Mastodon account drives the panel again (default bios copy).

### GitHub search (SYSTEM → CE_PROFILE)

- **`Find profile.json`** uses **`coffee.git.fetchFromInput`** on public GitHub raw (`main` / `master`).
- Enter **`owner/repo`** — tries, in order:  
  `COMMUNITY-PROFILE/profile.json`, `profile.json`,  
  `COFFEE-SOURCE/COFFEE-COMMUNITY/COMMUNITY-PROFILE/profile.json`.
- Or paste a full **`owner/repo/path/profile.json`**, raw URL, or `github.com/.../blob/...` link (same rules as Store POC).
- JSON must include a **`name`** field (same as Community Profile page).
- **`Save locally`** writes **`ceProfileJsonUrl`** (resolved raw URL) into **`coffee.drive('anti-social')`** with instance + token. Load order: **`?ceProfile=`** → **Drive URL** → **`as-ce-profile.json`** → monorepo fallback.
- **`Unlink CE profile`** clears the in-memory link and reloads from the chain above; **Save** again to clear Drive.

## Stack

| Module | Role |
|--------|------|
| `coffee.masto` | Mastodon REST |
| `coffee.request` | HTTP |
| `coffee.git` | Public GitHub raw fetch for CE `profile.json` search |
| `coffee.drive` | Persist `{ id: 'settings', instanceUrl, token, ceProfileJsonUrl? }` |
| `coffee.list` | Feed rows |
| `coffee.ui` | Shell, inputs, buttons |
| `coffee.toast` | Feedback |

## POCs

Older Tailwind experiments live in **`TEST/`** — not loaded by the alpha.

## Notes

- **Not** affiliated with Mastodon gGmbH. Uses the **published Mastodon API**.
- **OAuth redirect** is not implemented in α; paste a token or add OAuth later.
- **Media posts** — use API from devtools or extend α with `uploadMedia` + `media_ids` (already on `coffee.masto`).
