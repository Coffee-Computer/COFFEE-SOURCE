/**
 * FLOW.* — pipeline / observability (CASH core v0)
 */
export default function registerFlow(core) {
  core.registerHandlers({
    'FLOW.LOG': async function (ctx, p) {
      var msg = (p && p.message != null) ? String(p.message) : '';
      var level = (p && p.level) ? String(p.level) : 'info';
      if (ctx && typeof ctx.print === 'function') {
        ctx.print('[FLOW.' + level.toUpperCase() + '] ' + msg, 'muted-text');
      }
      return { logged: true };
    },
    'FLOW.WAIT_MS': async function (ctx, p) {
      var ms = Number(p && p.ms);
      if (!Number.isFinite(ms) || ms < 0) ms = 0;
      await new Promise(function (r) {
        setTimeout(r, Math.min(ms, 60000));
      });
      return { waited: ms };
    },
    'FLOW.ABORT': async function (ctx, p) {
      var reason = (p && p.reason) ? String(p.reason) : 'aborted';
      if (ctx && typeof ctx.print === 'function') ctx.print('[FLOW.ABORT] ' + reason, 'error-text');
      return { aborted: true, reason: reason };
    }
  });
}
