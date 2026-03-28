/**
 * coffee.monaco — Monaco editor in an iframe, RPC via coffee.frame.
 * Requires: coffee-frame.js before this script.
 *
 * const api = await coffee.monaco.create(container, { value, language, theme, readOnly });
 * await api.getValue(); api.setValue(s); api.layout(); api.focus(); api.onChange(fn); api.destroy();
 * api.getSelectionOffsets(); api.replaceRange(s,e,text); api.getCursorScreenPosition() — for coffee.slash
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  function monacoBaseUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || '';
      if (src.indexOf('coffee-monaco.js') !== -1) {
        return src.replace(/\/[^/]+$/, '/');
      }
    }
    return '';
  }

  /**
   * @param {HTMLElement} container
   * @param {object} [opts]
   * @param {string} [opts.hostUrl] - override monaco-host.html URL
   * @param {string} [opts.value]
   * @param {string} [opts.language] - default 'markdown'
   * @param {string} [opts.theme] - default 'vs-dark'
   * @param {boolean} [opts.readOnly]
   * @param {boolean} [opts.minimap]
   */
  async function create(container, opts) {
    opts = opts || {};
    if (!coffee.frame || typeof coffee.frame.mount !== 'function') {
      throw new Error('coffee.monaco: load coffee-frame.js before coffee-monaco.js');
    }

    const base = monacoBaseUrl();
    const hostUrl = opts.hostUrl || (base ? base + 'host/monaco-host.html' : 'host/monaco-host.html');
    const absoluteHost = new URL(hostUrl, window.location.href).href;

    const rpc = coffee.frame.mount(container, absoluteHost, {
      title: opts.title || 'Monaco editor',
      readyTimeoutMs: opts.readyTimeoutMs != null ? opts.readyTimeoutMs : 120000
    });

    let changeHandler = null;
    rpc.onEvent(function (name, payload) {
      if (name === 'change' && changeHandler && payload != null) {
        if (typeof payload === 'string') {
          changeHandler({ value: payload });
        } else {
          changeHandler(payload);
        }
      }
    });

    await rpc.ready;
    await rpc.request('configure', [
      {
        value: opts.value != null ? opts.value : '',
        language: opts.language || 'markdown',
        theme: opts.theme || 'vs-dark',
        readOnly: !!opts.readOnly,
        minimap: opts.minimap === true
      }
    ]);

    return {
      iframe: rpc.iframe,
      getValue: function () {
        return rpc.request('getValue', []);
      },
      setValue: function (text) {
        return rpc.request('setValue', [text]);
      },
      layout: function () {
        return rpc.request('layout', []);
      },
      focus: function () {
        return rpc.request('focus', []);
      },
      setTheme: function (themeId) {
        return rpc.request('setTheme', [themeId]);
      },
      setLanguage: function (lang) {
        return rpc.request('setLanguage', [lang]);
      },
      configure: function (partial) {
        return rpc.request('configure', [partial || {}]);
      },
      onChange: function (fn) {
        changeHandler = typeof fn === 'function' ? fn : null;
      },
      getSelectionOffsets: function () {
        return rpc.request('getSelectionOffsets', []);
      },
      replaceRange: function (start, end, text) {
        return rpc.request('replaceRange', [start, end, text]);
      },
      getCursorScreenPosition: function () {
        return rpc.request('getCursorScreenPosition', []);
      },
      destroy: function () {
        changeHandler = null;
        rpc.destroy();
      }
    };
  }

  coffee.monaco = {
    create: create,
    defaultHostPath: function () {
      return monacoBaseUrl() + 'host/monaco-host.html';
    }
  };
})();
