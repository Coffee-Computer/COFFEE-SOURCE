# Friendz α

**CE worlds directory** — bookmark other people’s `profile.json` + a **viewer URL** (e.g. Community Profile). Cards hydrate from JSON when **same-origin** or **CORS** allows. Roster persists in **`coffee.drive('friendz')`** under id `friendz-roster`.

## Run

Serve **`COFFEE-SOURCE`** over HTTP. Open:

`COFFEE-COMMUNITY/FLAGSHIP/FRIENDZ/FRIENDZ-ALPHA.html`

## Files

| File | Role |
|------|------|
| `FRIENDZ-ALPHA.html` | App shell + Drive + fetch + overlay iframe |
| `FRIENDZ-ALPHA.css` | Layout (no Tailwind) |
| `TEST/FRIEDZ1-POC.html` | Earlier Tailwind/Lucide POC (unchanged) |

## Roster shape (`friendz-roster` in drive)

```json
{
  "id": "friendz-roster",
  "worlds": [
    {
      "id": "world-…",
      "profileJsonUrl": "https://…/profile.json",
      "viewerUrl": "https://…/COMMUNITY-PROFILE.html?profile=profile.json"
    }
  ]
}
```

First launch seeds **monorepo** `COMMUNITY-PROFILE/profile.json` + viewer if the roster is empty.

## Stack

`coffee-control` · `coffee-ui` · `coffee-toast` · `coffee.drive`
