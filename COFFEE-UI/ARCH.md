# Coffee UI — Architecture

## What It Is

Coffee UI is a small set of **opinionated UI bricks** — functions that return styled DOM elements. Vanilla JS, no framework. Same philosophy as Coffee Control: give people primitives they can combine.

---

## Pattern: Extends the `coffee` Object

Coffee UI **adds to** the same `coffee` object that Coffee Control uses:

```js
// Coffee Control creates: coffee = { camera, speak, encrypt, ... }
// Coffee UI adds:        coffee.button = function(...) { ... }
// Result:                coffee = { camera, speak, encrypt, ..., button }
```

- Uses `window.coffee || {}` — if Control is loaded, we extend it; if not, we create a minimal `coffee` with just UI methods.
- Assigns back to `window.coffee` so the augmented object is what the page uses.

---

## Tie-In to Coffee Control

| | Coffee Control | Coffee UI |
|---|---|---|
| **Purpose** | Device / browser APIs (camera, mic, speak, encrypt, etc.) | UI primitives (button, etc.) |
| **Dependency** | None | None — each works standalone |
| **When both loaded** | Same `coffee` object, merged |

**Loading order** (when using both):

```html
<script src="coffee-control.js"></script>
<script src="coffee-ui.js"></script>
```

Coffee Control must set `window.coffee = coffee` so Coffee UI can extend it. Without that, Coffee UI would create its own `coffee` and the page would see two different objects.

**Example — UI + Control together:**

```js
const b = coffee.button('Speak', () => coffee.speak('Hello'));
document.body.appendChild(b);
```

The button is from Coffee UI; the click handler uses Coffee Control.

---

## API Reference

### High-Value Primitives

| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.button(text, onClick?, opts?)` | `HTMLButtonElement` | Styled button; `opts` = style overrides |
| `coffee.input(opts?)` | `HTMLInputElement` | Text input; opts: `type`, `placeholder`, `value`, `id` + style |
| `coffee.textarea(opts?)` | `HTMLTextAreaElement` | opts: `placeholder`, `value`, `id`, `rows`, `cols` + style |
| `coffee.select(opts?)` | `HTMLSelectElement` | opts: `options` = [{ value, label }], `value`, `id` + style |
| `coffee.label(text, forEl?, opts?)` | `HTMLLabelElement` | Form label; `forEl` = id string or element |
| `coffee.link(text, href, opts?)` | `HTMLAnchorElement` | Styled anchor |
| `coffee.text(content, opts?)` | `HTMLSpanElement` | Inline text |
| `coffee.para(content, opts?)` | `HTMLParagraphElement` | Body copy |
| `coffee.spinner(opts?)` | `HTMLDivElement` | Loading spinner (design_principals) |
| `coffee.msg(text, type?, opts?)` | `HTMLDivElement` | Message box; type = 'success' \| 'warning' \| 'error' \| 'info' |
| `coffee.card(children, opts?)` | `HTMLDivElement` | Styled container; children = element(s) or array |
| `coffee.glass(children, opts?)` | `HTMLDivElement` | Backdrop blur, semi-transparent; for overlays, HUDs |
| `coffee.progressBar(value, max?, opts?)` | `{ el, barEl, valueEl, update(v, max) }` | HP/progress bar; opts: label, lowThreshold, color |
| `coffee.announce(opts?)` | `{ el, show(msg), hide() }` | Large centered text; opts: duration (ms) |
| `coffee.scoreRow(opts?)` | `{ el, dot, labelEl, valueEl }` | Dot + label + value; opts: color, label, value |
| `coffee.hud(opts?)` | `{ el, top, center, bottom }` | Full-screen overlay; opts: top, center, bottom = element(s) |
| `coffee.heading(text, level?, opts?)` | `HTMLHeadingElement` | h1–h6; level defaults to 1 |

### Layout Helpers

| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.row(children, opts?)` | `HTMLDivElement` | Flex row; gap from --coffee-space-md |
| `coffee.col(children, opts?)` | `HTMLDivElement` | Flex column |
| `coffee.stack(children, opts?)` | `HTMLDivElement` | Flex column; opts.gap |
| `coffee.appShell(opts?)` | `{ el, header, main, footer }` | Fixed shell, flexible content (design_principals) |
| `coffee.container(children, opts?)` | `HTMLDivElement` | Max-width 600px flex column |

### Theme

| Method | Notes |
|--------|-------|
| `coffee.theme` | `{ light, dark }` — design tokens |
| `coffee.injectTheme('light'\|'dark')` | Injects CSS variables + interaction rules |

**Examples:**

```js
coffee.button('Click me', () => alert('hi'));
coffee.button('Sky', fn, { backgroundColor: '#87CEEB', color: '#333' });
coffee.input({ placeholder: 'Name', type: 'email' });
coffee.card([coffee.heading('Title', 2), coffee.button('OK', fn)]);
coffee.row([coffee.button('A'), coffee.button('B')]);
coffee.stack([coffee.label('Name', inp), inp], { gap: '8px' });
```

---

## Design Integration (No Tailwind/Externals)

Coffee UI fuses **design_principals.md** and **design-standards-apps.md** into built-in tokens and layout:

| Source | What's Applied |
|--------|----------------|
| design-standards-apps | Colors (accent, bg-surface, text-primary), spacing (xs–xl), radius, shadow, typography |
| design_principals | Fixed shell / flexible content, viewport sizing, touch targets (min 44px) |
| Both | Active states (`:active` scale), focus-visible outlines, Inter/system-ui font |

**Tokens:** `coffee.theme.light` and `coffee.theme.dark` — design-standards tokens.

**Injection:** `coffee.injectTheme('light'|'dark')` — injects CSS variables (`:root`) and `[data-coffee]` interaction rules. Called automatically on load (dark default).

**Layout:** `coffee.appShell()` — returns `{ el, header, main, footer }` for the fixed-flexible-fixed structure. `coffee.container(children)` — max-width 600px flex column.

---

## Design Choices

1. **No custom elements** — Plain functions that return DOM nodes. Simpler than Web Components.
2. **No Tailwind/externals** — Tokens and rules injected via `injectTheme()`; components use CSS variables.
3. **Opinionated defaults** — Buttons use accent color, 44px min touch targets; override via `opts`.
4. **Same `coffee` namespace** — One object for Control + UI. No `coffee.ui.button`, just `coffee.button`.
5. **Standalone** — Coffee UI works without Coffee Control. Control works without UI.

---

## Files

| File | Purpose |
|------|---------|
| `coffee-ui.js` | Main script; button, input, textarea, select, label, link, text, para, spinner, msg, card, heading, row, col, stack |
| `test.html` | Demo page — Buttons, Form, Card, Layout, Composed |
| `coffee-ui-idea.md` | Notes on React-style / custom elements approach |

---

## Ship Checklist (Open Source)

- [ ] README.md — Quick start, usage
- [ ] LICENSE — MIT or similar
- [ ] Module export — `export { coffee }` for ES modules
- [ ] Global — Already uses `window.coffee` when loaded via `<script>`
