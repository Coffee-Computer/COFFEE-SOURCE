# COFFEE-SOURCE — Edition status & “where we are”

**Last updated:** March 2026

This file is the **high-level status** for the `COFFEE-SOURCE/` tree: what edition we’re in, what’s frozen, and **where to look** for detail. For module-by-module inventory and shell app lists, use **`COMMUNITY-STATUS.md`**.

---

## Community Edition — **FROZEN**

**Coffee Community Edition** (the `COFFEE-COMMUNITY/` shell, homescreen, Desk Mode, CCE packager/validator, flagship α HTML, and the curated app registries) is **feature-frozen** as of **March 2026**.

| What “frozen” means | What it does *not* mean |
|---------------------|-------------------------|
| No expectation of new CE features, flagship experiments, or roadmap work *in this edition* | The rest of `COFFEE-SOURCE/` (individual `COFFEE-*` packages) can still evolve in other contexts |
| Treat the current CE as a **stable baseline** / reference implementation | **Small fixes** (broken URLs, security patches, docs typos) are still reasonable |
| **Forward product work** → fork, private/Pro line, or another repo (see **`COFFEE-COMMUNITY/COMMUNITY-ARC.md`**) | N/A |

If you ship changes under `COFFEE-COMMUNITY/` after the freeze, prefer **maintenance-only** unless you explicitly **un-freeze** or branch a new edition.

---

## Where we are (quick map)

| You want… | Open / read |
|-----------|-------------|
| **Curated launcher (devsumer grid)** | `COFFEE-COMMUNITY/COMMUNITY-HOMESCREEN/coffee-community-homescreen.html` + `devsumer-apps.json` |
| **Kitchen-sink shell (big grid)** | `COFFEE-COMMUNITY/coffee-community-shell.html` + `shell-apps.json` |
| **Desk Mode (DOS-style)** | `COFFEE-COMMUNITY/COMMUNITY-DESKTOP/COMMUNITY-DESKTOP-ALPHA.html` + `community-desktop-registry.json` |
| **CCE package spec & tools** | `COFFEE-COMMUNITY/CCE-SPEC.md`, `COFFEE-COMMUNITY/tools/` |
| **Philosophy / CE vs Pro** | `COFFEE-COMMUNITY/COMMUNITY-ARC.md` |
| **Every module + API table** | **`COMMUNITY-STATUS.md`** (same folder as this file) |
| **Known gaps (historical)** | `COMMUNITY-STACK-GAPS.md` |
| **2D game studio (Play stack)** | `COFFEE-COMMUNITY/FLAGSHIP/DUCK-IDE/DUCK-IDE-ALPHA.html` (α); runtime/templates in `COFFEE-PLAY/` |

**Serve over HTTP** from `COFFEE-SOURCE/` (or above) so flagship pages and fetches resolve correctly.

---

## COFFEE-SOURCE vs Community Edition

- **`COFFEE-SOURCE/`** — Monorepo of `COFFEE-*` libraries (Control, UI, Play, Drive, …) **plus** `COFFEE-COMMUNITY/` as the **Community Edition** umbrella.
- **Frozen slice** — Primarily **`COFFEE-COMMUNITY/`** and the **integration story** (homescreen, desktop, store, registries, flagship α pages listed there).
- **Not automatically frozen** — Standalone demos and libraries (`COFFEE-PLAY/PLAY-DEMO.html`, etc.) may continue to be edited; just don’t assume CE launchers will track every demo unless someone updates JSON registries.

---

## Doc index (this tree)

| Document | Role |
|----------|------|
| **`SOURCE-STATUS.md`** | *This file* — freeze + entrypoints |
| **`COMMUNITY-STATUS.md`** | Deep snapshot: modules, shell apps, CCE APIs, file layout |
| **`COMMUNITY-STACK-GAPS.md`** | Gap list (historical; not a post-freeze roadmap) |
| **`COFFEE-COMMUNITY/COMMUNITY-ARC.md`** | Discovery, surfaces, CE vs Pro |
| **`COFFEE-COMMUNITY/CCE-SPEC.md`** | `.cce` format |

---

## Changelog (status only)

| Date | Note |
|------|------|
| **2026-03** | **Community Edition declared frozen.** `SOURCE-STATUS.md` added; `COMMUNITY-STATUS.md` updated with freeze banner and pointers. |
