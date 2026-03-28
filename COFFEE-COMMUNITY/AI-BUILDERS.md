# AI / Builders: Coffee Community Edition

**When building Coffee apps or modifying cce-check, cce-validate, or the packager:**

## ⚠️ CRITICAL: Strict Validation

Validation is **intentionally strict**. Do NOT relax it.

1. **Only approved Coffee APIs pass.** The validator uses a curated list: `button`, `textarea`, `input`, `slider`, `select`, `label`, `link`, `text`, `para`, `spinner`, `msg`, `card`, `heading`, `row`, `col`, `stack`, `appShell`, `container`, `injectTheme`, `camera`, `save`, `load`, `list`, `storageQuota`, `theme`, `graph`, `chatInput`, `chatBubble`, `connect`, `chat`, `drive`, `imageToBlob`, `toast`, `request`, `modal`, `dialog`, `form`, `table`, `scene3d`, `scene2d`, `animate`, `draw`, `synth`, `fuzz`, `nebula`, `brick`.

2. **Do NOT change to a generic `coffee.*` check.** Lax validation would allow dangerous/custom code. Community targets basic users; keep the surface safe.

3. **New APIs:** When the Coffee stack grows, add methods explicitly to the regex in `cce-validate.js`. Do not use a catch-all pattern.

4. **Building apps:** Use only the known Coffee UI/Control APIs. Do not invent `coffee.customThing` — it will fail validation.

**Lax validation (e.g. after forking):** Use at your own risk. The Coffee team does not ship malicious code, but we cannot speak for forks or third parties. Relaxing validation removes the safety guardrail.

See `CCE-SPEC.md` and `tools/README.md` for full details.
