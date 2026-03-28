/**
 * coffee.filterCss — Reusable CSS filter string builder.
 * Use on <img>, <canvas>, or CanvasRenderingContext2D.filter for preview + export.
 * Pairs with coffee.pix when B/C/S live in pixels and overlays (sepia, blur, …) stay in CSS.
 *
 * const s = coffee.filterCss({ sepia: 40, blur: 2, grayscale: 0 });
 * coffee.filterCss.apply(el, { brightness: 110, contrast: 90 });
 * coffee.filterCss.overlay({ sepia: 0, blur: 0, grayscale: 50 });
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function num(v, def) {
    if (v == null || v === '') return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  /**
   * Build a CSS filter string. Only includes properties you pass (except overlay shortcut).
   * @param {object} opts
   * @param {number} [opts.brightness] — percent, e.g. 100 = default
   * @param {number} [opts.contrast] — percent
   * @param {number} [opts.saturate] — percent
   * @param {number} [opts.sepia] — percent 0–100
   * @param {number} [opts.grayscale] — percent 0–100
   * @param {number} [opts.blur] — px
   * @param {number} [opts.hueRotate] — degrees
   * @param {number} [opts.invert] — percent 0–100
   * @param {number} [opts.opacity] — 0–1
   * @returns {string}
   */
  function filterCss(opts) {
    if (opts == null || typeof opts !== 'object') return 'none';
    const parts = [];
    const b = opts.brightness;
    const c = opts.contrast;
    const s = opts.saturate;
    if (b != null) parts.push('brightness(' + num(b, 100) + '%)');
    if (c != null) parts.push('contrast(' + num(c, 100) + '%)');
    if (s != null) parts.push('saturate(' + num(s, 100) + '%)');
    if (opts.sepia != null) parts.push('sepia(' + num(opts.sepia, 0) + '%)');
    if (opts.grayscale != null) parts.push('grayscale(' + num(opts.grayscale, 0) + '%)');
    if (opts.blur != null) parts.push('blur(' + num(opts.blur, 0) + 'px)');
    const h = opts.hueRotate;
    if (h != null && num(h, 0) !== 0) parts.push('hue-rotate(' + num(h, 0) + 'deg)');
    if (opts.invert != null && num(opts.invert, 0) > 0) parts.push('invert(' + num(opts.invert, 0) + '%)');
    if (opts.opacity != null && num(opts.opacity, 1) < 1) parts.push('opacity(' + num(opts.opacity, 1) + ')');
    return parts.length ? parts.join(' ') : 'none';
  }

  /**
   * Bright House–style overlay: sepia + blur + grayscale (always emitted so export matches preview).
   * @param {object} o
   * @param {number} [o.sepia=0]
   * @param {number} [o.blur=0]
   * @param {number} [o.grayscale=0]
   */
  filterCss.overlay = function (o) {
    const x = o || {};
    return (
      'sepia(' + num(x.sepia, 0) + '%) ' +
      'blur(' + num(x.blur, 0) + 'px) ' +
      'grayscale(' + num(x.grayscale, 0) + '%)'
    );
  };

  /**
   * Set element.style.filter from opts (same keys as filterCss).
   * @param {Element} el
   * @param {object} opts
   */
  filterCss.apply = function (el, opts) {
    if (el && el.style) el.style.filter = filterCss(opts);
  };

  /**
   * Apply overlay() to an element.
   * @param {Element} el
   * @param {object} o — sepia, blur, grayscale
   */
  filterCss.applyOverlay = function (el, o) {
    if (el && el.style) el.style.filter = filterCss.overlay(o);
  };

  coffee.filterCss = filterCss;
  window.coffee = coffee;
})();
