/**
 * coffee.request() — Thin fetch wrapper for HTTP APIs.
 * JSON by default. Throws on 4xx/5xx. Optional baseUrl, defaultHeaders, timeout.
 *
 * coffee.request(url, { method, headers, body, timeout, json })
 *
 * Load: <script src="coffee-request.js"></script>
 * No dependencies.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.request = async function (url, opts = {}) {
    const { method = 'GET', headers = {}, body, timeout = 0, json = true } = opts;

    const baseUrl = (coffee.request.baseUrl || '').replace(/\/$/, '');
    const fullUrl = url.startsWith('http') ? url : (baseUrl ? baseUrl + (url.startsWith('/') ? url : '/' + url) : url);

    const h = { ...(coffee.request.defaultHeaders || {}), ...headers };
    if (json && body != null && typeof body === 'object' && !(body instanceof FormData)) {
      h['Content-Type'] = h['Content-Type'] || 'application/json';
    }

    const init = {
      method,
      headers: h,
      ...(body != null && { body: typeof body === 'object' && !(body instanceof FormData) && json ? JSON.stringify(body) : body })
    };

    if (timeout > 0) {
      const ctrl = new AbortController();
      init.signal = ctrl.signal;
      setTimeout(() => ctrl.abort(), timeout);
    }

    const res = await fetch(fullUrl, init);

    if (!res.ok) {
      const err = new Error(res.statusText || `HTTP ${res.status}`);
      err.status = res.status;
      err.response = res;
      try {
        err.body = await res.json();
      } catch (_) {
        try { err.body = await res.text(); } catch (_) {}
      }
      throw err;
    }

    const ct = res.headers.get('content-type') || '';
    if (json && (ct.includes('application/json') || res.status === 204)) {
      if (res.status === 204) return null;
      return res.json();
    }
    return res.text();
  };

  coffee.request.baseUrl = '';
  coffee.request.defaultHeaders = {};

  window.coffee = coffee;
})();
