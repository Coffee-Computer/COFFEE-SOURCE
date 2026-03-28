# coffee.nebula

Lightweight multi-source search. Wikipedia + DuckDuckGo. No API keys. No AI.

## Usage

```html
<script src="coffee-request.js"></script>
<script src="coffee-nebula.js"></script>
```

```javascript
// Return data
const { results } = await coffee.nebula('coffee');
// results: [{ title, content, source, image, tags, gallery }]

// Render into element
await coffee.nebula('coffee', { target: '#results' });
```

## API

| Method | Description |
|--------|-------------|
| `coffee.nebula(query, opts)` | Search. Returns `{ results }`. If `opts.target` set, renders into element. `opts.gallery` defaults **true** (Wikipedia page image strip); set `gallery: false` to skip that fetch. |
| `coffee.nebula.render(results, el)` | Render summary-style results into DOM element. |
| `coffee.nebula.wikiSearch(query, opts?)` | **Wikipedia full-text search** (`list=search`). Returns `{ results: [{ title, snippet, url, thumbnail? }] }`. Plain-text snippets (HTML stripped). Opts: `limit` (default 15, max 50), `wiki` (language code, default `en`), `images` (default **true** — batch `prop=pageimages` thumbnails), `thumbSize` (default 220), `target` (optional element or selector → auto-render). |
| `coffee.nebula.renderWikiSearch(results, el)` | Render wiki hit list (links + snippets). |

## Sources

- **Wikipedia** — Page summary + images (REST API) for `coffee.nebula()`
- **DuckDuckGo** — Instant answers (fallback) for `coffee.nebula()`
- **Wikipedia** — Open search API (`action=query&list=search`) for `coffee.nebula.wikiSearch()` (Frugal-style many results)

## Demo

`NEBULA-DEMO.html` — Search UI with Coffee UI, request, toast.
