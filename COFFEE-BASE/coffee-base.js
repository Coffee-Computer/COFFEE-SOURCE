/**
 * coffee.base — Thin document “table” layer on coffee.que + coffee.wire.drive.
 * JSON collections in IndexedDB (per project). No SQL — faux BaaS shape for local-first apps.
 *
 * Load order: coffee-control → coffee-ui (optional) → coffee-drive → coffee-wire → coffee-que → coffee-base.js
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  function slugProject(key) {
    var s = String(key == null ? 'default' : key)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    if (!s) s = 'default';
    return s.slice(0, 48);
  }

  /** Preset collection names (empty docs seeded with a starter row you can delete). */
  var PRESETS = {
    saas: ['users', 'subscriptions', 'teams', 'api_logs'],
    ecommerce: ['products', 'orders', 'customers', 'inventory', 'categories'],
    freelance: ['clients', 'projects', 'invoices', 'time_logs']
  };

  /**
   * @param {string} [projectKey='default'] — isolates IndexedDB under coffee-base-<slug>
   * @returns {object|null}
   */
  coffee.base = function (projectKey) {
    if (!coffee.que || !coffee.wire || typeof coffee.wire.drive !== 'function') {
      console.error('coffee.base: load coffee-que.js and coffee-wire.js (and coffee-drive.js) first');
      return null;
    }
    if (!coffee.drive) {
      console.error('coffee.base: load coffee-drive.js first');
      return null;
    }

    var appName = 'coffee-base-' + slugProject(projectKey);
    var adapter = coffee.wire.drive(appName);
    var q = coffee.que({ adapter: adapter });

    return {
      appName: appName,
      projectKey: slugProject(projectKey),

      init: function () {
        return q.init();
      },

      /** Direct access to underlying que (collection, add, …). */
      que: q,

      collection: function (name) {
        return q.collection(name);
      },
      add: function (doc) {
        return q.add(doc);
      },
      remove: function (index) {
        return q.remove(index);
      },
      removeDoc: function (doc) {
        return q.removeDoc(doc);
      },
      filter: function (term) {
        return q.filter(term);
      },
      list: function () {
        return q.list();
      },
      listAll: function () {
        return q.listAll();
      },
      clear: function () {
        return q.clear();
      },
      collections: function () {
        return q.collections();
      },
      newCollection: function (name) {
        return q.newCollection(name);
      },

      /**
       * Create named collections from a preset if they don’t already exist.
       * @returns {{ ok: boolean, created?: string[], skipped?: string[], error?: string }}
       */
      applyPreset: function (presetKey) {
        var cols = PRESETS[presetKey];
        if (!cols) {
          return { ok: false, error: 'Unknown preset: ' + presetKey };
        }
        var existing = {};
        q.collections().forEach(function (c) {
          existing[c] = true;
        });
        var created = [];
        var skipped = [];
        cols.forEach(function (c) {
          var slug = String(c)
            .toLowerCase()
            .replace(/\s/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          if (!slug) return;
          if (existing[slug]) {
            skipped.push(slug);
            return;
          }
          q.newCollection(slug);
          q.add({
            _coffeeBaseSeed: true,
            note: 'Starter row — remove and add your own JSON documents.'
          });
          existing[slug] = true;
          created.push(slug);
        });
        return { ok: true, created: created, skipped: skipped };
      }
    };
  };

  coffee.base.PRESETS = PRESETS;
  coffee.base.slugProject = slugProject;

  window.coffee = coffee;
})();
