# Community Stack — Gaps 2 (Content & Tools)

Optional **product / toolbelt** gaps relative to the **nine Community flagships** (`COFFEE-COMMUNITY/FLAGSHIP/*`). This doc is about **what kinds of apps** you might add—not wiring, registry, or platform APIs.

**Out of scope here (covered elsewhere):** app store / distro, profile, keys, auth, identity. See **`COMMUNITY-STACK-GAPS.md`** for platform, data, UI primitives, and ecosystem gaps.

### Why keep this list?

Filling **every** gap is how you end up building another whole computer—that’s not the goal. Naming the gaps anyway helps **future dogfooding** (what to stress-test and prototype next), **setting standards** (what a Coffee-shaped “video tool” or “sheet” should feel like when you *do* touch that lane), and **coherence**—so the stack reads as **intentional architecture**, not a random bag of bricks.

---

## Flagship baseline (reference)

- **Nine flagships** on devsumer + desktop registry: Scribe, Speak, Frugal, Bright House, Snap Shot, Snow Shoes, Vector, Kite, Hyper-Web.
- **Framing:** **8 focused tools + 1 compositor** — **Hyper-Web** is the multi-surface / iframe / layout compositor; the other eight are domain tools (writing, voice, money, photos, booth, vector, audio/shoes, Kite’s lane).
- **Code** (`COFFEE-CODE/CODE-DEMO.html`) is a **platform demo** on the homescreen (desktop-gated), not counted in the nine `FLAGSHIP` alphas unless you promote it.

---

## Optional “missing X tool” categories

Nothing below is required—the current set already covers a strong **creative + personal** slice. These are **common adjacent slots** if you want another flagship *category* later.

| Kind of thing | Why it might feel “missing” | Notes |
|---------------|----------------------------|--------|
| **Video / motion** | Timeline, clips, export—different muscle than stills + booth | Hyper-Web can embed players; not a full editor story |
| **Sheet / data** | Grids, CSV, light modeling | Frugal is **money-shaped**, not general spreadsheet |
| **Tasks / calendar** | Time + commitments | Community **Notes** POC is light; no flagship “planner” |
| **Whiteboard / infinite canvas** | Messy ideation vs precise Vector | Vector is structured drawing; whiteboard is looser |
| **Read / research** | Reader, highlights, second brain | Hyper-Web can host pages; dedicated reader UX is different |
| **Chat / feed / presence** | Social layer | Intentionally excluded from this doc’s scope |
| **Automation / scripting** | “Run this” glue beyond shell Terminal POC | Power-user / workflow story |
| **Games / play** | Toy sandboxes, mini-games | Depends how you position **Kite** |

---

## Shell demos (not flagships)

Homescreen also lists **shell-curated modules** (e.g. Store, Calc, Notes, Files, Terminal, Settings, AI, Bee, Synth)—POCs and cross-cutting demos, not the nine `FLAGSHIP` products. They can overlap the categories above without being “flagship #10.”

---

## Cross-reference

| Doc | Focus |
|-----|--------|
| **`COMMUNITY-STACK-GAPS.md`** | Routing, lifecycle, storage, notifications, store flow, scene APIs, etc. |
| **`COFFEE-COMMUNITY/COMMUNITY-ARC.md`** | Shell vs desktop vs homescreen registry strategy |
| **`COFFEE-COMMUNITY/COMMUNITY-DESKTOP/README.md`** | Desk Mode + `community-desktop-registry.json` |

---

*Last updated: toolbelt / content gap pass (companion to Gaps 1).*
