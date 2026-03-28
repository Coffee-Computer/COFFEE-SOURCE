/**
 * IO.* — flat VFS persisted via coffee.drive (IndexedDB), one document { id, vfs }.
 * Same verbs as cash-io.js; swap module in cash-domains.json (only one IO module).
 *
 * Load coffee-drive.js before cash-core. Requires window.coffee.drive.
 *
 * ctx.cashIoDriveId     — app id (default: coffee-cash-io)
 * ctx.cashIoVfsRecordId — drive row id (default: cash_io_vfs)
 */
function driveOpts(ctx) {
  return {
    driveId: (ctx && ctx.cashIoDriveId) || 'coffee-cash-io',
    vfsId: (ctx && ctx.cashIoVfsRecordId) || 'cash_io_vfs'
  };
}

async function ensureVfsDrive(ctx) {
  if (!ctx.session) ctx.session = {};
  if (ctx.session._cashIoDriveHydrated) return ctx.session.vfs;
  var o = driveOpts(ctx);
  var vfs = Object.create(null);
  if (typeof window !== 'undefined' && window.coffee && typeof window.coffee.drive === 'function') {
    var drive = window.coffee.drive(o.driveId);
    if (drive) {
      try {
        var row = await drive.load(o.vfsId);
        if (row && row.vfs && typeof row.vfs === 'object' && !Array.isArray(row.vfs)) {
          vfs = Object.assign(Object.create(null), row.vfs);
        }
      } catch (e) {}
    }
  }
  ctx.session.vfs = vfs;
  ctx.session._cashIoDriveHydrated = true;
  ctx.session._cashIoDriveMeta = { driveId: o.driveId, vfsId: o.vfsId };
  return vfs;
}

async function persistVfsDrive(ctx) {
  var m = ctx.session && ctx.session._cashIoDriveMeta;
  if (!m || typeof window === 'undefined' || !window.coffee || typeof window.coffee.drive !== 'function') return;
  var drive = window.coffee.drive(m.driveId);
  if (!drive) return;
  try {
    await drive.save({ id: m.vfsId, vfs: ctx.session.vfs });
  } catch (e) {}
}

export default function registerIODrive(core) {
  core.registerHandlers({
    'IO.READ_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = await ensureVfsDrive(ctx);
      if (!(path in vfs)) {
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO/drive] no such file: ' + path, 'error-text');
        return { ok: false, error: 'not found' };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print(String(vfs[path]), '');
      return { ok: true, bytes: String(vfs[path]).length, backend: 'drive' };
    },
    'IO.WRITE_FILE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      var content = p && p.content != null ? String(p.content) : '';
      var mode = (p && p.mode) || 'overwrite';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = await ensureVfsDrive(ctx);
      if (mode === 'append' && path in vfs) {
        vfs[path] += content;
      } else {
        vfs[path] = content;
      }
      await persistVfsDrive(ctx);
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/drive] wrote ' + path + ' (' + mode + ')', 'success-text');
      return { ok: true, path: path, backend: 'drive' };
    },
    'IO.LIST_DIR': async function (ctx, p) {
      var prefix = p && p.path != null ? String(p.path) : '';
      var vfs = await ensureVfsDrive(ctx);
      var keys = Object.keys(vfs).filter(function (k) {
        return !prefix || k === prefix || k.indexOf(prefix + '/') === 0 || k.indexOf(prefix) === 0;
      });
      if (ctx && typeof ctx.print === 'function') {
        ctx.print(keys.length ? keys.join('  ') : '(empty vfs)', 'dir-text');
      }
      return { ok: true, entries: keys, backend: 'drive' };
    },
    'IO.MKDIR': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = await ensureVfsDrive(ctx);
      var key = path.replace(/\/$/, '') + '/';
      vfs[key] = '';
      await persistVfsDrive(ctx);
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/drive] mkdir ' + key, 'success-text');
      return { ok: true, path: key, backend: 'drive' };
    },
    'IO.DELETE': async function (ctx, p) {
      var path = p && p.path != null ? String(p.path) : '';
      if (!path) return { ok: false, error: 'missing path' };
      var vfs = await ensureVfsDrive(ctx);
      if (path in vfs) {
        delete vfs[path];
        await persistVfsDrive(ctx);
        if (ctx && typeof ctx.print === 'function') ctx.print('[IO/drive] deleted ' + path, 'success-text');
        return { ok: true, backend: 'drive' };
      }
      if (ctx && typeof ctx.print === 'function') ctx.print('[IO/drive] not found: ' + path, 'error-text');
      return { ok: false };
    }
  });
}
