# COFFEE-MARKDOWN

Markdown pipeline for Coffee apps. Wraps **[marked](https://marked.js.org/)** (load from CDN) and builds styled preview documents for iframes.

## Load order

1. `marked` (e.g. 4.x from cdnjs)
2. `coffee-control.js` (optional; only if you use other `coffee.*` APIs)
3. `coffee-markdown.js`

## API (`coffee.markdown`)

| Method | Description |
|--------|-------------|
| `toHtml(md)` / `parse(md)` | Markdown → HTML fragment |
| `buildPreviewDocument(md, opts?)` | Full HTML document string (github-markdown-css by default) |
| `assignIframePreview(iframe, md, opts?)` | Set iframe `src` via blob; revokes previous URL from this helper |
| `createPreviewSession()` | `{ update(iframe, md, opts?), revoke() }` for multiple previews / cleanup |
| `supported()` | `true` if `marked` is present |

## Used by

- **Scribe** (`COFFEE-COMMUNITY/FLAGSHIP/SCRIBE/`) — editor + preview; slash UI stays in Scribe.

## Security

Output is HTML from user markdown. For untrusted input, add sanitization (e.g. DOMPurify) before or inside a fork of `toHtml`.
