/**
 * coffee.install — Persist validated Community apps to coffee.drive + manifest index.
 * Shells merge manifest into the grid; apps open via installed-app-loader.html?id=...
 *
 * Load order: coffee-control.js → coffee-drive.js → coffee-install.js
 * Optional: cce-validate.js (required if install({ validate: true }))
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var DRIVE_NAME = 'community-install';
  var MANIFEST_ID = 'coffee-install-manifest';

  function getDrive() {
    if (!coffee.drive) {
      console.warn('coffee.install: load coffee-drive.js first');
      return null;
    }
    return coffee.drive(DRIVE_NAME);
  }

  function newStorageId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return 'capp-' + crypto.randomUUID();
    }
    return 'capp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  async function readManifest(drive) {
    var m = await drive.load(MANIFEST_ID);
    if (m && Array.isArray(m.entries)) return m;
    return { id: MANIFEST_ID, entries: [] };
  }

  async function writeManifest(drive, entries) {
    await drive.save({ id: MANIFEST_ID, entries: entries });
  }

  /**
   * @param {object} opts
   * @param {string} opts.html — full HTML document or fragment to run in loader
   * @param {boolean} [opts.validate=true] — run window.cceValidate.validateHtml
   * @param {object} [opts.metadata] — override { name, id, icon, color, description } after validate
   * @param {object} [opts.source] — provenance e.g. { type: 'github', url }
   * @returns {Promise<{ ok: boolean, app?: object, errors?: string[] }>}
   */
  async function install(opts) {
    var html = opts && opts.html;
    if (!html || typeof html !== 'string') {
      return { ok: false, errors: ['install: html string required'] };
    }
    var drive = getDrive();
    if (!drive) return { ok: false, errors: ['coffee.drive not available'] };

    var validate = opts.validate !== false;
    var meta = null;
    if (validate) {
      if (!window.cceValidate || typeof window.cceValidate.validateHtml !== 'function') {
        return { ok: false, errors: ['cceValidate not loaded'] };
      }
      var vr = window.cceValidate.validateHtml(html);
      if (!vr.valid) return { ok: false, errors: vr.errors };
      meta = vr.metadata;
    }
    if (opts.metadata && typeof opts.metadata === 'object') {
      meta = Object.assign({}, meta || {}, opts.metadata);
    }
    if (!meta || !meta.name || !meta.id) {
      return {
        ok: false,
        errors: [
          'Missing app metadata (name + id). Pass metadata or validate HTML with cce: meta / data-cce-config.'
        ]
      };
    }

    var storageId = newStorageId();
    var source = opts.source && typeof opts.source === 'object' ? opts.source : {};

    await drive.save({
      id: storageId,
      kind: 'installed-html',
      html: html,
      installedAt: Date.now(),
      source: source,
      metaSlug: String(meta.id).replace(/[^a-z0-9-]/gi, '').slice(0, 64) || 'app'
    });

    var manifest = await readManifest(drive);
    var entry = {
      storageId: storageId,
      name: String(meta.name).trim(),
      icon: meta.icon || '📦',
      color: /^#[0-9a-fA-F]{6}$/.test(meta.color || '') ? meta.color : '#64748b',
      description: (meta.description && String(meta.description)) || ''
    };
    manifest.entries.push(entry);
    await writeManifest(drive, manifest.entries);

    return {
      ok: true,
      app: {
        id: storageId,
        name: entry.name,
        icon: entry.icon,
        color: entry.color,
        description: entry.description,
        storageId: storageId,
        installed: true
      }
    };
  }

  /** @returns {Promise<Array<{ storageId, name, icon, color, description }>>} */
  async function listEntries() {
    var drive = getDrive();
    if (!drive) return [];
    var manifest = await readManifest(drive);
    return manifest.entries.slice();
  }

  /**
   * Build grid app objects for the Community shell iframe layer.
   * @param {string} loaderPath — path to installed-app-loader.html from current document (e.g. './apps/installed-app-loader.html')
   */
  async function listInstalledForGrid(loaderPath) {
    var base = loaderPath || './apps/installed-app-loader.html';
    var entries = await listEntries();
    return entries.map(function (en) {
      var q = base.indexOf('?') >= 0 ? '&' : '?';
      return {
        id: en.storageId,
        name: en.name,
        icon: en.icon,
        color: en.color,
        description: en.description || '',
        url: base + q + 'id=' + encodeURIComponent(en.storageId),
        installed: true
      };
    });
  }

  /**
   * Curated list first, then installed (same-origin loader URLs).
   */
  async function mergeGridApps(curatedApps, loaderPath) {
    var a = Array.isArray(curatedApps) ? curatedApps.slice() : [];
    var installed = await listInstalledForGrid(loaderPath);
    return a.concat(installed);
  }

  async function uninstall(storageId) {
    if (!storageId) return { ok: false, errors: ['storageId required'] };
    var drive = getDrive();
    if (!drive) return { ok: false, errors: ['coffee.drive not available'] };
    await drive.remove(storageId);
    var manifest = await readManifest(drive);
    var next = manifest.entries.filter(function (e) {
      return e.storageId !== storageId;
    });
    await writeManifest(drive, next);
    return { ok: true };
  }

  function notifyParentInstallChanged() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'communityInstallChanged' }, '*');
      }
    } catch (_) {}
  }

  coffee.install = {
    DRIVE_NAME: DRIVE_NAME,
    MANIFEST_ID: MANIFEST_ID,
    install: install,
    listEntries: listEntries,
    listInstalledForGrid: listInstalledForGrid,
    mergeGridApps: mergeGridApps,
    uninstall: uninstall,
    notifyParentInstallChanged: notifyParentInstallChanged
  };

  window.coffee = coffee;
})();
