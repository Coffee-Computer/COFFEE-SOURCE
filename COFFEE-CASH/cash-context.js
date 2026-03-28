/**
 * cash-context — host wiring for **CASH.SET_IO_CONTEXT** (IO backend / manifest switch).
 *
 * Keeps **cash-core** free of URL/UI concerns. The host passes `ctx`, `initCash`,
 * `registerHandlers`, and optional hooks (e.g. refresh after a switch).
 *
 * **cash-cli** emits `io drive|control|memory` → `{ action: 'CASH.SET_IO_CONTEXT', params: { mode } }`.
 *
 * @module cash-context
 */

/** Default: mode id → manifest filename (resolved from `baseCashUrl` in `initCash`). */
export const DEFAULT_MANIFEST_BY_MODE = {
  drive: 'cash-domains.json',
  control: 'cash-domains.control.json',
  memory: 'cash-domains.memory.json'
};

/**
 * Map `?io=` query value to a mode id.
 * @param {string|null|undefined} ioParam
 * @returns {'drive'|'control'|'memory'}
 */
export function ioParamToMode(ioParam) {
  const p = (ioParam == null ? '' : String(ioParam)).toLowerCase().trim();
  if (p === 'control' || p === 'memory') return p;
  return 'drive';
}

function normalizeMode(mode, manifestByMode) {
  const m = String(mode || '').toLowerCase();
  if (!manifestByMode[m]) {
    throw new Error('Unknown IO mode: ' + mode);
  }
  return m;
}

/**
 * @typedef {object} AttachCashIoContextOptions
 * @property {function(object): void} registerHandlers - from `cash-core`
 * @property {function(URL|string, object=): Promise<void>} initCash - from `cash-core`
 * @property {URL|string} baseCashUrl - folder containing manifests
 * @property {object} ctx - CASH ctx (mutated: `session` on switch)
 * @property {'drive'|'control'|'memory'} initialMode
 * @property {Record<string,string>} [manifestByMode] - override / extend default map
 * @property {() => void} [onAfterSwitch] - e.g. host refresh hook
 */

/**
 * Registers **`CASH.SET_IO_CONTEXT`** and returns helpers for the host.
 *
 * @param {AttachCashIoContextOptions} opts
 */
export function attachCashIoContext(opts) {
  const registerHandlersFn = opts.registerHandlers;
  const initCash = opts.initCash;
  const baseCashUrl = opts.baseCashUrl;
  const ctx = opts.ctx;
  const manifestByMode = Object.assign({}, DEFAULT_MANIFEST_BY_MODE, opts.manifestByMode || {});
  let currentIoMode = normalizeMode(opts.initialMode, manifestByMode);
  const onAfterSwitch = typeof opts.onAfterSwitch === 'function' ? opts.onAfterSwitch : function () {};

  async function applyIoMode(mode) {
    const m = normalizeMode(mode, manifestByMode);
    const manifest = manifestByMode[m];
    ctx.session = { vfs: {} };
    await initCash(baseCashUrl, { manifest: manifest });
    currentIoMode = m;
    if (typeof window !== 'undefined') {
      window.__cashIoMode = m;
    }
    onAfterSwitch();
    return {
      ok: true,
      mode: m,
      manifest: manifest
    };
  }

  registerHandlersFn({
    'CASH.SET_IO_CONTEXT': async function (_ctx, params) {
      if (params && params.query) {
        return {
          ok: true,
          current: currentIoMode,
          manifest: manifestByMode[currentIoMode]
        };
      }
      if (!params || params.mode == null || String(params.mode).trim() === '') {
        return { ok: false, error: 'CASH.SET_IO_CONTEXT needs params.mode (drive|control|memory)' };
      }
      return applyIoMode(params.mode);
    }
  });

  if (typeof window !== 'undefined') {
    window.__cashIoMode = currentIoMode;
  }

  return {
    getCurrentMode: function () {
      return currentIoMode;
    },
    applyIoMode: applyIoMode,
    getManifestNameForMode: function (mode) {
      return manifestByMode[normalizeMode(mode, manifestByMode)];
    },
    getManifestForCurrentMode: function () {
      return manifestByMode[currentIoMode];
    },
    manifestByMode: manifestByMode
  };
}
