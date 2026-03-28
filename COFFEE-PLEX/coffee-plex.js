/**
 * coffee.plex — Headless Canvas2D stroke styling (Kite / draw preset layer).
 * No DOM. Pass a CanvasRenderingContext2D; use with coffee.draw or any loop.
 *
 * coffee.plex.apply(ctx, { mode, color, size, opacity })
 * coffee.plex.reset(ctx)
 * coffee.plex.modes() → [{ id, label }]
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const MODES = [
    { id: 'pen', label: 'Pen' },
    { id: 'brush', label: 'Soft brush' },
    { id: 'sketch', label: 'Sketch' },
    { id: 'marker', label: 'Marker' },
    { id: 'eraser', label: 'Eraser' }
  ];

  /**
   * Reset ctx to neutral stroke state (after each stroke if needed).
   */
  coffee.plex = {
    modes() {
      return MODES.slice();
    },

    isMode(id) {
      return MODES.some((m) => m.id === id);
    },

    reset(ctx) {
      if (!ctx) return;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {{ mode?: string, color?: string, size?: number, opacity?: number }} spec
     *   opacity: 0–1
     */
    apply(ctx, spec = {}) {
      if (!ctx) return;
      const mode = spec.mode || 'pen';
      const color = spec.color != null ? String(spec.color) : '#000000';
      const size = Math.max(0.5, Number(spec.size) || 4);
      const opacity = Math.max(0, Math.min(1, Number(spec.opacity) != null ? Number(spec.opacity) : 1));

      coffee.plex.reset(ctx);
      ctx.lineJoin = 'round';

      if (mode === 'pen') {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.globalAlpha = opacity;
        return;
      }
      if (mode === 'brush') {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.shadowBlur = size / 2;
        ctx.shadowColor = color;
        ctx.globalAlpha = opacity;
        return;
      }
      if (mode === 'sketch') {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.5, size / 4);
        ctx.lineCap = 'round';
        ctx.globalAlpha = opacity * 0.5;
        return;
      }
      if (mode === 'marker') {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'square';
        ctx.globalAlpha = opacity * 0.6;
        return;
      }
      if (mode === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1;
        return;
      }
      /* unknown → pen */
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.globalAlpha = opacity;
    }
  };

  window.coffee = coffee;
})();
