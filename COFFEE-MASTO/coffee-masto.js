/**
 * coffee.masto — Mastodon-compatible REST client on top of coffee.request.
 * One client per instance + token. No OAuth UI (use app settings or Anti-Social α).
 *
 * Depends: coffee.request (load coffee-request.js first)
 *
 * const api = coffee.masto({ instanceUrl: 'https://mastodon.social', token: '…' });
 * await api.verifyCredentials();
 * await api.homeTimeline({ limit: 20 });
 * await api.postStatus({ status: 'hello', visibility: 'public' });
 *
 * @see https://docs.joinmastodon.org/methods/
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  if (!coffee.request) {
    coffee.masto = function () {
      throw new Error('coffee.masto requires coffee.request. Load coffee-request.js first.');
    };
    window.coffee = coffee;
    return;
  }

  function normalizeInstance(url) {
    let u = (url || '').trim().replace(/\/$/, '');
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function buildUrl(instance, path) {
    const p = path.startsWith('/') ? path : '/' + path;
    return instance + p;
  }

  function toQuery(params) {
    if (!params || typeof params !== 'object') return '';
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v == null || v === '') continue;
      if (Array.isArray(v)) {
        for (const item of v) q.append(k, String(item));
      } else {
        q.set(k, String(v));
      }
    }
    const s = q.toString();
    return s ? '?' + s : '';
  }

  /**
   * @param {object} config
   * @param {string} [config.instanceUrl] — e.g. https://mastodon.social
   * @param {string} [config.instance] — alias
   * @param {string} [config.token] — OAuth access token
   */
  coffee.masto = function (config) {
    config = config || {};
    let instance = normalizeInstance(config.instanceUrl || config.instance || '');
    let token = config.token || '';

    function authHeaders(extra) {
      const h = { ...(extra || {}) };
      if (token) h['Authorization'] = 'Bearer ' + token;
      return h;
    }

    async function req(path, opts) {
      opts = opts || {};
      const url = buildUrl(instance, path);
      const headers = authHeaders(opts.headers);
      return coffee.request(url, { ...opts, headers });
    }

    return {
      get instanceUrl() {
        return instance;
      },

      setInstanceUrl(url) {
        instance = normalizeInstance(url);
      },

      setToken(t) {
        token = t || '';
      },

      getToken() {
        return token;
      },

      /** @see https://docs.joinmastodon.org/methods/accounts/#verify */
      verifyCredentials() {
        return req('/api/v1/accounts/verify_credentials');
      },

      /** @param {{ limit?: number, since_id?: string, max_id?: string, min_id?: string }} [params] */
      homeTimeline(params) {
        return req('/api/v1/timelines/home' + toQuery(params));
      },

      /** @param {{ local?: boolean|string, remote?: boolean|string, only_media?: boolean|string, limit?: number, since_id?: string, max_id?: string }} [params] */
      publicTimeline(params) {
        return req('/api/v1/timelines/public' + toQuery(params));
      },

      /** @param {string} tag — without leading # */
      tagTimeline(tag, params) {
        const t = encodeURIComponent(String(tag || '').replace(/^#/, ''));
        return req('/api/v1/timelines/tag/' + t + toQuery(params));
      },

      /** @param {string} listId */
      listTimeline(listId, params) {
        return req(
          '/api/v1/timelines/list/' + encodeURIComponent(listId) + toQuery(params)
        );
      },

      /**
       * @param {object} body — status, media_ids, poll, in_reply_to_id, sensitive, spoiler_text, visibility, language, scheduled_at, …
       * @see https://docs.joinmastodon.org/methods/statuses/#create
       */
      postStatus(body) {
        return req('/api/v1/statuses', { method: 'POST', body });
      },

      /** @param {string} id */
      getStatus(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id));
      },

      /** @param {string} id */
      statusContext(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id) + '/context');
      },

      /** @param {string} id */
      deleteStatus(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id), { method: 'DELETE' });
      },

      /** @param {string} id */
      favourite(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id) + '/favourite', {
          method: 'POST',
          body: {}
        });
      },

      /** @param {string} id */
      unfavourite(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id) + '/unfavourite', {
          method: 'POST',
          body: {}
        });
      },

      /** @param {string} id */
      reblog(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id) + '/reblog', {
          method: 'POST',
          body: {}
        });
      },

      /** @param {string} id */
      unreblog(id) {
        return req('/api/v1/statuses/' + encodeURIComponent(id) + '/unreblog', {
          method: 'POST',
          body: {}
        });
      },

      /**
       * @param {File|Blob} file
       * @param {{ description?: string, focus?: string }} [opts]
       * @see https://docs.joinmastodon.org/methods/media/#v2
       */
      uploadMedia(file, opts) {
        opts = opts || {};
        const form = new FormData();
        form.append('file', file);
        if (opts.description) form.append('description', opts.description);
        if (opts.focus) form.append('focus', opts.focus);
        const url = buildUrl(instance, '/api/v2/media');
        return coffee.request(url, {
          method: 'POST',
          headers: authHeaders(),
          body: form,
          json: true
        });
      },

      /** @param {string} accountId */
      getAccount(accountId) {
        return req('/api/v1/accounts/' + encodeURIComponent(accountId));
      },

      /** @see https://docs.joinmastodon.org/methods/accounts/#statuses */
      accountStatuses(accountId, params) {
        return req(
          '/api/v1/accounts/' + encodeURIComponent(accountId) + '/statuses' + toQuery(params)
        );
      },

      /** @param {string|string[]} accountIds */
      relationships(accountIds) {
        const ids = [].concat(accountIds || []);
        const q = new URLSearchParams();
        for (const id of ids) q.append('id[]', String(id));
        const s = q.toString();
        return req('/api/v1/accounts/relationships' + (s ? '?' + s : ''));
      },

      /**
       * @param {string} q
       * @param {{ type?: string, resolve?: boolean|string, limit?: number, offset?: number, following?: boolean|string }} [params]
       */
      search(q, params) {
        const p = { q, ...(params || {}) };
        return req('/api/v2/search' + toQuery(p));
      },

      /** @param {{ limit?: number, max_id?: string, min_id?: string, since_id?: string }} [params] */
      notifications(params) {
        return req('/api/v1/notifications' + toQuery(params));
      },

      /** @param {string} id */
      dismissNotification(id) {
        return req(
          '/api/v1/notifications/' + encodeURIComponent(id) + '/dismiss',
          { method: 'POST', body: {} }
        );
      }
    };
  };

  window.coffee = coffee;
})();
