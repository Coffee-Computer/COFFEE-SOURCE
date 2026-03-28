/**
 * coffee.scene2d() — Declarative 2D scene. Load after coffee-ui.
 * Raw Canvas 2D. No external deps.
 *
 * coffee.scene2d({ shapes, background, custom, container, width, height })
 *
 * shapes: [{ type, x, y, ... }]
 *   type: 'rect' | 'circle' | 'line' | 'arc' | 'ellipse'
 * custom: (ctx) => {} — escape hatch; ctx = { canvas, ctx, width, height }
 * wrapper.scene2d — same ctx for later mutation
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.scene2d = function (opts = {}) {
    const {
      shapes = [],
      background = '#0a0a0a',
      custom: customFn,
      container: containerSel,
      width = 400,
      height = 300
    } = opts;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-coffee', 'scene2d');
    wrapper.style.cssText = 'position:relative;width:100%;min-height:' + height + 'px;aspect-ratio:' + width + '/' + height + ';background:' + background + ';border-radius:var(--coffee-radius-sm,8px);overflow:hidden';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    wrapper.appendChild(canvas);

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) {
      const err = document.createElement('div');
      err.style.cssText = 'padding:24px;color:#ef4444;background:#1a1a1a;border-radius:8px';
      err.textContent = 'coffee.scene2d: Canvas 2D not supported';
      return err;
    }

    function drawShape(spec) {
      const { type, fill, stroke, strokeWidth = 1 } = spec;
      if (fill) { ctx2d.fillStyle = fill; }
      if (stroke) { ctx2d.strokeStyle = stroke; ctx2d.lineWidth = strokeWidth; }

      if (type === 'rect') {
        const { x = 0, y = 0, width: w = 50, height: h = 50 } = spec;
        if (fill) ctx2d.fillRect(x, y, w, h);
        if (stroke) ctx2d.strokeRect(x, y, w, h);
      } else if (type === 'circle') {
        const { x = 0, y = 0, radius = 25 } = spec;
        ctx2d.beginPath();
        ctx2d.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) ctx2d.fill();
        if (stroke) ctx2d.stroke();
      } else if (type === 'line') {
        const { x1 = 0, y1 = 0, x2 = 50, y2 = 50 } = spec;
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
      } else if (type === 'arc') {
        const { x = 0, y = 0, radius = 25, startAngle = 0, endAngle = Math.PI * 2 } = spec;
        ctx2d.beginPath();
        ctx2d.arc(x, y, radius, startAngle, endAngle);
        if (fill) ctx2d.fill();
        if (stroke) ctx2d.stroke();
      } else if (type === 'ellipse') {
        const { x = 0, y = 0, radiusX = 40, radiusY = 20 } = spec;
        ctx2d.beginPath();
        ctx2d.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (fill) ctx2d.fill();
        if (stroke) ctx2d.stroke();
      } else if (type === 'path') {
        const pts = spec.points || [];
        if (pts.length < 2) return;
        ctx2d.beginPath();
        ctx2d.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx2d.lineTo(pts[i][0], pts[i][1]);
        if (fill) ctx2d.fill();
        if (stroke) ctx2d.stroke();
      }
    }

    const sceneCtx = { canvas, ctx: ctx2d, width, height, shapes };

    function render() {
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.fillStyle = background;
      ctx2d.fillRect(0, 0, w, h);

      for (const spec of shapes) {
        drawShape(spec);
      }
      if (typeof customFn === 'function') customFn(sceneCtx);
    }
    sceneCtx.render = render;

    render();
    wrapper.scene2d = sceneCtx;

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : width;
      const h = rect.height > 0 ? rect.height : height;
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        sceneCtx.width = w;
        sceneCtx.height = h;
        render();
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      if (!wrapper.isConnected) return;
      resize();
    }
    animate();
    window.addEventListener('resize', resize);

    if (containerSel) {
      const el = typeof containerSel === 'string' ? document.querySelector(containerSel) : containerSel;
      if (el) el.appendChild(wrapper);
      return wrapper;
    }
    return wrapper;
  };

  window.coffee = coffee;
})();
