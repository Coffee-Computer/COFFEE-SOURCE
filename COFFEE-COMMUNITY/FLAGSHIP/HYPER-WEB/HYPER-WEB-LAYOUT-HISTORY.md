# Hyper-Web α — Stage / guest layout (what works, what didn’t)

**Status (Mar 2025):** Layout is **working** in practice: guests fill the composition and match the black stage closely. A **tiny black sliver** (≈1px / sub-pixel) may still appear at an edge in some browsers — **not** yet fully chased; treat as optional polish after this doc.

This file records **failed attempts** during debugging and the **fix that actually worked**, so future changes don’t repeat the same loops.

---

## What finally fixed it (keep this)

### 1. Pin the composition to the stage (stretch mode)

**`fitComposition()`** in **`HYPER-WEB-ALPHA.html`**: default **stretch** uses **`position: absolute; inset: 0`** on **`.hyper-composition`** so it always fills **`.hyper-stage`**, instead of relying on flex + a child sized only with `%` / px that could drift **top-left** in grid / `min-height` situations.

See **`hyper-web.css`** + **`fitComposition()`** stretch branch.

### 2. Pin guest iframe stack to composition size in **pixels** (the main win)

**`sizeGuestLayersToComposition()`** in **`HYPER-WEB-ALPHA.html`**, called from the **`finally`** block of **`fitComposition()`** every time layout runs:

- Read size via **`roundedCompositionSize()`**: **`Math.round(getBoundingClientRect())`**, fallback **`Math.round(clientWidth/Height)`** — same values as **`hyper-viewport`**. (Avoids **`Math.floor`** on host + guest shaving a sub-pixel strip twice.)
- Set **explicit `width` / `height` in px** (not `%`) on:
  - **`.hyper-layer-frame`**
  - **`.hyper-layer-xform`**
  - **`<iframe class="hyper-layer-embed">`**
- Use **`left: 0; top: 0`**, **`right` / `bottom`: `auto`** so percentage sizing doesn’t fight the chain.
- Then **`applyLayerTransform(L)`** so inspector **X / Y / Scale / Rotate** still apply on a **correctly sized** box.

**Why this matters:** Nested **`width: 100%; height: 100%`** on **`iframe`** often **does not** resolve to the full composition. The iframe falls back toward its **intrinsic default (~300×150 px)**, so the clip looks like a **small box hugging a corner** with lots of black around it — **for any guest** (scene2d, canvas, upload).

### 3. Supporting pieces (still in tree)

| Piece | Role |
|--------|------|
| **`<base href>`** on **Upload HTML** (`htmlForBlobLayer`) | Blob URLs break relative `<script src>`; base points at the Hyper-Web folder. |
| **`hyper-viewport`** (`postMessage`) | Guests get composition **CSS pixels**; **`COMP_W`/`COMP_H` (1280×720)** are only for **letterbox/cover** math, not stretch. |
| **`hyper-web-guest.js`** | Handles **`hyper-viewport`** (fires `resize`) even before **`start()`**. |
| **Shell: `.hyper-body` flex** (desktop row) | **`flex: 1 1 0`**, **`min-width: 0`** / **`min-height: 0`** on **`.hyper-stage-wrap`** so the stage gets real **`clientWidth`/`Height`** (avoids grid **`1fr`** seam vs fixed tracks). |
| **`coerceLayerTransformProps` + `settleLayerTransformToDefault` + Reset transform** | Stops inspector / import from leaving **Scale ≠ 1** or bad **X/Y** that *look* like layout bugs. |
| **Guest demos** | Full-bleed shell, **`ResizeObserver`**, scene/canvas sized from **viewport** / **`getBoundingClientRect`** — fixes **inside-iframe** gaps, not the host iframe box. |

**Code pointers:** `sizeGuestLayersToComposition`, `fitComposition` `finally`, **`HYPER-WEB-ALPHA.html`**.

---

## Attempts that did *not* solve the core issue (or were reverted / partial)

These are **worth knowing** so we don’t “fix” layout only in the guest and assume the host is fine.

| Attempt | Why it wasn’t enough / what went wrong |
|---------|----------------------------------------|
| **Only changing guest CSS** (scene2d flex, `justify-content`, 1280×720 logical size, `height: 100%`) | Improves **content inside** the iframe; does **not** fix a **tiny intrinsic iframe** if the host never gave the iframe real dimensions. |
| **Flex-center the composition** + **child with same px as stage** | In some grid / `min-height` cases the flex item could still **visually sit top-left** or misalign vs the black wrap. |
| **`transform` on inner `.hyper-layer-xform` only** (frame full-bleed) | **X/Y** in the inspector moved **art inside** a full-size clip instead of moving the **whole layer** — confusing and wrong for a compositor mental model. **Fix:** transform on **`.hyper-layer-frame`**. |
| **Grid `place-items: stretch`**, **composition `position: absolute` + % tricks**, **`translate(-50%,-50%)` on comp** | Various experiments that **fought** `fitComposition()` or layer transforms; **reverted** in favor of simpler stretch = **comp `inset: 0`**. |
| **Assuming `Scale = 1` in inspector = “fill”** | Scale slider goes to **2.5×**; **1** = fill **composition**. Values **&lt; 1** shrink the layer — looks like padding. **Reset transform** + clearer labels helped, but didn’t fix **300×150 iframe**. |
| **Treating `COMP_W`/`COMP_H` as the stretch composition size** | **Stretch** uses **whatever the stage is**; 1280×720 is for **`?hyper-letterbox=1` / `?hyper-cover=1`** only. Guests that hardcode 1280×720 can **mismatch** real iframe pixels. |
| **Blob upload without `<base>`** | Scripts don’t load → **static background only**, “no animations” — separate from iframe size. |
| **Inspector `update()` snapping missing range keys to `min`** | Made **opacity 0** / **scale at minimum**; fixed in **`coffee-inspector.js`**, not the iframe geometry. |

---

## Symptoms → likely cause (quick map)

| Symptom | Likely cause |
|---------|----------------|
| Small guest **top-left**, lots of black in composition | **Iframe intrinsic / `%` collapse** → need **`sizeGuestLayersToComposition()`**. |
| Animations / scripts missing on **Upload HTML** only | **Blob URL** + relative scripts → need **`<base href>`**. |
| Inspector says **Scale 1, X/Y 0** but still wrong | Often **was** iframe box wrong; after px sizing, remaining gap may be **sub-pixel** or **guest internal** layout. |
| **Two layers** stacked | Only top layer fully visible; check layer order + per-layer transform. |

---

## Optional follow-up

- **Unified rounding (done):** **`roundedCompositionSize()`** + guests use **`Math.round`** for internal sizing.
- **1px bleed (done):** **`LAYER_PX_BLEED`** — iframe **`width/height`** = composition + 1; **`.hyper-layer-frame`** stays composition size with **`overflow:hidden`**. **`hyper-viewport`** postMessage uses the same +1 so guests match **`innerWidth`/`innerHeight`**.
- **Stage ↔ inspector hairline:** Was partly **CSS Grid `1fr` + fixed tracks**; shell is now **flex row**. If a line persists: **`border-left` on the inspector** can read as a gap — use **`box-shadow: inset 1px 0 0`** instead; **desktop** **`margin-left: -10px`**, **`padding-left: 22px`**, **`z-index: 4`**, **`.hyper-body { overflow-x: visible }`** so the panel **paints over** the seam. Still not layer **Scale**. Inside guest: **DPR** / canvas.

---

## Related files

| File | Responsibility |
|------|------------------|
| **`HYPER-WEB-ALPHA.html`** | `fitComposition`, `sizeGuestLayersToComposition`, **`guestIframeLayoutPx`** (**`HYPER_IFRAME_GUTTER_X`**, **`HYPER_IFRAME_NUDGE_X`** host-only iframe shift), viewport postMessage |
| **`hyper-web.css`** | Stage shell (flex), composition, layer frame / xform |
| **`hyper-web-guest.js`** | `hyper-viewport` → `resize` |
| **`HYPER-GUEST-DEMO.html`** / **`HYPER-GUEST-ART-DEMO.html`** | In-iframe layout; art guest uses **inlined** flow preset (**no `coffee.coil` fetch**). **Art + iframe:** short **rAF bootstrap** (size + warmup) then **only `onTick` → `drawStep`** so **pause** freezes the sim; endless rAF while paused would keep calling **`runner.step()`**. Host **`broadcastTick()`** on **iframe `load`** helps the first frame. Scene demo still uses **`breatheLoop()`** so it always redraws. |
| **`coffee-inspector.js`** | Transform field defaults / missing-key behavior |
| **`README.md`** (this folder) | Protocol + shorter stage notes |

---

*Last updated: layout approach verified working; sliver called out as known optional polish.*
