# Frugal (flagship)

Privacy-flavored **Wikipedia discovery** on the Coffee stack: **`coffee.nebula.wikiSearch`** (many hits) + **`coffee.nebula`** (summary / DDG quick answer). **`coffee-request`** loads before Nebula (Nebula uses it internally).

| File | Role |
|------|------|
| **`FRUGAL-ALPHA.html`** | α entry — control → request → nebula → UI. |
| **`frugal-brand.css`** | Warm café wordmark gradient, search shell, skeletons (no Tailwind). |
| **`TEST/FRUGAL-POC1.html`** | Original Tailwind POC reference. |

## Modes

- **Encyclopedia search** — MediaWiki `list=search` via `coffee.nebula.wikiSearch`, with **lead thumbnails** (`prop=pageimages`) when **Images** is on (default).
- **Quick answer** — REST summary + DuckDuckGo fallback via `coffee.nebula`, including the **Nebula image gallery** when **Images** is on (default).
- **Images** — Toggle (landing + results chrome). **On by default**; turning it off skips thumbnail/gallery fetches and hides any lead image in the answer card.

## Run

Serve over **HTTP(S)** (Wikipedia CORS + `origin=*`). From repo root or Community folder:

```bash
cd COFFEE-SOURCE/COFFEE-COMMUNITY/COMMUNITY-HOMESCREEN && python3 -m http.server 8765
```

Open `../FLAGSHIP/FRUGAL/FRUGAL-ALPHA.html` relative to that server (or serve `COFFEE-SOURCE` and use full path).

## Homescreen

Registered in **`COMMUNITY-HOMESCREEN/devsumer-apps.json`** as **Frugal**.
