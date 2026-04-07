# Hub CSS, iframe forms, and layout — troubleshooting notes

This doc captures issues we hit on **Coffee.Hub** (`COMMUNITY-HUB.html`) and **`MAINTAINER-FORM.html`** (loaded in a slide-up panel iframe). Use it if layouts look “half styled,” overlap, or UI appears in the wrong place.

---

## 1. External stylesheet vs inlined CSS

**Symptom:** Nav/shell looks fine but modals, apply panel, or iframe form look broken, cramped, or unstyled.

**Cause:**

- **`COMMUNITY-HUB.css`** is loaded via `<link href="COMMUNITY-HUB.css">`. That can fail or behave oddly when:
  - the page is opened with a **wrong base URL**,
  - the app is run under **`file://`**,
  - a **packager / CCE preview** rewires paths,
  - or the request is **slow** and only inline rules apply first paint.
- **`MAINTAINER-FORM.html`** also links the same file; inside an **iframe**, the child document requests CSS **relative to the form URL**. Same failure modes.

**What we did:**

- **`COMMUNITY-HUB.html`** embeds the full hub skin in `<style id="ch-hub-inlined-css">` (synced from `COMMUNITY-HUB.css` via **`python3 sync-hub-css.py`**).
- **`MAINTAINER-FORM.html`** links **`COMMUNITY-HUB.css`** and adds **`#ch-maint-form-skin`**: scoped layout under **`#maint-root`** so the form **stacks correctly** inside the iframe even when the linked sheet is missing or late. (You can re-run **`sync-hub-css.py`** if you also embed the full sheet there again.)

**If you edit hub styles:** change **`COMMUNITY-HUB.css`**, then run **`sync-hub-css.py`** so the hub HTML stays in sync (see `README.md`).

---

## 2. Apply / modal overlay appearing in document flow (top of page, tiny strip)

**Symptom:** “Vision & maintainer interest” and the iframe sit **above** the real header, or look like a thin bar, not a full-screen overlay.

**Causes:**

- **`#ch-apply-layer`** relied on **flex + `position: absolute`** children. If **`position: fixed`** on the layer didn’t apply (or the box **collapsed** because only absolutely positioned children don’t give the parent height), children could paint at the **top of the scrollable document**.
- **`visibility: hidden` / `opacity: 0` alone** is weaker than **`display: none`** for “must not show or take interaction.”

**What we did:**

- **Closed state:** `#ch-apply-layer { display: none; }`, **open:** `.ch-apply-layer.ch-apply-open { display: block; }`.
- **`position: fixed`** on **`.ch-apply-backdrop`** and **`.ch-apply-panel`** so they’re tied to the **viewport**, not a collapsed wrapper.
- **`z-index: 1000`** so the stack sits above the sticky nav (`z-index: 50`).

---

## 3. Form fields overlapping or sitting side-by-side wrong

**Symptom:** Labels and inputs crowd one row; name/email too narrow; textarea overlaps email.

**Causes:**

- **`<label>`** defaults toward **inline** flow unless you set **`display: flex; flex-direction: column`** (or block) on the field wrapper.
- **Grid/flex children** default to **`min-width: auto`**, so inputs keep a **minimum intrinsic width** and **won’t shrink** → overflow and overlap.
- **Partial CSS:** only global tokens load, not the **`.ch-apply-*`** rules, so the above never gets fixed.

**What we did:**

- In **`#ch-maint-form-skin`**: **`#ch-apply-form`** is a **column flex** with **`gap`**; each **`.ch-apply-field`** is **column flex**, **`width: 100%`**, **`min-width: 0`**.
- **`.ch-apply-row2`:** **`grid-template-columns: minmax(0, 1fr)`** (and two columns from **`480px`** up).

---

## 4. Honeypot / hidden fields affecting layout

**Symptom:** Odd gap, stray focus ring, or tiny clickable area.

**Cause:** Spam honeypot **`input[type=checkbox]`** with **`position: absolute`** but a bad containing block can still participate in layout in edge cases.

**What we did:** **`#ch-apply-form`** has **`position: relative`**; honeypot **`#ch-apply-botcheck`** is moved **off-screen** with **`opacity: 0`**, **`pointer-events: none`**, tiny box — **not** `display: none` (some processors expect the field in the DOM).

---

## 5. Junk after `</html>`

**Symptom:** Random characters (e.g. short hex-like text) at the bottom of the form.

**Cause:** **Characters pasted or saved after the closing `</html>`**. Browsers may still render a text node in the document.

**Fix:** Delete anything **after** `</html>`; keep the file ending clean.

---

## 6. Fonts still depend on Google (optional)

The inlined/skin CSS can still use **`@import url('https://fonts.googleapis.com/...')`** from `COMMUNITY-HUB.css`. If **everything** must work **offline**, swap to **system font stack** or self-hosted fonts separately.

---

## Quick checklist when something looks wrong

| Check | Action |
|--------|--------|
| Hub looks unstyled | Confirm `#ch-hub-inlined-css` exists in `COMMUNITY-HUB.html`; run `sync-hub-css.py` after editing `COMMUNITY-HUB.css`. |
| Form in iframe messy | Inspect whether `COMMUNITY-HUB.css` 404s in Network tab; strengthen `#ch-maint-form-skin` if needed. |
| Modal not overlaying | Confirm `#ch-apply-layer` uses `display: none` until `.ch-apply-open`; backdrop/panel `position: fixed`. |
| Overlapping fields | Confirm field wrappers are column flex + `min-width: 0` + full width on inputs. |
| Mystery text at bottom | Search file for garbage after `</html>`. |

---

## Related files

| File | Role |
|------|------|
| `COMMUNITY-HUB.css` | Canonical `.ch-*` source |
| `sync-hub-css.py` | Copies CSS into inlined `<style>` in hub + form HTML (when that workflow is enabled) |
| `COMMUNITY-HUB.html` | Shell + `#ch-apply-layer` iframe |
| `MAINTAINER-FORM.html` | Form + `#ch-maint-form-skin` |
