# COFFEE-GIT (`coffee.git`)

Thin **public** fetch helpers for **GitHub-shaped** sources. **No token** — only URLs that work anonymously (`raw.githubusercontent.com`, or `github.com/.../blob/...` converted to raw).

## Load order

```
coffee-control.js → coffee-git.js
```

## API

| Method | Description |
|--------|-------------|
| **`parseSpec(input)`** | Parse `owner/repo`, `owner/repo/path/to.html`, full **raw** or **blob** URL → spec or `{ error }`. |
| **`buildRawUrl(owner, repo, ref, path)`** | Build raw URL string. |
| **`fetchUrl(url)`** | `fetch` GET → `{ ok, status, text, url, error }`. |
| **`fetchFromInput(input)`** | `parseSpec` + fetch. For `owner/repo` tries **`main`** then **`master`**, default file **`index.html`**. |
| **`githubBlobToRaw(url)`** | Convert `github.com/user/repo/blob/ref/path` → raw URL or `null`. |

## CCE

Pass `result.text` to **`window.cceValidate.validateHtml(text)`** before treating as installable.

## POC

**`COFFEE-COMMUNITY/apps/store.html`** — “Add from GitHub” uses `fetchFromInput` + validator.
