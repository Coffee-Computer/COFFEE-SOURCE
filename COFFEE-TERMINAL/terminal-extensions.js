/**
 * coffee.terminalExtensions — JSON manifests + handler registry + **folder plugins**.
 *
 * Root `terminal-extensions.json` can list:
 *   "plugins": [ { "manifest": "PLUGINS/foo/plugin.json", "script": "PLUGINS/foo/plugin.js" } ]
 * Paths resolve relative to the **directory of the root manifest** (Response URL).
 *
 * Load order: coffee-slash.js → terminal-slash.js → **terminal-extensions.js**
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || (window.coffee = {});

  var baseSnapshot = JSON.stringify(
    (coffee.terminalSlash && coffee.terminalSlash.commands) || []
  );

  function cloneBase() {
    try {
      return JSON.parse(baseSnapshot);
    } catch (e) {
      return [];
    }
  }

  /**
   * @param {{ id: string, label: string, insert?: string, cat?: string, handler?: string|null }[]} baseList
   * @param {{ commands?: object[] }} manifest
   */
  function mergeManifest(baseList, manifest) {
    var out = baseList.map(function (c) {
      return {
        id: c.id,
        label: c.label,
        insert: c.insert,
        cat: c.cat,
        handler: c.handler != null ? c.handler : null
      };
    });
    var byId = {};
    out.forEach(function (c, i) {
      byId[c.id] = i;
    });
    var extra = (manifest && manifest.commands) || [];
    extra.forEach(function (c) {
      if (!c || !c.id) return;
      var row = {
        id: String(c.id),
        label: c.label != null ? String(c.label) : String(c.id),
        insert: c.insert != null ? String(c.insert) : String(c.id) + ' ',
        cat: c.cat != null ? String(c.cat) : 'Extension',
        handler: c.handler != null && c.handler !== '' ? String(c.handler) : null
      };
      if (byId[row.id] != null) out[byId[row.id]] = row;
      else {
        out.push(row);
        byId[row.id] = out.length - 1;
      }
    });
    return out;
  }

  function loadScript(absUrl) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = absUrl;
      s.async = false;
      s.onload = function () {
        res();
      };
      s.onerror = function () {
        rej(new Error('plugin script failed: ' + absUrl));
      };
      document.head.appendChild(s);
    });
  }

  coffee.terminalExtensions = {
    /** @type {Record<string, function(ctx: object, line: string, log: function): void>} */
    handlers: Object.create(null),

    registerHandler: function (handlerId, fn) {
      if (handlerId && typeof fn === 'function') this.handlers[handlerId] = fn;
    },

    resetCommands: function () {
      var list = cloneBase();
      if (coffee.terminalSlash) coffee.terminalSlash.commands = list;
      return list;
    },

    applyManifest: function (manifest) {
      var merged = mergeManifest(cloneBase(), manifest || {});
      if (coffee.terminalSlash) coffee.terminalSlash.commands = merged;
      return merged;
    },

    /**
     * Fetch root manifest, merge root.commands, merge each plugin manifest, then inject plugin scripts in order.
     * @param {string} url
     * @returns {Promise<object[]>}
     */
    fetchAndApply: function (url) {
      var self = this;
      return fetch(url, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('extensions: ' + r.status);
          var baseDir = new URL('./', r.url);
          return r.json().then(function (manifest) {
            return { manifest: manifest, baseDir: baseDir };
          });
        })
        .then(function (ref) {
          var manifest = ref.manifest;
          var baseDir = ref.baseDir;
          var list = mergeManifest(cloneBase(), { commands: manifest.commands || [] });
          var plugins = manifest.plugins || [];

          var p = Promise.resolve();
          plugins.forEach(function (plug) {
            if (!plug || !plug.manifest) return;
            p = p.then(function () {
              var mUrl = new URL(String(plug.manifest), baseDir);
              return fetch(mUrl, { credentials: 'same-origin' }).then(function (r) {
                if (!r.ok) throw new Error('plugin manifest ' + mUrl.pathname + ': ' + r.status);
                return r.json();
              }).then(function (sub) {
                list = mergeManifest(list, sub);
              });
            });
          });

          return p.then(function () {
            if (coffee.terminalSlash) coffee.terminalSlash.commands = list;
            var q = Promise.resolve();
            plugins.forEach(function (plug) {
              if (!plug || !plug.script) return;
              q = q.then(function () {
                var sUrl = new URL(String(plug.script), baseDir).href;
                return loadScript(sUrl);
              });
            });
            return q.then(function () {
              return list;
            });
          });
        });
    }
  };
})();
