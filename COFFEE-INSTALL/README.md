# COFFEE-INSTALL (`coffee.install`)

Persists **CCE-valid** (or caller-validated) HTML apps to **`coffee.drive('community-install')`** and a small **manifest** so Community shells can merge **installed** tiles with curated JSON.

## Load order

```html
<script src="…/coffee-control.js"></script>
<script src="…/coffee-drive.js"></script>
<script src="…/coffee-install.js"></script>
<!-- optional for validate:true -->
<script src="…/cce-validate.js"></script>
```

## API

| Method | Description |
|--------|-------------|
| **`install({ html, validate?, metadata?, source? })`** | Saves HTML + manifest row. Default **`validate: true`** uses `cceValidate.validateHtml`. Needs **metadata** (`name`, `id`, …) from HTML or **`opts.metadata`**. |
| **`listEntries()`** | Manifest rows `{ storageId, name, icon, color, description }`. |
| **`listInstalledForGrid(loaderPath)`** | Grid-shaped `{ id, name, icon, color, url, installed }`. |
| **`mergeGridApps(curatedApps, loaderPath)`** | `curated.concat(installed)`. |
| **`uninstall(storageId)`** | Remove payload + manifest entry. |
| **`notifyParentInstallChanged()`** | `postMessage({ type: 'communityInstallChanged' })` for shell refresh. |

## Loader

**`COFFEE-COMMUNITY/apps/installed-app-loader.html?id=<storageId>`** loads the HTML from Drive into the document (same origin as shell).

Shells must pass the correct **`loaderPath`** for their folder:

- **`coffee-community-shell.html`** → `./apps/installed-app-loader.html`
- **`COMMUNITY-HOMESCREEN/coffee-community-homescreen.html`** → `../apps/installed-app-loader.html`

## Store POC

**`apps/store.html`** — after upload / GitHub validation, calls **`coffee.install.install({ html, validate: false, metadata, source })`** then notifies parent.
