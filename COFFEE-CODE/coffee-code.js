/**
 * coffee.code — Opinionated code/markdown editor = coffee.frame + coffee.monaco defaults.
 * Load: coffee-control (opt) → coffee-frame.js → coffee-monaco.js → coffee-code.js
 *
 * const api = await coffee.code.create(container, opts);
 * Same surface as coffee.monaco (getValue, setValue, layout, onChange, destroy, …).
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  const defaults = {
    language: 'markdown',
    theme: 'vs-dark',
    readOnly: false,
    minimap: false
  };

  async function create(container, opts) {
    opts = opts || {};
    if (!coffee.monaco || typeof coffee.monaco.create !== 'function') {
      throw new Error(
        'coffee.code: load coffee-frame.js and coffee-monaco.js before coffee-code.js'
      );
    }
    const merged = Object.assign({}, defaults, opts);
    return coffee.monaco.create(container, merged);
  }

  coffee.code = {
    create: create,
    defaults: defaults
  };
})();
