/**
 * coffee.git — Fetch public HTML (or text) from GitHub-shaped sources.
 * No auth (public repos / raw URLs only). Pair with cceValidate.validateHtml().
 *
 * Load after coffee-control.js (extends window.coffee).
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var RAW_HOST = 'raw.githubusercontent.com';

  function githubBlobToRaw(urlString) {
    try {
      var url = new URL(urlString.trim());
      if (url.hostname !== 'github.com') return null;
      var parts = url.pathname.split('/').filter(Boolean);
      var bi = parts.indexOf('blob');
      if (bi < 2 || bi + 1 >= parts.length) return null;
      var owner = parts[0];
      var repo = parts[1];
      var ref = parts[bi + 1];
      var path = parts.slice(bi + 2).join('/');
      if (!path) return null;
      return 'https://' + RAW_HOST + '/' + owner + '/' + repo + '/' + ref + '/' + path;
    } catch (_) {
      return null;
    }
  }

  /**
   * Parse user input into a fetch plan.
   * @returns {{ kind:'url', url:string }|{ kind:'github', owner:string, repo:string, path:string, refs:string[] }|{ error:string }}
   */
  function parseSpec(input) {
    var s = String(input || '').trim();
    if (!s) return { error: 'Empty input' };

    if (/^https?:\/\//i.test(s)) {
      if (s.indexOf(RAW_HOST) !== -1) {
        return { kind: 'url', url: s };
      }
      var raw = githubBlobToRaw(s);
      if (raw) return { kind: 'url', url: raw };
      return { kind: 'url', url: s };
    }

    var m = s.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/(.*))?$/);
    if (!m) {
      return {
        error: 'Use owner/repo, owner/repo/path/to.html, a raw.githubusercontent.com URL, or a github.com/.../blob/... link'
      };
    }
    var path = (m[3] || 'index.html').replace(/^\/+/, '');
    if (!path) path = 'index.html';
    return {
      kind: 'github',
      owner: m[1],
      repo: m[2],
      path: path,
      refs: ['main', 'master']
    };
  }

  function buildRawUrl(owner, repo, ref, path) {
    var p = path.replace(/^\/+/, '');
    return 'https://' + RAW_HOST + '/' + owner + '/' + repo + '/' + ref + '/' + p;
  }

  /**
   * GET a single URL; returns { ok, status, text, url, error }.
   */
  async function fetchUrl(url) {
    try {
      var res = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store'
      });
      var text = res.ok ? await res.text() : '';
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          text: '',
          url: url,
          error: 'HTTP ' + res.status
        };
      }
      return { ok: true, status: res.status, text: text, url: url, error: null };
    } catch (e) {
      return {
        ok: false,
        status: 0,
        text: '',
        url: url,
        error: e && e.message ? e.message : 'fetch failed'
      };
    }
  }

  /**
   * Fetch from GitHub public raw with ref fallback (main → master).
   */
  async function fetchGithub(spec) {
    var lastErr = 'Not found';
    for (var i = 0; i < spec.refs.length; i++) {
      var ref = spec.refs[i];
      var url = buildRawUrl(spec.owner, spec.repo, ref, spec.path);
      var r = await fetchUrl(url);
      if (r.ok) {
        return {
          ok: true,
          text: r.text,
          url: r.url,
          resolved: { owner: spec.owner, repo: spec.repo, ref: ref, path: spec.path }
        };
      }
      lastErr = r.error || 'HTTP ' + r.status;
    }
    return {
      ok: false,
      text: '',
      url: null,
      resolved: null,
      error: lastErr + ' (tried refs: ' + spec.refs.join(', ') + ')'
    };
  }

  /**
   * Parse input and fetch. Resolves to { ok, text, url, resolved, error }.
   */
  async function fetchFromInput(input) {
    var spec = parseSpec(input);
    if (spec.error) {
      return { ok: false, text: '', url: null, resolved: null, error: spec.error };
    }
    if (spec.kind === 'url') {
      var out = await fetchUrl(spec.url);
      if (!out.ok) {
        return {
          ok: false,
          text: '',
          url: spec.url,
          resolved: null,
          error: out.error || 'fetch failed'
        };
      }
      return {
        ok: true,
        text: out.text,
        url: out.url,
        resolved: { url: out.url }
      };
    }
    if (spec.kind === 'github') {
      return fetchGithub(spec);
    }
    return { ok: false, text: '', url: null, resolved: null, error: 'Unknown spec' };
  }

  coffee.git = {
    parseSpec: parseSpec,
    buildRawUrl: buildRawUrl,
    fetchUrl: fetchUrl,
    fetchFromInput: fetchFromInput,
    githubBlobToRaw: githubBlobToRaw
  };

  window.coffee = coffee;
})();
