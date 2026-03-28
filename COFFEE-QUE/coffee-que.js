/**
 * coffee.que — In-memory document store. Collections, add, remove, filter.
 * No persistence. Hook an adapter (coffee.wire) to persist.
 *
 * const q = coffee.que({ adapter: coffee.wire.control() });
 * q.collection('default');
 * q.add({ item: 'Latte', price: 4.5 });
 * q.filter('latte');
 * q.list();
 * // For wire.drive(): await q.init() before first use
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.que = function (opts = {}) {
    const { adapter } = opts;

    let currentCollection = 'default';
    let data = [];
    let filteredData = [];

    function persist() {
      if (adapter && typeof adapter.save === 'function') {
        adapter.save(currentCollection, data);
      }
    }

    function loadFromAdapter() {
      if (adapter && typeof adapter.load === 'function') {
        const loaded = adapter.load(currentCollection);
        data = Array.isArray(loaded) ? loaded : [];
      } else {
        data = [];
      }
      filteredData = [...data];
    }

    return {
      async init() {
        if (adapter && typeof adapter.init === 'function') {
          await adapter.init();
        }
      },

      collection(name) {
        currentCollection = name || 'default';
        loadFromAdapter();
        return data;
      },

      add(doc) {
        data.unshift(doc);
        filteredData.unshift(doc);
        persist();
        return data;
      },

      remove(index) {
        if (index >= 0 && index < data.length) {
          data.splice(index, 1);
          filteredData = data.filter(d => data.indexOf(d) >= 0);
          filteredData = [...data];
          persist();
        }
        return data;
      },

      removeDoc(doc) {
        const idx = data.indexOf(doc);
        if (idx >= 0) return this.remove(idx);
        return data;
      },

      clear() {
        data = [];
        filteredData = [];
        persist();
        return data;
      },

      filter(term) {
        if (!term || String(term).trim() === '') {
          filteredData = [...data];
          return filteredData;
        }
        const t = String(term).toLowerCase();
        filteredData = data.filter(doc =>
          JSON.stringify(doc).toLowerCase().includes(t)
        );
        return filteredData;
      },

      list() {
        return [...filteredData];
      },

      listAll() {
        return [...data];
      },

      collections() {
        if (adapter && typeof adapter.listCollections === 'function') {
          const list = adapter.listCollections();
          if (list.length === 0 && !adapter.load('default')) {
            return ['default'];
          }
          return list.length > 0 ? list : ['default'];
        }
        return [currentCollection];
      },

      newCollection(name) {
        if (!name || typeof name !== 'string') return;
        const slug = name.toLowerCase().replace(/\s/g, '_');
        currentCollection = slug;
        data = [];
        filteredData = [];
        persist();
        return data;
      },

      get currentCollection() {
        return currentCollection;
      }
    };
  };

  window.coffee = coffee;
})();
