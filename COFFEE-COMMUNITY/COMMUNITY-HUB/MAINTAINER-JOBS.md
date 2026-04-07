# Maintainer jobs — guidance for COFFEE-SOURCE

This note explains **realistic maintainer-style roles** you can post or advertise for this repository, and how to keep listings **credible** if you are new to open source. The Hub surfaces sample rows from [`community-jobs.json`](./community-jobs.json); that JSON should stay aligned with **what the repo actually is** (mostly vanilla JS/HTML, `COFFEE-*` modules, CCE tooling, and Community Edition shells).

For edition stance and freeze rules, see the root [`SOURCE-STATUS.md`](../../SOURCE-STATUS.md) and [`COMMUNITY-STATUS.md`](../../COMMUNITY-STATUS.md).

---

## Current recruiting focus (honest phase)

**Right now the project is most interested in creative and visionary collaborators** — people who bring strong **product sense**, **taste**, **narrative**, **UX direction**, or **what-if** energy for flagship experiments and the long-term shape of Coffee (including work that may live in **forks**, **α pages**, or paths described in [`COMMUNITY-ARC.md`](../COMMUNITY-ARC.md) rather than expanding a frozen Community Edition in place).

The **clerical / hygiene / steward** roles listed later in this doc — docs janitor, registry cleanup, validator edge cases, shell path fixes — are **real and worth advertising eventually**, but **at current scale they do not have to be the first hires**. A small core can carry that work until growth makes it obvious you need dedicated maintainers.

When you **do** post those roles, keep listings **specific and credible** (see section 3). When you post for **vision**, be equally clear: *what kind of decisions you want them in*, *whether work is experimental vs maintenance*, and *how CE freeze affects where code lands*.

---

## Advertised roles: vision-first + hybrid

These are the titles **currently mirrored in** [`community-jobs.json`](./community-jobs.json) for the Hub **Open positions** section. Work may land in **α pages**, **`COFFEE-*` modules**, or paths described in [`COMMUNITY-ARC.md`](../COMMUNITY-ARC.md); **Community Edition** itself remains **feature-frozen**, so big CE-surface changes belong behind an explicit **un-freeze**, **fork**, or **new edition** story—say that in outreach and interviews.

**Compensation** in JSON is intentionally **honest** (`Volunteer / discuss` or similar) until you have a published stipend process (see section 3).

### Vision-first

| Title | Hub subtitle (one line) |
|-------|-------------------------|
| **Creative Director, Coffee** | Look & feel · creative bar for flagships & experiments |
| **Product & Flagship Lead** | What ships as demos vs platform; ties experiments to arc / fork |
| **UX / Interaction Lead** | Vanilla JS/HTML shells & apps — strong IA + craft, not Figma-only |
| **Creative Technologist** | Prototypes on Play / Scene / Shaders / DUCK-IDE-shaped stacks |
| **Narrative & Community Story** | How Coffee is explained — onboarding, contributor story, positioning |
| **Ecosystem & Integrations Vision** | What to integrate (e.g. Nostr, data, social) and **why** — strategy, not only wiring |

### Hybrid (vision + hands-on code)

| Title | Hub subtitle (one line) |
|-------|-------------------------|
| **Lead, Experimental Apps** | Own 1–2 flagship α directions end-to-end — concept to shippable HTML |
| **Design Engineering Lead** | Design tokens, **COFFEE-UI**, flagship polish — design **and** implementation |

### JSON fields (for authors)

Each Hub row uses: `title`, `sub_title`, `stipend_label`, `stipend_value`, `button_label`. Optional `dimmed: true` grays out a row in the UI if you want to mark “paused” listings without deleting them.

Optional **`apply_url`** (string): if set on a row, the Hub **APPLY** button opens that URL for that job only. If omitted, the Hub uses **`COMMUNITY_JOB_APPLY_DEFAULT_URL`** in [`COMMUNITY-HUB.html`](./COMMUNITY-HUB.html) (one link for every role—typical for a single form with a “which role?” question). If both are empty, APPLY stays disabled with a hover hint until you configure a URL.

---

## How to apply — what to hook up & what to ask

### Where APPLY should go (pick one)

| Approach | Good for | Watch-outs |
|----------|----------|------------|
| **Google Form** | Fast, familiar, spreadsheet export, file uploads via Drive | Spam; consider “sign in to Google” or a **secret word** in the form description you only share in-repo / Discord |
| **GitHub Discussions** (thread or template) | Everything stays **public** and tied to the repo—very “open source native” | Less structure unless you use a **sticky “how to apply”** post or issue template |
| **`mailto:`** link as default URL | Zero setup—`mailto:you@domain?subject=…&body=…` | Easy to lose messages; harder to track at volume |
| **Typeform / Tally / etc.** | Nicer UX than bare Google Forms | Same spam/cost considerations as any hosted form |

**Practical default for you right now:** one **Google Form** (or one Discussions thread) for **all eight roles**, with a required **“Which role(s)?”** short answer or checkbox list. Set that form’s URL as **`COMMUNITY_JOB_APPLY_DEFAULT_URL`** in `COMMUNITY-HUB.html` so every row’s APPLY works without duplicating the link in JSON eight times. Use **`apply_url` on a single row** only when one role needs a different destination (e.g. design portfolio upload elsewhere).

### What to require (vision + hybrid candidates)

Ask for **enough to decide**, not a dossier.

**Usually require:**

- **Name or handle** you can reply to  
- **Email** (or Discord/Telegram **only if** that’s your real review channel)  
- **Role(s)** they’re interested in (from your list)  
- **2–5 sentences**: why Coffee / this stack / what they’d like to try in the next ~90 days  
- **2–3 links**: portfolio, site, GitHub, or work samples (links > huge attachments early on)  
- **Rough availability**: hours/week, timezone  
- **One line** acknowledging they’ve read that **Community Edition is feature-frozen** and that exciting work may live in **α / modules / forks** per [`COMMUNITY-ARC.md`](../COMMUNITY-ARC.md) (copy-paste OK)

**Optional but useful:**

- **Conflict of interest** (employer, overlapping OSS duties)  
- **Compensation expectation** (“unpaid ok”, “need stipend”, ballpark)—reduces mismatched calls

**Avoid** collecting data you don’t need (full address, ID, etc.). If EU applicants matter, keep privacy policy / retention in mind for the form provider.

---

## 1. Ground rules from the repo itself

### Community Edition (`COFFEE-COMMUNITY/`) is feature-frozen

Per **`SOURCE-STATUS.md`**, **Coffee Community Edition** (shells, homescreen, Desk Mode, CCE packager/validator, flagship α HTML, curated registries) is **feature-frozen** as of March 2026.

| Frozen does mean | Frozen does *not* mean |
|------------------|------------------------|
| **Maintenance** is still appropriate: broken URLs, security patches, doc typos, small fixes | An open-ended mandate to ship big new CE “products” in-tree without an explicit **un-freeze** or fork |
| Treat the CE slice as a **stable baseline** / reference | That every `COFFEE-*` library elsewhere is frozen (standalone modules and demos may still evolve in other contexts) |

**Implication for job posts:** roles that touch `COFFEE-COMMUNITY/` should be framed as **maintenance and hygiene**, not a roadmap for major new CE features—unless you state clearly that work targets a **fork**, **Pro line**, or a **new edition** (see [`COMMUNITY-ARC.md`](../COMMUNITY-ARC.md)).

### Individual `COFFEE-*` packages can still evolve

The monorepo has many **top-level `COFFEE-*` directories**. Maintainer/steward roles there can include **features, demos, and docs**—as long as you do not assume Community **launchers** will track every change unless someone updates JSON registries.

---

## 2. Maintainer-style roles (reference — especially when scaling)

These match how the project is described in **`COMMUNITY-STATUS.md`** and related docs. Use them when you need to **backfill**, **split ownership**, or **advertise steward positions**—not necessarily as the primary ask while you are still carrying day-to-day hygiene yourself.

They are **not** generic “C++/Go SDK” placeholders unless you actually maintain those things here.

1. **CCE / tooling maintainer** — Own or co-own **[`CCE-SPEC.md`](../CCE-SPEC.md)**, [`tools/`](../tools/) (`cce-validate.js`, packager, etc.), and clarity around the **`.cce`** format and validator allowlist. Work: spec accuracy, edge-case fixes, documenting allowed APIs.

2. **Docs & onboarding maintainer** — Root [`README.md`](../../README.md), [`COMMUNITY-STATUS.md`](../../COMMUNITY-STATUS.md), Hub copy, per-module READMEs. Work: “how to clone and serve locally,” “how to add an app to a registry,” consistent links.

3. **Community Hub / registries maintainer** — This folder: [`COMMUNITY-HUB.html`](./COMMUNITY-HUB.html), [`community-hub-apps.json`](./community-hub-apps.json), [`community-jobs.json`](./community-jobs.json). Work: accurate flagship links, jobs copy that matches reality, small UX/security fixes.

4. **Shell & launcher hygiene** — Homescreen, shell, Desk Mode, store POC: paths that break when served from different roots, `fetch`/JSON issues, accessibility passes. Frame as **maintenance** under the CE freeze.

5. **Module steward (pick one or two areas)** — Examples from the stack: **COFFEE-PLAY + DUCK IDE**, **COFFEE-NOSTR + Ghost/Connect-style apps**, **COFFEE-UI**, **COFFEE-GRAPH**, **shader triad** (Shadow / Shade / Shader), etc. Work: triage, small fixes, keep demos and README in sync with **`COMMUNITY-STATUS.md`**.

6. **Community / comms (often volunteer)** — Welcoming newcomers, pointing to **good first issues**, moderating discussion channels if you add them, helping write a root **`CONTRIBUTING.md`** when you are ready.

---

## 3. If you are new to open source — keep listings credible

- **Describe real work** — Mention concrete areas (paths, modules, filenames patterns) and skills that match (**JavaScript**, **HTML**, **Nostr/CCE basics**, etc.). Avoid fictional stacks that are not in this tree unless you explicitly run them elsewhere.

- **Say how people apply** — e.g. GitHub Discussions, email, or “open a PR that fixes X.” An “APPLY” button in the Hub is only useful if it goes somewhere real (issue template, form, or docs).

- **Time and compensation** — State approximate **hours per week** and whether the role is **volunteer**, **expenses**, or a **real stipend** with a defined process. Listing large crypto stipends without a verifiable payout path **damages trust**.

- **Freeze honesty** — For `COFFEE-COMMUNITY/`, state that work is **maintenance-first** unless the edition is explicitly un-frozen or the role is for a fork.

- **Privacy expectations** — Public relay + hashtag rooms (e.g. Ghost/Connect-style flows) are **not** private by prefix alone; do not advertise “private guild” from tag choice only. See product docs or security notes if you add encryption/private relays later.

---

## 4. Discord-like browser chat (context for contributors)

Some flagship/experimental pages offer a **channel + relay** style experience in the browser. That can feel “Discord-ish” for **small, informal, public-ish** communities: sidebar rooms, links, mobile-friendly drawers where implemented.

It is **not** a full substitute for Discord’s roles, moderation tooling, voice, threads, search, and centralized reliability—**relays** and **event history** behave differently from a single company’s chat backend. Set contributor and user expectations accordingly in docs and job posts.

---

## 5. Related files

| File | Role |
|------|------|
| [`community-jobs.json`](./community-jobs.json) | Rows rendered on the Hub “Open positions” section — should match this guidance. |
| [`SOURCE-STATUS.md`](../../SOURCE-STATUS.md) | Edition freeze, entrypoints, doc index. |
| [`COMMUNITY-STATUS.md`](../../COMMUNITY-STATUS.md) | Module inventory, shell/store status, gaps. |
| [`COMMUNITY-ARC.md`](../COMMUNITY-ARC.md) | CE vs Pro / discovery philosophy. |
| [`CCE-SPEC.md`](../CCE-SPEC.md) | `.cce` format and validator expectations. |

---

*Vision + hybrid titles are documented above and in `community-jobs.json`. Update stipend rows when you have a real compensation or application URL process.*
