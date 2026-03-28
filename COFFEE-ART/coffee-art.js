/**
 * coffee.art — Renderer for generative art drawables.
 * Consumes drawables from FORGE, draws to canvas.
 *
 * coffee.art.create(canvas) → { draw(drawables), resize(w, h) }
 * coffee.art.draw(ctx, drawables) — one-shot draw
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function draw(ctx, drawables) {
    for (const d of drawables) {
      if (d.type === 'fill') {
        ctx.fillStyle = d.style;
        ctx.fillRect(d.x ?? 0, d.y ?? 0, d.w ?? ctx.canvas.width, d.h ?? ctx.canvas.height);
      } else if (d.type === 'line') {
        ctx.beginPath();
        ctx.strokeStyle = d.strokeStyle ?? '#fff';
        ctx.lineWidth = d.lineWidth ?? 1;
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.stroke();
      } else if (d.type === 'circle') {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r ?? 2, 0, Math.PI * 2);
        if (d.fillStyle) {
          ctx.fillStyle = d.fillStyle;
          ctx.fill();
        }
        if (d.strokeStyle) {
          ctx.strokeStyle = d.strokeStyle;
          ctx.stroke();
        }
      } else if (d.type === 'rect') {
        if (d.fillStyle) {
          ctx.fillStyle = d.fillStyle;
          ctx.fillRect(d.x, d.y, d.w, d.h);
        }
        if (d.strokeStyle) {
          ctx.strokeStyle = d.strokeStyle;
          ctx.strokeRect(d.x, d.y, d.w, d.h);
        }
      }
    }
  }

  function create(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('coffee.art: canvas 2d context required');

    return {
      draw(drawables) {
        draw(ctx, drawables);
      },
      resize(w, h) {
        canvas.width = w;
        canvas.height = h;
      },
      get ctx() { return ctx; },
      get canvas() { return canvas; }
    };
  }

  coffee.art = {
    create,
    draw
  };

  window.coffee = coffee;
})();
