# Scribe (flagship)

Markdown editor + live preview. Preview pipeline lives in **`COFFEE-MARKDOWN`** (`coffee.markdown`).

| File | Role |
|------|------|
| `SCRIBE-ALPHA.html` | Full stack: **coffee.code** (Monaco + **coffee.frame**), **coffee.slash**, **coffee.markdown** preview, **coffee-ui**, **coffee.control**. |
| `TEST/SCRIBE-POC1.html` | POC; Tailwind + Lucide + `coffee.markdown` |

**Scribe α load order:** `marked` → `coffee-control` → `coffee-ui` → `coffee-frame` → `coffee-monaco` → `coffee-code` → `coffee-markdown` → `coffee-slash`.

Use **`coffee.frame`** only for RPC guests (e.g. Monaco host), not for markdown preview.
