/**
 * IO.* — canonical file-like verbs over an injectable store.
 *
 * Default backend: ctx.session.vfs (plain object, RAM only). Use this when CASH is a
 * "comms / orchestration" layer and you are not persisting blobs yet.
 *
 * Persisted siblings (swap in cash-domains*.json — load only one IO module):
 *   cash-io-drive.js   — coffee.drive (IndexedDB), default manifest
 *   cash-io-control.js — coffee.save/load (localStorage)
 */
export default function registerIO(core) {
  core.registerHandlers({
    'IO.READ_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = (ctx && ctx.session && ctx.session.vfs) || {};
      if (!(path in vfs)) {
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO] no such file: ' + path, 'error-text');
        return { ok: false, error: 'not found' };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print(String(vfs[path]), '');
      return { ok: true, bytes: String(vfs[path]).length };
    },
    'IO.WRITE_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      var content = p && p.content != null ? String(p.content) : '';
      var mode = (p && p.mode) || 'overwrite';
      if (!path) return { ok: false, error: 'missing path' };
      if (!ctx.session) ctx.session = {};
      if (!ctx.session.vfs) ctx.session.vfs = Object.create(null);
      if (mode === 'append' && path in ctx.session.vfs) {
        ctx.session.vfs[path] += content;
      } else {
        ctx.session.vfs[path] = content;
      }
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO] wrote ' + path + ' (' + mode + ')', 'success-text');
      return { ok: true, path: path };
    },
    'IO.LIST_DIR': async function (ctx, p) {
      var prefix = p && p.path != null ? String(p.path) : '';
      var vfs = (ctx && ctx.session && ctx.session.vfs) || {};
      var keys = Object.keys(vfs).filter(function (k) {
        return !prefix || k === prefix || k.indexOf(prefix + '/') === 0 || k.indexOf(prefix) === 0;
      });
      if (ctx && typeof ctx.print === 'function') {
        ctx.print(keys.length ? keys.join('  ') : '(empty vfs)', 'dir-text');
      }
      return { ok: true, entries: keys };
    },
    'IO.MKDIR': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      if (!ctx.session) ctx.session = {};
      if (!ctx.session.vfs) ctx.session.vfs = Object.create(null);
      var key = path.replace(/\/$/, '') + '/';
      ctx.session.vfs[key] = '';
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO] mkdir ' + key, 'success-text');
      return { ok: true, path: key };
    },
    'IO.DELETE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = (ctx && ctx.session && ctx.session.vfs) || {};
      if (path in vfs) {
        delete vfs[path];
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO] deleted ' + path, 'success-text');
        return { ok: true };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO] not found: ' + path, 'error-text');
      return { ok: false };
    }
  });
}
