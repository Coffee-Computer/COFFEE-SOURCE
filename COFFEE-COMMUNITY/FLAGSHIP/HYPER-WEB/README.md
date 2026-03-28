# Hyper-Web α

**Hyper-Web does not load COFFEE-VIZ-BETA or `viz-engine.js`.** It uses its own **hyper-tick** timeline messages (see below). Coffee Viz β still uses the older **`coffee-viz`** string — same *idea* (parent drives time), different *type* name for Hyper-Web clarity.

**Layout / iframe sizing:** The approach that **works** is documented in **`HYPER-WEB-LAYOUT-HISTORY.md`** — especially **`sizeGuestLayersToComposition()`** (px-sized frame → xform → iframe). That doc also lists **failed attempts** so we don’t repeat them. *Chrome layout:* desktop **`.hyper-body`** is **flex row** (not **`grid` + `1fr`**) to avoid sub-pixel seams between stage and inspector; stage column **`flex: 1 1 0`**. Still **`background: var(--hyper-stage-bg)`** on that row as a fallback. Layer **Scale** in the inspector is unrelated (guest transform).

## Built-in guests (layout / protocol tests)

| File | Stack |
|------|--------|
| **`HYPER-GUEST-DEMO.html`** | `coffee.scene2d` + `coffee.animate` + hyper-tick |
| **`HYPER-GUEST-ART-DEMO.html`** | **`coffee.forge`** + **`coffee.art`** (flow field) — preset **inlined** (same as `COIL/presets/flow/default.json`) so **no `fetch`** / no black screen when paths or blob URLs break |

Host: **Add guest** / **Add art guest** (or **Upload HTML** either file). Export stores `preset: "guest"` / `"art"` for re-import.

## Guest script: `hyper-web-guest.js`

Include **`./hyper-web-guest.js`** (same folder as this README in the repo) and call once:

```javascript
hyperWebGuest.start({
  onTick: function (timeSeconds, playing) { /* redraw at timeSeconds */ },
  onProp: function (key, value) { /* inspector → hyper-prop */ }  // optional
});
```

When embedded (`window !== window.parent`), the bridge posts **`{ type: 'hyper-ready' }`** to the parent.

## Upload HTML (blob + `<base>`)

**Upload HTML** serves the file as a **`blob:`** document. Browsers resolve relative URLs against that opaque URL, so **`HYPER-GUEST-DEMO.html`’s** `<script src="../../../…">` and `./hyper-web-guest.js` **never load** — you only see static markup/CSS (e.g. background), not **`coffee`** / scene2d / animations.

**Hyper-Web** injects **`<base href="…">`** pointing at the **folder of `HYPER-WEB-ALPHA.html`** (unless the file already has a `<base>`). Then the same relative paths work as when you open the guest from disk. Export still stores your **original** HTML; re-import applies the base again.

## Messages

| Message | Direction | Payload |
|---------|-----------|---------|
| **`hyper-tick`** | Host → guest | `{ type: 'hyper-tick', time: number /* seconds */, playing: boolean }` |
| **`hyper-prop`** | Host → guest | `{ type: 'hyper-prop', key, value }` — keys match **`hyper.controls`** |
| **`hyper-ready`** | Guest → host | `{ type: 'hyper-ready' }` — clip ready for ticks |
| **`hyper-viewport`** | Host → guest | `{ type: 'hyper-viewport', width, height }` — composition **CSS pixels** (after `fitComposition`). **Stretch** mode is usually **not** 1280×720; guests should resize to the iframe / this message, not assume `COMP_W`. |

Host builds ticks with **`coffee.omni.hyperTick(time, playing)`** (load **`coffee-omni.js`** on the flagship page).

## OMNI (host helpers)

| Piece | Role |
|--------|------|
| **`coffee.omni`** | `validateHtml`, **`hyperTick`**, `hyperPropMessage`, `isHyperReadyMessage`, schema → inspector |
| **`hyper` controls** | Declares Properties panel fields; host sends matching **`hyper-prop`** |

**Play / pause / scrub** = Hyper-Web updates **`globalT` + `playing`** and **`broadcastTick()`** (postMessage **`hyper-tick`** to each iframe). Not part of `hyper.controls`.

## Adding fields to the Properties panel

1. **Built-in guest (demo)** — **`GUEST_MANIFEST.hyper.controls`** in **`HYPER-WEB-ALPHA.html`** + handle keys in **`onProp`** in **`HYPER-GUEST-DEMO.html`** (via **`hyperWebGuest.start`**).
2. **Packaged CCE** — **`manifest.json`** → **`hyper.controls`** (see **`COFFEE-OMNI/omni-schema.example.json`**).
3. **Rendering** — `coffee.omni.parseSchemaFromManifest` → `inspectorSectionsFromControls` → `coffee.inspector`.

## Timeline “tracks”

**What α has:** horizontal **time ruler** + **one track row per layer** (purple/orange clip bar = full 0–30s span) + **playhead**. **Adding “more stuff”** = **Add guest** or **Upload HTML** (each new layer = another row). There are **no per-layer multi-clips or keyframe lanes** yet—that’s a larger feature than the current host.

**Empty project:** ruler + a dashed **Tracks** placeholder row explaining how to add clips.

**vs. `TEST/HYPER-WEB-3-PARSING.html`:** separate Tailwind **xweb** POC (~40% viewport bottom stack, V1/V2-style labels, wider clip bars). α never merged that UI—parity is optional follow-up work.

## Stage centering

### Where layout can break (why CSS tweaks “move” the preview)

Everything is **chained**. Changing **one** link without the others is what usually causes drift, clipping, or “wrong” centering:

| Step | What it is | If you break it… |
|------|------------|------------------|
| 1 | **`.hyper-body`** is **flex** (desktop row: **`200px` / `flex:1 1 0` / `280px`**); was grid **`1fr`** (seam risk). | Middle must **`min-width:0`** so **`flex:1 1 0`** can shrink → real **`clientWidth`** / **`Height`** for **`fitComposition()`**. |
| 2 | **`.hyper-stage-wrap`** is **`position: relative`**; **`.hyper-stage`** is **`position: absolute; inset: 0`**. | Stage doesn’t fill the black panel → composition floats or has bogus size. |
| 3 | **`.hyper-stage`** uses **`display: flex`** + centering for **`?hyper-letterbox=1` / `?hyper-cover=1`** only. **Default stretch** pins **`.hyper-composition`** with **`position: absolute; inset: 0`** so it always fills the black stage (flex + px-matched child could drift top-left in some layouts). | Don’t mix stretch with flex-sized comp without updating **`fitComposition()`**. |
| 4 | **`fitComposition()`** — **stretch:** **`inset: 0`** on the comp; **contain/cover:** explicit **`width` / `height` in px** + flex center. | If CSS fights **`fitComposition()`** (extra **`transform`** on the comp, wrong **`position`**), things shift. |
| 5 | **`.hyper-composition`** is **`position: relative`**; layers are **`position: absolute; inset: 0`** inside it. | If the comp’s **used size** collapses (e.g. only abspos children, wrong flex), the clip rect is wrong. |
| 6 | **`.hyper-layer-frame`** gets **`transform`** (X/Y/scale/rotate). | Inspector moves the **whole** iframe box; this is separate from stage CSS unless the comp is already mis-sized. |

**Scale / “not filling”:** In the inspector, **`Scale = 1`** means the layer **fills the composition box** (the iframe’s viewport). The slider runs up to **2.5×** — the **far right is zoom in**, not “fit.” Values **below 1** shrink the layer and show empty space *inside* the composition. **X/Y** nudge the whole layer in px. Use **Reset transform** in the Hyper-Web header if things look stuck.

**Iframe:** frame/xform from **`roundedCompositionSize()`**; **`<iframe>`** is inset with **`HYPER_IFRAME_GUTTER_X`** (~**8px**) + host nudge **`HYPER_IFRAME_NUDGE_X`** (default **4px** right, not layer **X/Y**). **`hyper-viewport`** = iframe **inner** size.

### What is the black area vs the iframe?

- **Black rectangle** = **not** an iframe. It’s **`main.hyper-stage-wrap`** (background) and the inner **`.hyper-stage`** (fills the wrap). That’s just HTML layout.
- **Iframe** = only **inside** each **layer** (`.hyper-layer-frame` → `.hyper-layer-xform` → **`<iframe class="hyper-layer-embed">`**). The guest document fills the **composition** box, not the whole black chrome around it.

**`.hyper-composition`** — **`fitComposition()`** sets **`width` / `height`** in CSS pixels (no **`transform: scale`** on the composition).

- **Default: stretch** — **`fitComposition()`** sets **`.hyper-composition`** to **`position:absolute; inset:0`** so it **fills** **`.hyper-stage`** (same black panel you see). **`?hyper-letterbox=1` / `?hyper-cover=1`** switch the comp to **`position:relative`**, explicit **px** size, and **flex** centering on the stage.
- **`?hyper-letterbox=1`** — **contain** 16∶9 (full logical frame, **bars**).
- **`?hyper-cover=1`** — **cover** 16∶9 (**crop** to 1280∶720 scale).

**1280×720** remains the **reference** for contain/cover math and export; stretch mode uses whatever pixel size the stage gives you.

**ResizeObserver** + **`resize`** refresh layout.

**Debug:** **`?hyper-debug=1`** — extra **`[Hyper-Web]`** layout logs; layer mounts **`console.info`** rects.

Each layer: **`.hyper-layer-frame`** (clip) → **`.hyper-layer-xform`** → **`<iframe>`**.

**Who draws “the art”:**  
1. **Hyper-Web** — **`.hyper-layer-frame`** gets **`transform`** (translate / scale / rotate) and clips; **`.hyper-layer-xform`** is identity (fills frame); **`<iframe>`** has **no** `transform` (**inset 0**). Putting transform only on the inner wrapper while the frame stayed full-composition made X/Y pan the art inside a fixed window — wrong.  
2. **Guest / uploaded HTML** — layout **inside** the iframe viewport. Hyper-Web does not paint the guest.

Inside the guest, a **fixed-size** **`coffee.scene2d`** box (960×540 + `aspect-ratio`) centered with **`margin: auto`** leaves the guest **`#wrap` background** visible as a second “page” outline — **not** a nested iframe. **`HYPER-GUEST-DEMO.html`** stretches the scene to **100%×100%** of the area below the toolbar and drops the inner border on **`.hyper-layer-frame`** so one rounded comp reads as one surface.

**`hyper-body`** is a **column flex** on small screens and a **row flex** on desktop so the stage gets real width/height. **`hyper-stage-wrap`** sets a **`min-height`** fallback.
