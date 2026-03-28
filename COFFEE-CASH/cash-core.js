/**
 * CASH core — canonical { action, params } dispatch.
 * Load domain handlers via cash-domains.json + dynamic import().
 *
 * Browser: serve COFFEE-SOURCE (or this folder) over HTTP; ES modules + fetch fail on file://.
 */
const handlers = Object.create(null);

export function registerHandlers(map) {
  if (!map || typeof map !== 'object') return;
  Object.keys(map).forEach(function (k) {
    handlers[k] = map[k];
  });
}

export function listActions() {
  return Object.keys(handlers).sort();
}

/**
 * @param {URL|string} baseUrl - folder containing manifest (trailing slash optional)
 * @param {{ manifest?: string }} [opts] - default `cash-domains.json`; use `cash-domains.control.json` / `cash-domains.memory.json` to swap IO backend
 */
export async function initCash(baseUrl, opts) {
  opts = opts || {};
  var manifestFile = opts.manifest || 'cash-domains.json';
  var base = typeof baseUrl === 'string' ? new URL(baseUrl, window.location.href) : baseUrl;
  var href = base.href;
  if (!href.endsWith('/')) base = new URL('./', base);

  const res = await fetch(new URL(manifestFile, base));
  if (!res.ok) throw new Error(manifestFile + ': ' + res.status);
  const manifest = await res.json();
  const domains = manifest.domains || [];

  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    const rel = (d.module || '').replace(/^\.\//, '');
    const modUrl = new URL(rel, base);
    const mod = await import(modUrl.href);
    const reg = mod.default;
    if (typeof reg === 'function') {
      reg({ registerHandlers });
    }
  }

  registerHandlers({
    'CASH.VERSION': async function () {
      return { version: manifest.version || 1, domains: domains.map(function (x) { return x.prefix; }) };
    },
    'CASH.LIST': async function () {
      return { actions: listActions() };
    }
  });
}

/**
 * @param {string|object} cmd - JSON string or { action, params }
 * @param {object} ctx - passed to every handler (print, session, …)
 */
export async function execute(cmd, ctx) {
  var step = typeof cmd === 'string' ? JSON.parse(cmd) : cmd;
  if (!step || typeof step.action !== 'string') {
    return { ok: false, error: 'Invalid CASH step: need { "action": "DOMAIN.VERB", "params": {} }' };
  }
  var fn = handlers[step.action];
  if (typeof fn !== 'function') {
    return { ok: false, error: 'Unknown action: ' + step.action };
  }
  try {
    var out = await Promise.resolve(fn(ctx, step.params || {}));
    return { ok: true, result: out };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}
