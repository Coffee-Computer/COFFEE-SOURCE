/**
 * cash-cli — human lines → canonical { action, params }. Sits on top of cash-core execute().
 * 1:1 with POC verbs (CASH.*, FLOW.*, IO.*). Terminals route lines starting with cash|flow|io here.
 *
 * Does not execute. Use: const r = parseCashCliLine(line); if (r.ok) await execute(r.step, ctx);
 */

/**
 * Split respecting "double quotes" and 'single quotes'.
 * @param {string} line
 * @returns {string[]}
 */
export function shellSplit(line) {
  const out = [];
  let cur = '';
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) {
        q = null;
        out.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    } else if (c === '"' || c === "'") {
      if (cur) {
        out.push(cur);
        cur = '';
      }
      q = c;
    } else if (/\s/.test(c)) {
      if (cur) {
        out.push(cur);
        cur = '';
      }
    } else {
      cur += c;
    }
  }
  if (cur || q) out.push(cur);
  return out.filter(Boolean);
}

/**
 * @param {string} raw
 * @returns {{ ok: true, step: { action: string, params: object } } | { ok: false, error: string, hint?: string }}
 */
export function parseCashCliLine(raw) {
  const line = typeof raw === 'string' ? raw.trim() : '';
  if (!line) return { ok: false, error: 'empty line' };

  const parts = shellSplit(line);
  const head = (parts[0] || '').toLowerCase();

  if (head === 'cash') {
    const sub = (parts[1] || '').toLowerCase();
    if (sub === 'list' || sub === 'ls') {
      return { ok: true, step: { action: 'CASH.LIST', params: {} } };
    }
    if (sub === 'version' || sub === 'ver') {
      return { ok: true, step: { action: 'CASH.VERSION', params: {} } };
    }
    if (sub === 'help' || sub === '') {
      return { ok: false, error: '', showCliHelp: true };
    }
    return {
      ok: false,
      error: 'unknown cash subcommand: ' + sub,
      hint: 'cash list | cash version'
    };
  }

  if (head === 'flow') {
    const sub = (parts[1] || '').toLowerCase();
    if (sub === 'log') {
      const rest = parts.slice(2);
      let level = 'info';
      let msgParts = rest;
      const li = rest.indexOf('--level');
      if (li >= 0 && rest[li + 1]) {
        level = String(rest[li + 1]).toLowerCase();
        msgParts = rest.slice(0, li);
      }
      const message = msgParts.join(' ').trim();
      if (!message) {
        return { ok: false, error: 'flow log: missing message', hint: 'flow log "your message" [--level info|warn|error]' };
      }
      return { ok: true, step: { action: 'FLOW.LOG', params: { message, level } } };
    }
    if (sub === 'wait' || sub === 'wait_ms') {
      const ms = parseInt(parts[2], 10);
      if (!Number.isFinite(ms) || ms < 0) {
        return { ok: false, error: 'flow wait: need non-negative integer ms', hint: 'flow wait 500' };
      }
      return { ok: true, step: { action: 'FLOW.WAIT_MS', params: { ms } } };
    }
    if (sub === 'abort') {
      const reason = parts.slice(2).join(' ').trim() || 'aborted';
      return { ok: true, step: { action: 'FLOW.ABORT', params: { reason } } };
    }
    return {
      ok: false,
      error: 'unknown flow subcommand: ' + sub,
      hint: 'flow log … | flow wait <ms> | flow abort [reason]'
    };
  }

  if (head === 'io') {
    const sub = (parts[1] || '').toLowerCase();
    /** Runtime IO context switch → CASH.SET_IO_CONTEXT (host registers handler; e.g. CASH1-POC) */
    if (sub === 'mode' || sub === 'status') {
      return { ok: true, step: { action: 'CASH.SET_IO_CONTEXT', params: { query: true } } };
    }
    if (sub === 'drive' || sub === 'control' || sub === 'memory') {
      if (parts.length > 2) {
        return {
          ok: false,
          error: 'io ' + sub + ': too many arguments',
          hint: 'io ' + sub
        };
      }
      return { ok: true, step: { action: 'CASH.SET_IO_CONTEXT', params: { mode: sub } } };
    }
    if (sub === 'read' || sub === 'cat') {
      const path = parts[2];
      if (!path) return { ok: false, error: 'io read: missing path', hint: 'io read notes.txt' };
      return { ok: true, step: { action: 'IO.READ_FILE', params: { path } } };
    }
    if (sub === 'write') {
      const path = parts[2];
      if (!path) return { ok: false, error: 'io write: missing path', hint: 'io write path "content here"' };
      const content = parts.slice(3).join(' ');
      return { ok: true, step: { action: 'IO.WRITE_FILE', params: { path, content, mode: 'overwrite' } } };
    }
    if (sub === 'append') {
      const path = parts[2];
      if (!path) return { ok: false, error: 'io append: missing path', hint: 'io append path more text' };
      const content = parts.slice(3).join(' ');
      return { ok: true, step: { action: 'IO.WRITE_FILE', params: { path, content, mode: 'append' } } };
    }
    if (sub === 'list' || sub === 'ls') {
      const path = parts[2] || '';
      return { ok: true, step: { action: 'IO.LIST_DIR', params: path ? { path } : {} } };
    }
    if (sub === 'mkdir') {
      const path = parts[2];
      if (!path) return { ok: false, error: 'io mkdir: missing path', hint: 'io mkdir tmp/' };
      return { ok: true, step: { action: 'IO.MKDIR', params: { path } } };
    }
    if (sub === 'delete' || sub === 'rm') {
      const path = parts[2];
      if (!path) return { ok: false, error: 'io delete: missing path', hint: 'io delete notes.txt' };
      return { ok: true, step: { action: 'IO.DELETE', params: { path } } };
    }
    return {
      ok: false,
      error: 'unknown io subcommand: ' + sub,
      hint: 'io drive|control|memory | io mode | io read|write|…'
    };
  }

  return { ok: false, error: 'not a cash-cli line (use cash, flow, or io prefix)' };
}

/**
 * @param {string} line
 * @returns {boolean}
 */
export function isCashCliLine(line) {
  const h = (line || '').trim().split(/\s+/)[0]?.toLowerCase();
  return h === 'cash' || h === 'flow' || h === 'io';
}

/**
 * Short reference for help / terminals.
 */
export const CASH_CLI_HELP = [
  'cash list | cash version',
  'flow log "message" [--level info|warn|error]   (put message before --level)',
  'flow wait <ms>',
  'flow abort [reason]',
  'io drive | io control | io memory   → CASH.SET_IO_CONTEXT',
  'io mode   (show current IO backend)',
  'io read <path>',
  'io write <path> …content',
  'io append <path> …content',
  'io list [path]',
  'io mkdir <path>',
  'io delete <path>'
].join('\n');
