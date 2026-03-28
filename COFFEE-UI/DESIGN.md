# Coffee UI — Design Fusion

Coffee UI bakes in design rules from `docs/design_principals.md` and `docs/design-standards-apps.md` **without Tailwind or external CSS**. All tokens and interaction rules are injected via `coffee.injectTheme()`.

---

## Tokens (from design-standards-apps)

| Token | Light | Dark |
|-------|-------|------|
| `--coffee-accent` | #4c9aff | #4c9aff |
| `--coffee-bg-surface` | #ffffff | #1a1a1a |
| `--coffee-bg-elev` | #f7fafc | #252525 |
| `--coffee-panel` | #2d2d2d | #2d2d2d |
| `--coffee-text-primary` | #111827 | #eee |
| `--coffee-text-muted` | #6b7280 | #9ca3af |
| `--coffee-space-xs` … `--coffee-space-xl` | 4px … 40px | same |
| `--coffee-radius-sm` / `--coffee-radius-md` | 8px / 12px | same |
| `--coffee-touch-min` | 44px | 44px |

---

## Layout (from design_principals)

- **Fixed shell, flexible content** — `coffee.appShell()` returns header (fixed), main (flex-grow), footer (fixed).
- **Max-width 600px** — `coffee.container()` and app shell use max-width for comfortable reading on desktop.
- **Viewport** — Apps should set `body { height: 100dvh; width: 100vw; overflow: hidden; }` when using app shell as root.

---

## Interaction (from both docs)

- **Touch targets** — Buttons, links, inputs use `min-height: 44px` (--coffee-touch-min).
- **Active feedback** — `[data-coffee="button"]:active { transform: scale(0.97); }`
- **Focus** — `:focus-visible` outline using accent color.
- **No alert()** — Use `coffee.msg(text, 'success'|'warning'|'error')` for feedback.
- **Loading** — Use `coffee.spinner()` before fetch (design_principals).

---

## Feedback Components

| Component | Use |
|-----------|-----|
| `coffee.spinner()` | Loading state before async ops |
| `coffee.msg(text, type)` | Success (green), warning (amber), error (red), info |
| `coffee.text(str)` | Inline text |
| `coffee.para(str)` | Body copy / paragraph |

---

## Usage

```js
coffee.injectTheme('dark');  // or 'light'
const { el, header, main, footer } = coffee.appShell();
header.appendChild(coffee.heading('My App', 3));
main.appendChild(coffee.card([...]));
document.body.appendChild(el);
```
