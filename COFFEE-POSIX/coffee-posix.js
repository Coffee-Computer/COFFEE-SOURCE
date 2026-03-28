/**
 * coffee-posix — path session + sh-style line parsing for vault-relative / VFS paths.
 *
 * **No I/O.** No `fetch`, no `coffee.drive`, no CASH. Hosts (CASH, Shell, other embedders) map
 * `{ op: 'list', path }` → their backend (`IO.LIST_DIR`, `coffee.shell`, …).
 *
 * Path rules (vault-friendly):
 * - No `..` above empty root; segments are `/`-separated, no leading `/` in stored cwd.
 * - Leading `/` on `cd` means “from vault root” (absolute within tree).
 *
 * @module coffee-posix
 */

/**
 * @param {string} s
 * @returns {string[]}
 */
export function splitSegments(s) {
  if (s == null || String(s).trim() === '') return [];
  return String(s)
    .replace(/\\/g, '/')
    .split('/')
    .filter(function (x) {
      return x !== '' && x !== '.';
    });
}

/**
 * @param {string[]} parts
 * @returns {string} vault-relative (empty = root)
 */
export function joinSegments(parts) {
  if (!parts || !parts.length) return '';
  return parts.join('/');
}

/**
 * Resolve `rel` against current cwd. Empty `rel` or `.` → cwd.
 * If `rel` starts with `/`, resolve from root (strip slash first).
 *
 * @param {string} cwd - normalized cwd (no leading/trailing slash)
 * @param {string} rel
 * @returns {{ ok: true, path: string } | { ok: false, error: string }}
 */
export function resolvePath(cwd, rel) {
  var r = rel == null ? '' : String(rel);
  var fromRoot = r.startsWith('/');
  var base = fromRoot ? [] : splitSegments(cwd);
  var segs = splitSegments(fromRoot ? r.slice(1) : r);
  if (r === '' || r === '.') {
    return { ok: true, path: joinSegments(base) };
  }
  var stack = base.slice();
  for (var i = 0; i < segs.length; i++) {
    var seg = segs[i];
    if (seg === '..') {
      if (stack.length === 0) {
        return { ok: false, error: 'cd: parent beyond root' };
      }
      stack.pop();
    } else {
      stack.push(seg);
    }
  }
  return { ok: true, path: joinSegments(stack) };
}

/**
 * @param {string} cwd
 * @returns {string} display only (e.g. `/` or `/media/foo`)
 */
export function formatPwdDisplay(cwd) {
  var p = cwd == null ? '' : String(cwd).replace(/\/$/, '');
  if (!p) return '/';
  return '/' + p;
}

/**
 * Split a line on spaces; respect double quotes (minimal).
 * @param {string} line
 * @returns {string[]}
 */
export function shellSplit(line) {
  var out = [];
  var cur = '';
  var q = null;
  var s = typeof line === 'string' ? line : '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
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
 * @typedef {{ ok: true, verb: string, args: string[] }} PosixParseOk
 * @typedef {{ ok: false, error: string }} PosixParseErr
 */

/**
 * Parse first token as command; rest are args.
 * Supported: `pwd`, `cd [path]`, `ls [path]`, `cat <path>`, `read <path>` (alias cat).
 *
 * @param {string} raw
 * @returns {PosixParseOk | PosixParseErr}
 */
export function parsePosixLine(raw) {
  var line = typeof raw === 'string' ? raw.trim() : '';
  if (!line) return { ok: false, error: 'empty line' };
  var parts = shellSplit(line);
  var head = (parts[0] || '').toLowerCase();
  var rest = parts.slice(1);

  if (head === 'pwd') {
    if (rest.length) return { ok: false, error: 'pwd: too many arguments' };
    return { ok: true, verb: 'pwd', args: [] };
  }
  if (head === 'cd') {
    if (rest.length > 1) return { ok: false, error: 'cd: too many arguments' };
    return { ok: true, verb: 'cd', args: rest };
  }
  if (head === 'ls' || head === 'dir') {
    if (rest.length > 1) return { ok: false, error: 'ls: too many arguments' };
    return { ok: true, verb: 'ls', args: rest };
  }
  if (head === 'cat' || head === 'read') {
    if (rest.length < 1) return { ok: false, error: head + ': missing path' };
    if (rest.length > 1) return { ok: false, error: head + ': too many arguments' };
    return { ok: true, verb: 'cat', args: rest };
  }

  return { ok: false, error: 'unknown command: ' + head };
}

/**
 * Turn a successful parse + cwd into a neutral **op** for the host (no CASH action names).
 *
 * @param {string} cwd
 * @param {PosixParseOk} parsed - must be `{ ok: true, verb, args }`
 * @returns {{ ok: true, op: string, path?: string, display?: string } | { ok: false, error: string }}
 */
export function posixIntentFromParse(cwd, parsed) {
  if (!parsed || !parsed.ok) {
    return { ok: false, error: 'invalid parse' };
  }
  var verb = parsed.verb;
  var args = parsed.args || [];

  if (verb === 'pwd') {
    return { ok: true, op: 'pwd', display: formatPwdDisplay(cwd) };
  }
  if (verb === 'cd') {
    var target = args[0] == null ? '~' : args[0];
    if (target === '~' || target === '') {
      return { ok: true, op: 'cd', path: '' };
    }
    var r = resolvePath(cwd, target);
    if (!r.ok) return r;
    return { ok: true, op: 'cd', path: r.path };
  }
  if (verb === 'ls') {
    var arg = args[0];
    var listRel = arg == null || arg === '' ? '.' : arg;
    var lr = resolvePath(cwd, listRel);
    if (!lr.ok) return lr;
    return { ok: true, op: 'list', path: lr.path === '' ? '.' : lr.path };
  }
  if (verb === 'cat') {
    var p = args[0];
    if (!p) return { ok: false, error: 'cat: missing path' };
    var cr = resolvePath(cwd, p);
    if (!cr.ok) return cr;
    return { ok: true, op: 'read', path: cr.path };
  }

  return { ok: false, error: 'unsupported verb: ' + verb };
}

/**
 * Mutable cwd session (host updates after `cd`).
 *
 * @param {{ initialCwd?: string }} [opts]
 */
export function createPathSession(opts) {
  opts = opts || {};
  var cwd = opts.initialCwd != null ? String(opts.initialCwd).replace(/^\/+|\/+$/g, '') : '';

  return {
    getCwd: function () {
      return cwd;
    },
    setCwd: function (next) {
      cwd = next == null ? '' : String(next).replace(/^\/+|\/+$/g, '');
    },
    /**
     * Apply parsed line: returns intent + mutates cwd on `cd`.
     * @param {string} rawLine
     * @returns {object}
     */
    applyLine: function (rawLine) {
      var pr = parsePosixLine(rawLine);
      if (!pr.ok) return pr;
      var intent = posixIntentFromParse(cwd, pr);
      if (!intent.ok) return intent;
      if (intent.op === 'cd' && intent.path != null) {
        cwd = intent.path;
      }
      return intent;
    },
    pwdDisplay: function () {
      return formatPwdDisplay(cwd);
    }
  };
}

/**
 * Map neutral op → CASH `{ action, params }`. Optional helper; CASH can do this itself.
 *
 * @param {{ ok: true, op: string, path?: string, display?: string }} intent
 * @returns {{ action: string, params: object } | null}
 */
export function intentToCashStep(intent) {
  if (!intent || !intent.ok) return null;
  switch (intent.op) {
    case 'list': {
      var lp = intent.path;
      var usePath = lp != null && lp !== '' && lp !== '.';
      return { action: 'IO.LIST_DIR', params: usePath ? { path: lp } : {} };
    }
    case 'read':
      return { action: 'IO.READ_FILE', params: { path: intent.path || '' } };
    case 'pwd':
    case 'cd':
      return null;
    default:
      return null;
  }
}
