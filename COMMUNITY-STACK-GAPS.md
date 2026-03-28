# Community Stack — Gaps & Roadmap

What's missing or thin in the Coffee Community/Source stack. Use this as a prioritization guide.

**Content / flagship toolbelt (optional “missing X tool” ideas):** see **`COMMUNITY-STACK-GAPS-2.md`**.

---

## Core Platform

| Gap | Status | Notes |
|-----|--------|-------|
| **Routing / navigation** | Missing | No URL-based routing or deep links; shell is flat, no back stack |
| **App lifecycle** | Thin | Apps in iframes are torn down on close; no save/restore or lifecycle hooks |
| **Notifications** | Partial | Shade exists; `coffee.toast()` for inline feedback. No API for shell notifications. |

---

## Data & State

| Gap | Status | Notes |
|-----|--------|-------|
| **HTTP / API** | Covered | `coffee.request()` — fetch wrapper, baseUrl, defaultHeaders, timeout, JSON by default |
| **Structured storage** | Thin | `save`/`load` for key-value; Drive for IndexedDB; no tables, lists, or query layer |
| **Shared state** | Missing | No event bus or shared state between apps (beyond postMessage) |
| **Offline-first** | Unclear | No explicit story for shell/apps working offline |

---

## UI

| Gap | Status | Notes |
|-----|--------|-------|
| **Modals / dialogs** | Covered | `coffee.modal()`, `coffee.dialog()` — COFFEE-MODAL |
| **Lists / tables** | Covered | `coffee.list()`, `coffee.table()` — COFFEE-LIST, COFFEE-TABLE |
| **Forms** | Covered | `coffee.form()` — COFFEE-FORMS, validation, submit |
| **Loading / error patterns** | Thin | Spinner exists; no standard patterns for async flows and error display |

---

## Creative / 3D

| Gap | Status | Notes |
|-----|--------|-------|
| **3D scenes** | Covered | `coffee.scene3d()` — COFFEE-SCENE3D. Declarative shapes (box, sphere, plane, cylinder, torus, cone), orbit controls, `custom()` escape hatch. Three.js 0.128 |
| **2D canvas** | Covered | `coffee.scene2d()` — COFFEE-SCENE2D. Declarative shapes (rect, circle, line, arc, ellipse, path). Raw Canvas 2D, no deps. `custom()` escape hatch |
| **Drawing** | Covered | `coffee.draw()` — COFFEE-DRAW. Interactive drawing on scene2d. Brush, strokes, clear, getShapes |
| **Animation** | Covered | `coffee.animate()` — COFFEE-ANIMATE. Standalone tween engine. Works with scene2d, draw, DOM |

---

## Identity & Auth

| Gap | Status | Notes |
|-----|--------|-------|
| **User model** | Missing | No built-in identity, profiles, or login |
| **Permissions** | Missing | No explicit permission model (camera, mic, storage) |

---

## Ecosystem

| Gap | Status | Notes |
|-----|--------|-------|
| **Docs** | Thin | No central API reference or "how to build" guide |
| **Store flow** | Thin | Store UI exists; no clear submission, review, or install flow |
| **Theming** | Thin | `injectTheme` exists; no user-facing theme or accent customization |

---

## Nice-to-Have

| Gap | Status | Notes |
|-----|--------|-------|
| **i18n** | Missing | No localization |
| **Accessibility** | Unclear | Consistency of aria/roles/keyboard support |
| **Testing** | Missing | No test harness or guidance for Coffee apps |

---

## Priority Order (Suggested)

**High impact:**
1. Modals / dialogs
2. Forms
3. Docs (API reference)
4. Notifications API

**Medium impact:**
5. Routing / navigation
6. App lifecycle (save/restore)
7. ~~Lists / tables~~ ✓ Covered
8. Store flow

**Lower / later:**
9. Shared state / event bus
10. Structured storage
11. User model / permissions
12. Theming, i18n, a11y, testing
13. ~~3D scenes~~ ✓ Covered (scene3d)
14. ~~2D canvas~~ ✓ Covered (scene2d)
