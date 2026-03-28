# Community Desktop α

Registry-driven **Desk Mode** — MS-DOS–style chrome on purpose, but **Coffee-branded** (warm accents, silly status copy). The **desktop workspace** uses the same **`--shell-bg` rainbow** as `coffee-community-homescreen.html`, with a **light** scrim + dot texture (bright, close to homescreen). This is *not* the default Community homescreen. **Curated default:** **`../COMMUNITY-HOMESCREEN/coffee-community-homescreen.html`** + `devsumer-apps.json`. **Full demo grid:** `../coffee-community-shell.html` + `shell-apps.json`. **Desk Mode** = goofy DOS launcher: **`STORE.EXE`** opens **`../apps/store.html`** (install/remove via **`coffee.install`**), curated flagships (Scribe, Snow Shoes, …), **plus** any apps you installed from the Store — merged from IndexedDB at runtime (same manifest as Community shell). Icons with a **warm outline** are user-installed.

See **`../COMMUNITY-ARC.md` → “Community Shell vs Community Desktop”** for registry strategy (two JSON files vs one canonical `community-app-registry.json` with `surfaces`).

## Files (this folder)

| File | Role |
|------|------|
| **`COMMUNITY-DESKTOP-ALPHA.html`** | Entry page: Control + UI + **Drive + Install**, `coffee-desktop`, fetches registry, **merges `coffee.install` list**, listens for **`communityInstallChanged`** to refresh. |
| **`community-desktop-registry.json`** | App list (`id`, `label`, `icon`, `title`, `src`). Paths in `src` are relative to **this HTML page** (same folder as the alpha). Includes **`store`** → `../apps/store.html`. |
| **`coffee-desktop.js`** | `coffee.desktop` API: window chrome, drag/resize, z-order, iframe mount. |

Legacy Tailwind POC (optional): `TEST/COMMUNITY-DESKTOP-POC1.html`.

## Run locally

Use HTTP (not `file://`): `fetch()` needs a origin, and embedded apps like **Scribe α** need HTTP for Monaco / modules.

```bash
cd COFFEE-SOURCE/COFFEE-COMMUNITY/COMMUNITY-DESKTOP
python3 -m http.server 8765
```

Open **http://localhost:8765/COMMUNITY-DESKTOP-ALPHA.html**.

## Registry shape

```json
{
  "version": 1,
  "apps": [
    {
      "id": "scribe",
      "label": "SCRIBE.EXE",
      "icon": "📝",
      "title": "Scribe",
      "src": "../FLAGSHIP/SCRIBE/SCRIBE-ALPHA.html"
    },
    {
      "id": "snow-shoes",
      "label": "SHOES.EXE",
      "icon": "🎛️",
      "title": "Snow Shoes",
      "src": "../FLAGSHIP/SNOW-SHOES/SNOW-SHOES-ALPHA.html"
    },
    {
      "id": "frugal",
      "label": "FRUGAL.EXE",
      "icon": "🧡",
      "title": "Frugal",
      "src": "../FLAGSHIP/FRUGAL/FRUGAL-ALPHA.html"
    },
    {
      "id": "speak",
      "label": "SPEAK.EXE",
      "icon": "🎙️",
      "title": "Speak",
      "src": "../FLAGSHIP/SPEAK/SPEAK-ALPHA.html"
    },
    {
      "id": "bright-house",
      "label": "BRIGHT.EXE",
      "icon": "🖼️",
      "title": "Bright House",
      "src": "../FLAGSHIP/BRIGHT-HOUSE/BRIGHT-HOUSE-ALPHA.html"
    },
    {
      "id": "snap-shot",
      "label": "SNAP.EXE",
      "icon": "📸",
      "title": "Snap Shot",
      "src": "../FLAGSHIP/SNAP-SHOT/SNAP-SHOT-ALPHA.html"
    },
    {
      "id": "vector",
      "label": "VECTOR.EXE",
      "icon": "◈",
      "title": "Vector",
      "src": "../FLAGSHIP/VECTOR/VECTOR-ALPHA.html"
    },
    {
      "id": "kite",
      "label": "KITE.EXE",
      "icon": "🪁",
      "title": "Kite",
      "src": "../FLAGSHIP/KITE/KITE-ALPHA.html"
    },
    {
      "id": "hyper-web",
      "label": "HYPER.EXE",
      "icon": "◇",
      "title": "Hyper-Web",
      "src": "../FLAGSHIP/HYPER-WEB/HYPER-WEB-ALPHA.html"
    }
  ]
}
```

Add entries by duplicating an app object and fixing `src` relative to `COMMUNITY-DESKTOP-ALPHA.html`. Flagship notes: Snow Shoes **`../FLAGSHIP/SNOW-SHOES/SNOW-SHOES-COFFEE-STATE.md`**, Frugal **`../FLAGSHIP/FRUGAL/README.md`**, Speak **`../FLAGSHIP/SPEAK/README.md`**, Bright House **`../FLAGSHIP/BRIGHT-HOUSE/README.md`**, Snap Shot **`../FLAGSHIP/SNAP-SHOT/README.md`** (`coffee.camera`, **`coffee.shot`**, **`coffee.filterCss`**).

---

## Is this the “full” Coffee stack?

**On the desktop shell page — partially.** By design it loads only what the host needs:

1. **`coffee-control`** — APIs + `coffee.save` / `coffee.load` (CRT preference).
2. **`coffee-ui`** — `coffee.injectTheme()` so CSS variables/tokens exist for anything that uses Coffee UI conventions.
3. **`coffee-drive`** + **`coffee-install`** — same **`community-install`** IndexedDB as the Store / shell; desktop grid merges installed apps after fetch.
4. **`coffee-desktop.js`** — Community-specific window manager on `coffee.desktop`.

It does **not** load **marked, coffee-frame, coffee-monaco, coffee-code, coffee-markdown, coffee-slash** on the parent page; those belong to **each app** inside the iframe.

**Inside an app (e.g. Scribe)** — **yes, full flagship stack** when that app’s HTML follows its own README (e.g. Scribe α: marked → control → ui → frame → monaco → code → markdown → slash).

So: **Community Desktop α = full Coffee integration for the shell (control + UI + desktop module); “full stack” for editors lives in the embedded app documents, not duplicated on the host.**
