/**
 * IO.* — flat VFS persisted via coffee.save / coffee.load (localStorage, ~5MB cap).
 * Same verbs as cash-io.js; swap module in cash-domains.json (only one IO module).
 *
 * ctx.cashIoControlKey — optional save key without coffee_ prefix (default: cash_io_vfs)
 */
function controlKey(ctx) {
  return (ctx && ctx.cashIoControlKey) || 'cash_io_vfs';
}

function ensureVfs(ctx) {
  if (!ctx.session) ctx.session = {};
  if (ctx.session._cashIoControlHydrated) return ctx.session.vfs;
  var key = controlKey(ctx);
  var loaded = null;
  try {
    if (typeof window !== 'undefined' && window.coffee && typeof window.coffee.load === 'function') {
      loaded = window.coffee.load(key);
    }
  } catch (e) {}
  var vfs =
    loaded && typeof loaded === 'object' && !Array.isArray(loaded)
      ? Object.assign(Object.create(null), loaded)
      : Object.create(null);
  ctx.session.vfs = vfs;
  ctx.session._cashIoControlHydrated = true;
  return vfs;
}

function persistVfs(ctx) {
  try {
    if (typeof window !== 'undefined' && window.coffee && typeof window.coffee.save === 'function') {
      window.coffee.save(controlKey(ctx), ctx.session.vfs);
    }
  } catch (e) {}
}

export default function registerIOControl(core) {
  core.registerHandlers({
    'IO.READ_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = ensureVfs(ctx);
      if (!(path in vfs)) {
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO/control] no such file: ' + path, 'error-text');
        return { ok: false, error: 'not found' };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print(String(vfs[path]), '');
      return { ok: true, bytes: String(vfs[path]).length, backend: 'control' };
    },
    'IO.WRITE_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      var content = p && p.content != null ? String(p.content) : '';
      var mode = (p && p.mode) || 'overwrite';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = ensureVfs(ctx);
      if (mode === 'append' && path in vfs) {
        vfs[path] += content;
      } else {
        vfs[path] = content;
      }
      persistVfs(ctx);
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/control] wrote ' + path + ' (' + mode + ')', 'success-text');
      return { ok: true, path: path, backend: 'control' };
    },
    'IO.LIST_DIR': async function (ctx, p) {
      var prefix = p && p.path != null ? String(p.path) : '';
      var vfs = ensureVfs(ctx);
      var keys = Object.keys(vfs).filter(function (k) {
        return !prefix || k === prefix || k.indexOf(prefix + '/') === 0 || k.indexOf(prefix) === 0;
      });
      if (ctx && typeof ctx.print === 'function') {
        ctx.print(keys.length ? keys.join('  ') : '(empty vfs)', 'dir-text');
      }
      return { ok: true, entries: keys, backend: 'control' };
    },
    'IO.MKDIR': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = ensureVfs(ctx);
      var key = path.replace(/\/$/, '') + '/';
      vfs[key] = '';
      persistVfs(ctx);
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/control] mkdir ' + key, 'success-text');
      return { ok: true, path: key, backend: 'control' };
    },
    'IO.DELETE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = ensureVfs(ctx);
      if (path in vfs) {
        delete vfs[path];
        persistVfs(ctx);
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO/control] deleted ' + path, 'success-text');
        return { ok: true, backend: 'control' };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/control] not found: ' + path, 'error-text');
      return { ok: false };
    }
  });
}
