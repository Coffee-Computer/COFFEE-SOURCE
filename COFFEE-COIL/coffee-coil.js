/**
 * coffee.coil — Template/preset house for generative art.
 * Loads JSON presets: { engine, params, seed? }
 * Fetches from presets/{engine}/{preset}.json
 *
 * coffee.coil.load(engine, preset, opts) — returns Promise<preset>
 * coffee.coil.list(opts) — returns Promise<manifest> (engines + preset names)
 *
 * const p = await coffee.coil.load('flow', 'default');
 * // p = { engine: 'flow', params: { complexity, speed, hue, zoom }, seed?: n }
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_BASE = 'presets/';

  coffee.coil = {
    /**
     * Load a preset. Fetches presets/{engine}/{preset}.json
     * @param {string} engine - Engine name (flow, fractal, orbit, glitch)
     * @param {string} preset - Preset name (default, warm, etc.)
     * @param {object} opts - { baseUrl }
     * @returns {Promise<object>} { engine, params, seed? }
     */
    async load(engine, preset, opts = {}) {
      const baseUrl = opts.baseUrl ?? DEFAULT_BASE;
      const path = `${baseUrl}${engine}/${preset}.json`;
      const res = await fetch(path);
      if (!res.ok) throw new Error(`coffee.coil: preset not found ${path}`);
      const data = await res.json();
      return { engine, ...data };
    },

    /**
     * List available presets. Requires presets/manifest.json
     * @param {object} opts - { baseUrl }
     * @returns {Promise<object>} { flow: ['default', 'warm'], fractal: [...], ... }
     */
    async list(opts = {}) {
      const baseUrl = opts.baseUrl ?? DEFAULT_BASE;
      const res = await fetch(`${baseUrl}manifest.json`);
      if (!res.ok) return { flow: ['default'], fractal: ['default'], orbit: ['default'], glitch: ['default'] };
      return res.json();
    },

    version: '1.0'
  };

  window.coffee = coffee;
})();
