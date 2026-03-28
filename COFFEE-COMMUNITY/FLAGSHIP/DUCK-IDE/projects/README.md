# DUCK IDE · `projects/`

- **`duck-templates.json`** — list of **game** templates from **`COFFEE-PLAY/TEMPLATES/*/`** (the `*.html` shells, not `*POC*` files). DUCK IDE fetches this manifest and resolves each **`file`** against **`COFFEE-SOURCE`** (same root as `COFFEE-DOT/`, `COFFEE-PLAY/`, …), e.g. `COFFEE-PLAY/TEMPLATES/CIRCLE-DUDE/CIRCLE-DUDE.html`.

To add a new template after you ship one under `TEMPLATES/`, append an entry with a unique `id`, `title`, optional `subtitle`, and **`file`** as a path relative to **`COFFEE-SOURCE`**.
