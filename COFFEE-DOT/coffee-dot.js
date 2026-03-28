/**
 * coffee.dot — 2D canvas render engine for games.
 * Consumes state (entities, projectiles) and draws to canvas.
 * No game logic. Tuned for sprites, particles, layers.
 *
 * State format:
 *   { width, height, entities: [...], projectiles: [...], camera?: { x, y } }
 *
 * coffee.dot.create(canvas) → { draw(state), resize(w, h) }
 * coffee.dot.draw(state, ctx) — one-shot draw (if you have ctx)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_GRID = { size: 50, color: 'rgba(255,255,255,0.03)' };
  const DEFAULT_FONT = '10px "Fira Code", monospace';

  function drawGrid(ctx, width, height, opts = {}) {
    const size = opts.size ?? DEFAULT_GRID.size;
    const color = opts.color ?? DEFAULT_GRID.color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawEntity(ctx, entity, opts = {}) {
    const { x, y, radius = 20, color = '#00ff88', name } = entity;
    const showLabel = opts.showLabels !== false;

    ctx.save();

    // Glow
    if (opts.glow !== false) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
    }

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Label
    if (showLabel && name) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = opts.font ?? DEFAULT_FONT;
      ctx.textAlign = 'center';
      ctx.fillText(String(name).toUpperCase(), x, y - radius - 10);
    }

    ctx.restore();
  }

  function drawProjectile(ctx, projectile, opts = {}) {
    const { x, y, color = '#ffffff' } = projectile;
    ctx.save();
    if (opts.glow !== false) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
    }
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, opts.radius ?? 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function applyCamera(ctx, camera, width, height) {
    if (!camera || (camera.x === 0 && camera.y === 0)) return;
    ctx.translate(-camera.x + width / 2, -camera.y + height / 2);
  }

  /**
   * Draw full state to context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} state - { width, height, entities, projectiles, camera?, grid? }
   * @param {object} opts - { grid: true|false|{size,color}, showLabels, glow }
   */
  function draw(ctx, state, opts = {}) {
    const { width, height, entities = [], projectiles = [], camera } = state;
    const w = width ?? ctx.canvas.width;
    const h = height ?? ctx.canvas.height;

    ctx.save();

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Camera transform (if any)
    applyCamera(ctx, camera, w, h);

    // Layer 1: Grid
    if (opts.grid !== false) {
      const gridOpts = typeof opts.grid === 'object' ? opts.grid : {};
      drawGrid(ctx, w, h, gridOpts);
    }

    // Layer 2: Projectiles (behind entities)
    projectiles.forEach(p => drawProjectile(ctx, p, opts));

    // Layer 3: Entities
    entities.forEach(e => drawEntity(ctx, e, opts));

    ctx.restore();
  }

  /**
   * Create a DOT renderer bound to a canvas.
   * @param {HTMLCanvasElement} canvas
   * @returns {{ draw(state, opts?), resize(w, h) }}
   */
  function create(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('coffee.dot: canvas 2d context required');

    return {
      draw(state, drawOpts = {}) {
        const fullState = {
          width: canvas.width,
          height: canvas.height,
          ...state
        };
        draw(ctx, fullState, drawOpts);
      },

      resize(width, height) {
        canvas.width = width;
        canvas.height = height;
      },

      get ctx() { return ctx; },
      get canvas() { return canvas; }
    };
  }

  coffee.dot = {
    create,
    draw,
    drawGrid,
    drawEntity,
    drawProjectile
  };

  window.coffee = coffee;
})();
