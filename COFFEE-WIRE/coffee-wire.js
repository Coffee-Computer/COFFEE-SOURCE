/**
 * coffee.wire — Persistence adapters for coffee.que.
 * Wires que data to storage backends. Unified with Control and Drive.
 *
 * coffee.wire.control({ prefix }) — uses coffee.save/load (Control)
 * coffee.wire.drive(appName) — uses coffee.drive (IndexedDB), call init() before use
 * coffee.wire.localStorage({ prefix }) — raw localStorage (legacy)
 * coffee.wire.memory() — in-memory, no persist (for testing)
 *
 * Adapter interface: { load(name), save(name, data), listCollections() }
 * Drive adapter adds: init() → Promise (call before first use)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const QUE_PREFIX = 'que_';

  coffee.wire = {
    /**
     * Control adapter — uses coffee.save/load. Load coffee-control.js first.
     */
    control(opts = {}) {
      const prefix = opts.prefix || QUE_PREFIX;
      if (typeof coffee.save !== 'function' || typeof coffee.load !== 'function') {
        console.warn('coffee.wire.control: coffee.save/load not found. Load coffee-control.js first.');
      }
      return {
        load(name) {
          try {
            const val = coffee.load ? coffee.load(prefix + name) : null;
            return Array.isArray(val) ? val : (val ? [val] : []);
          } catch {
            return [];
          }
        },

        save(name, data) {
          try {
            if (coffee.save) coffee.save(prefix + name, Array.isArray(data) ? data : []);
          } catch (e) {
            console.warn('coffee.wire.control: save failed', e);
          }
        },

        listCollections() {
          try {
            if (!coffee.list) return ['default'];
            const { local } = coffee.list();
            const fullPrefix = 'coffee_' + prefix;
            const keys = Object.keys(local || {}).filter(k => k.startsWith(fullPrefix));
            const names = keys.map(k => k.slice(fullPrefix.length)).sort();
            if (names.length === 0) {
              this.save('default', []);
              return ['default'];
            }
            return names;
          } catch {
            return ['default'];
          }
        }
      };
    },

    /**
     * Drive adapter — uses coffee.drive (IndexedDB). Load coffee-drive.js first.
     * Call adapter.init() before first use. Stores collections as items with id 'que_<name>'.
     */
    drive(appName) {
      if (!appName || typeof appName !== 'string') {
        console.error('coffee.wire.drive: appName required');
        return null;
      }
      if (!coffee.drive) {
        console.warn('coffee.wire.drive: coffee.drive not found. Load coffee-drive.js first.');
      }
      const cache = new Map();
      const drive = coffee.drive ? coffee.drive(appName) : null;

      const adapter = {
        async init() {
          if (!drive) return;
          try {
            const items = await drive.list();
            cache.clear();
            for (const item of items || []) {
              if (item && item.id && item.id.startsWith(QUE_PREFIX)) {
                const name = item.id.slice(QUE_PREFIX.length);
                cache.set(name, Array.isArray(item.data) ? item.data : []);
              }
            }
          } catch (e) {
            console.warn('coffee.wire.drive: init failed', e);
          }
        },

        load(name) {
          return cache.has(name) ? [...cache.get(name)] : [];
        },

        save(name, data) {
          const arr = Array.isArray(data) ? data : [];
          cache.set(name, arr);
          if (drive) {
            drive.save({ id: QUE_PREFIX + name, data: arr }).catch(e =>
              console.warn('coffee.wire.drive: save failed', e)
            );
          }
        },

        listCollections() {
          const keys = Array.from(cache.keys()).sort();
          if (keys.length === 0) return ['default'];
          return keys;
        }
      };

      return adapter;
    },

    localStorage(opts = {}) {
      const prefix = opts.prefix || 'coffee_wire_';

      return {
        load(name) {
          try {
            const raw = window.localStorage.getItem(prefix + name);
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        },

        save(name, data) {
          try {
            window.localStorage.setItem(prefix + name, JSON.stringify(data));
          } catch (e) {
            console.warn('coffee.wire.localStorage: save failed', e);
          }
        },

        listCollections() {
          const keys = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              keys.push(key.slice(prefix.length));
            }
          }
          if (keys.length === 0) {
            this.save('default', []);
            return ['default'];
          }
          return keys.sort();
        }
      };
    },

    memory() {
      const store = new Map();

      return {
        load(name) {
          return store.has(name) ? [...store.get(name)] : [];
        },

        save(name, data) {
          store.set(name, [...data]);
        },

        listCollections() {
          const keys = Array.from(store.keys()).sort();
          return keys.length > 0 ? keys : [];
        }
      };
    }
  };

  window.coffee = coffee;
})();
