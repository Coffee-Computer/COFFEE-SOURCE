# Coffee Tools

## ⚠️ IMPORTANT FOR AI / BUILDERS

**Validation is STRICT.** Only approved Coffee APIs pass. Do NOT relax to a generic `coffee.*` check. Keep the curated list in `cce-validate.js` **and** the same alternation in `cce-packager.js`. See CCE-SPEC.md "CRITICAL: Strict Validation" section. When adding **Coffee Control** methods (e.g. `streamSpectrum`, `microphone`, `record`), extend both files plus the CCE-SPEC bullet list.

---

## cce-packager.js

Package a Coffee-stack app into a `.cce` file.

```bash
node cce-packager.js ../apps/notes-cce
# → notes-cce.cce
```

Requires `zip` (macOS/Linux have it by default).

## cce-check.js

Live validation of a folder, .html, .zip, or .cce file. No packaging.

```bash
node cce-check.js ../apps/notes-cce    # ✓ Valid
node cce-check.js ../apps/tailwind-test # ❌ Rejected (Tailwind)
node cce-check.js ../apps/notes-cce.cce # ✓ Valid (extracts zip first)
```

Requires `unzip` (macOS/Linux have it by default).

## cce-validate.js

Shared validation logic. Used by packager, cce-check, and the Store upload.

---

## Validation verified

- **notes-cce** — ✓ Valid (Coffee UI + Control, manifest)
- **notes.html** — ✓ Valid (Coffee UI + Control, inline meta tags)
- **notes-json-config.html** — ✓ Valid (Coffee UI + Control, `data-cce-config` JSON)
- **tailwind-test** — ❌ Rejected (Tailwind, no Coffee stack, no metadata)
- **Raw HTML (no metadata)** — ❌ Rejected (No metadata found)

**Implementation working:** Single HTML requires inline metadata. Raw HTML without meta tags or `data-cce-config` is rejected. Same validation runs in the Store upload button.
