/**
 * Coffee.Terminal — COFFEE-POSIX + COFFEE-CASH (CE). Load before deferred coffee-terminal-alpha.js.
 */
import { createPathSession, parsePosixLine, intentToCashStep } from '../COFFEE-POSIX/coffee-posix.js';
import { initCash, execute, registerHandlers } from '../COFFEE-CASH/cash-core.js';
import { parseCashCliLine, isCashCliLine, CASH_CLI_HELP } from '../COFFEE-CASH/cash-cli.js';
import { attachCashIoContext, ioParamToMode } from '../COFFEE-CASH/cash-context.js';

const baseCashUrl = new URL('../COFFEE-CASH/', import.meta.url);

function termPrint(msg, type) {
  type = type || 'sys';
  var el = document.getElementById('output-stream');
  if (!el) return;
  var div = document.createElement('div');
  div.className = 'ct-log';
  div.innerHTML =
    '<span class="ct-tag-' +
    type +
    '">[' +
    String(type).toUpperCase() +
    ']</span> ' +
    msg;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

const qp = new URLSearchParams(window.location.search);
const ioParam = qp.get('io');
const currentIoMode = ioParamToMode(ioParam);

const cashCtx = {
  print: function (msg, cls) {
    termPrint(msg, cls || 'info');
  },
  session: { vfs: {} }
};

const ioContext = attachCashIoContext({
  registerHandlers: registerHandlers,
  initCash: initCash,
  baseCashUrl: baseCashUrl,
  ctx: cashCtx,
  initialMode: currentIoMode,
  onAfterSwitch: function () {}
});

const manifestName = ioContext.getManifestForCurrentMode();
const pathSession = createPathSession({ initialCwd: '' });

var cashExecuteFn = execute;
try {
  await initCash(baseCashUrl, { manifest: manifestName });
  termPrint(
    '<span class="ct-tag-success">[CASH]</span> ready — <code style="color:#a8a29e">' +
      manifestName +
      '</code> · IO: <code style="color:#a8a29e">' +
      currentIoMode +
      '</code>',
    'sys'
  );
} catch (err) {
  termPrint(
    '<span class="ct-tag-error">[CASH]</span> init failed: ' +
      (err && err.message ? err.message : String(err)) +
      ' — serve <code style="color:#a8a29e">COFFEE-SOURCE</code> over HTTP (not file://).',
    'error'
  );
  cashExecuteFn = async function () {
    return { ok: false, error: 'CASH not initialized' };
  };
}

window.__coffeeTerminal = {
  pathSession: pathSession,
  cashExecute: cashExecuteFn,
  cashCtx: cashCtx,
  parsePosixLine: parsePosixLine,
  parseCashCliLine: parseCashCliLine,
  isCashCliLine: isCashCliLine,
  intentToCashStep: intentToCashStep,
  cliHelpText: Array.isArray(CASH_CLI_HELP) ? CASH_CLI_HELP.join('\n') : String(CASH_CLI_HELP || '')
};

window.coffee = window.coffee || {};
window.coffee.cash = Object.assign(window.coffee.cash || {}, {
  execute: cashExecuteFn,
  ctx: cashCtx,
  parseLine: parseCashCliLine,
  isCliLine: isCashCliLine
});

document.dispatchEvent(
  new CustomEvent('coffee-terminal:runtime-ready', {
    detail: window.__coffeeTerminal
  })
);
