/**
 * coffee.shadow — Preset loader for coffee.shade.
 * Fetches JSON from presets/{shader}/{preset}.json, passes config to shade.
 *
 * coffee.shadow.load(shader, preset, opts) — returns Promise<config>
 * coffee.shadow.run(opts) — opts: { canvas, shader, preset, baseUrl } — loads preset, starts shade
 *
 * const config = await coffee.shadow.load('liquid', 'ocean');
 * const s = coffee.shade({ canvas: '#c', config });
 * s.start();
 *
 * // Or one-liner:
 * const s = await coffee.shadow.run({ canvas: '#c', shader: 'liquid', preset: 'ocean' });
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_BASE = 'presets/';

  coffee.shadow = {
    /**
     * Load a preset. Fetches presets/{shader}/{preset}.json
     * @param {string} shader - Shader name (e.g. 'liquid')
     * @param {string} preset - Preset name (e.g. 'ocean')
     * @param {object} opts - { baseUrl } — base path for presets
     * @returns {Promise<object>} Config object for coffee.shade
     */
    async load(shader, preset, opts = {}) {
      const baseUrl = opts.baseUrl ?? DEFAULT_BASE;
      const path = `${baseUrl}${shader}/${preset}.json`;
      const res = await fetch(path);
      if (!res.ok) throw new Error(`coffee.shadow: preset not found ${path}`);
      return res.json();
    },

    /**
     * Load preset and start shade. Requires coffee.shade.
     * @param {object} opts - { canvas, shader, preset, baseUrl }
     * @returns {Promise<object>} Shade instance
     */
    async run(opts = {}) {
      const { canvas, shader = 'liquid', preset = 'default', baseUrl } = opts;
      if (!coffee.shade) throw new Error('coffee.shadow: coffee.shade required');
      const config = await this.load(shader, preset, { baseUrl });
      const shade = coffee.shade({ canvas, config });
      await shade.start();
      return shade;
    },

    version: '1.0'
  };

  window.coffee = coffee;
})();
