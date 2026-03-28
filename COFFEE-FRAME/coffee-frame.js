/**
 * coffee.frame — Reusable same-origin iframe + postMessage RPC.
 * Guest pages must post { cf: 1, t: 'ready' } when ready to accept requests.
 * Parent sends { cf: 1, t: 'req', id, method, args } (args = array).
 * Guest replies { cf: 1, t: 'res', id, ok, result?, err? }.
 * Optional events from guest: { cf: 1, t: 'evt', name, payload }.
 *
 * Load after coffee-control if you use other coffee.* APIs (optional).
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  const CF = 1;

  /**
   * @param {HTMLElement} container
   * @param {string} src - iframe src (absolute or same-folder-relative to your app)
   * @param {object} [opts]
   * @param {string} [opts.title] - iframe title (a11y)
   * @param {string} [opts.sandbox] - e.g. 'allow-scripts allow-same-origin' (omit for full same-origin)
   */
  function mount(container, src, opts) {
    opts = opts || {};
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', opts.title || 'Coffee frame');
    iframe.style.cssText =
      'width:100%;height:100%;min-height:120px;border:0;display:block;';
    if (opts.sandbox != null) iframe.setAttribute('sandbox', opts.sandbox);
    container.appendChild(iframe);

    let readyResolve;
    let readyReject;
    const ready = new Promise(function (resolve, reject) {
      readyResolve = resolve;
      readyReject = reject;
    });

    const pending = new Map();
    let msgId = 0;
    let evtHandler = null;
    let destroyed = false;

    const timeoutMs = opts.readyTimeoutMs || 60000;
    const timer = setTimeout(function () {
      readyReject(new Error('coffee.frame: guest ready timeout'));
    }, timeoutMs);

    function onMessage(e) {
      if (destroyed || e.source !== iframe.contentWindow) return;
      const d = e.data;
      if (!d || d.cf !== CF) return;

      if (d.t === 'ready') {
        clearTimeout(timer);
        readyResolve();
        return;
      }
      if (d.t === 'res' && d.id != null) {
        const p = pending.get(d.id);
        if (!p) return;
        pending.delete(d.id);
        if (d.ok) p.resolve(d.result);
        else p.reject(new Error(d.err || 'coffee.frame: request failed'));
        return;
      }
      if (d.t === 'evt' && typeof evtHandler === 'function') {
        evtHandler(d.name, d.payload);
      }
    }

    window.addEventListener('message', onMessage);

    function request(method, args) {
      return ready.then(function () {
        if (destroyed) return Promise.reject(new Error('coffee.frame: destroyed'));
        const id = ++msgId;
        return new Promise(function (resolve, reject) {
          pending.set(id, { resolve: resolve, reject: reject });
          iframe.contentWindow.postMessage(
            { cf: CF, t: 'req', id: id, method: method, args: args || [] },
            '*'
          );
        });
      });
    }

    function onEvent(fn) {
      evtHandler = fn;
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      pending.forEach(function (p) {
        p.reject(new Error('coffee.frame: destroyed'));
      });
      pending.clear();
      iframe.remove();
    }

    iframe.src = src;

    return {
      iframe: iframe,
      ready: ready,
      request: request,
      onEvent: onEvent,
      destroy: destroy
    };
  }

  coffee.frame = {
    mount: mount,
    CF: CF
  };
})();
