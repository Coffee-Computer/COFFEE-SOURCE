# Speak (flagship)

Cross-platform **voice memo** app on the Coffee stack: **coffee-control** (mic, `record`, `streamSpectrum`, `save`/`load`) + **coffee-ui** (headings, buttons, inputs, row, msg). Neumorphic chrome lives in **`speak-neumorphic.css`** (extracted from Tailwind POCs).

| File | Role |
|------|------|
| **`SPEAK-ALPHA.html`** | α entry — use HTTP (mic + storage). |
| **`speak-neumorphic.css`** | Soft-UI tokens + layout helpers (no Tailwind). |
| **`TEST/SPEAK-POC1.html`** | Original Tailwind reference. |
| **`TEST/SPEAK-POC2-LAYOUT.html`** | Theme experiments reference. |

## Homescreen

Listed in **`COMMUNITY-HOMESCREEN/devsumer-apps.json`** (and homescreen fallback array) as **Speak** → `SPEAK-ALPHA.html`. Also on **Desk Mode** via **`COMMUNITY-DESKTOP/community-desktop-registry.json`** as **SPEAK.EXE** (lightweight recording vs full Snow Shoes).

## Control API

**`coffee.streamSpectrum(canvas, mediaStream, opts?)`** — live frequency bars; call **`start()`**, then **`audioContext.resume()`** if suspended. **`stop()`** / **`close()`** when the take ends. See **`COFFEE-CONTROL/TEST/ARCH.md`**.
