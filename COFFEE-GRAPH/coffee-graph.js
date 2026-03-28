/**
 * CoffeeGraph.js — Canvas-based charts for the Coffee stack.
 * Extends window.coffee. Load after coffee-control.js and coffee-ui.js.
 * API: coffee.graph({ target, type, roast, data, labels, animate, onClick, onHover })
 * Features: tooltips, responsiveness, x-axis labels, animation, click, hover.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.graphPalettes = {
    light:    { fill: '#d7ccc8', stroke: '#a1887f', accent: '#8d6e63' },
    medium:   { fill: '#a1887f', stroke: '#6d4c41', accent: '#5d4037' },
    dark:     { fill: '#5d4037', stroke: '#3e2723', accent: '#263238' },
    espresso: { fill: '#3e2723', stroke: '#1b0000', accent: '#000000' }
  };

  const _chartState = new WeakMap();

  function ease(t, type) {
    if (type === 'linear') return t;
    if (type === 'easeIn') return t * t;
    if (type === 'easeInOut') return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    return 1 - (1 - t) * (1 - t);
  }

  function getCanvasCoords(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function ensureTooltip() {
    let tip = document.getElementById('coffee-graph-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'coffee-graph-tooltip';
      tip.style.cssText = 'position:fixed;display:none;padding:8px 12px;background:rgba(0,0,0,0.85);color:#fff;font-size:12px;border-radius:8px;pointer-events:none;z-index:9999;font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
      document.body.appendChild(tip);
    }
    return tip;
  }

  function hitTest(bounds, x, y) {
    for (let i = 0; i < bounds.length; i++) {
      const b = bounds[i];
      if (b.w !== undefined) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
      } else {
        const dx = x - b.x, dy = y - b.y;
        if (dx * dx + dy * dy <= (b.r || 10) * (b.r || 10)) return b;
      }
    }
    return null;
  }

  function drawChart(canvas, config, opts) {
    opts = opts || {};
    const progress = opts.progress !== undefined ? opts.progress : 1;
    const hoveredIndex = opts.hoveredIndex !== undefined ? opts.hoveredIndex : -1;

    const ctx = canvas.getContext('2d');
    const data = config.data || [];
    const type = config.type || 'bar';
    const roast = coffee.graphPalettes[config.roast] || coffee.graphPalettes.medium;
    const labels = config.labels || [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const labelHeight = labels.length ? 24 : 0;
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2) - labelHeight;
    const maxVal = Math.max(...data, 1);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    let bounds = [];
    if (type === 'bar') {
      bounds = coffee._brewBar(ctx, data, labels, padding, chartWidth, chartHeight, maxVal, roast, progress, hoveredIndex);
    } else if (type === 'line') {
      bounds = coffee._brewLine(ctx, data, labels, padding, chartWidth, chartHeight, maxVal, roast, progress, hoveredIndex);
    }

    if (labels.length) {
      const barWidth = (chartWidth / data.length) * 0.8;
      const spacing = (chartWidth / data.length) * 0.2;
      ctx.fillStyle = '#777';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      labels.forEach((label, i) => {
        const x = padding + (i * (barWidth + spacing)) + (spacing / 2) + (barWidth / 2);
        const y = padding + chartHeight + 16;
        ctx.fillText(String(label), x, y);
      });
    }

    return bounds;
  }

  coffee.graph = function (args) {
    const canvas = typeof args.target === 'string' ? document.getElementById(args.target) : args.target;
    if (!canvas) return console.error('CoffeeGraph: Missing canvas (target)');

    const rect = canvas.getBoundingClientRect();
    let w = Math.floor(rect.width);
    let h = Math.floor(rect.height);
    if (!w || !h) { w = 400; h = 300; }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const config = { ...args };
    const animate = config.animate !== false;
    const duration = config.animateDuration || 400;
    const easing = config.animateEasing || 'easeOut';
    const tip = ensureTooltip();

    function runAnimation() {
      const start = performance.now();
      function frame(now) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const p = ease(t, easing);
        const bounds = drawChart(canvas, config, { progress: p });
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          setupListeners(bounds);
        }
      }
      requestAnimationFrame(frame);
    }

    function setupListeners(bounds) {
      const state = _chartState.get(canvas);
      state.bounds = bounds;

      function redraw() {
        const s = _chartState.get(canvas);
        if (s) s.bounds = drawChart(canvas, s.config, { hoveredIndex: s.hoveredIndex });
      }

      function onMouseMove(e) {
        const s = _chartState.get(canvas);
        const { x, y } = getCanvasCoords(canvas, e.clientX, e.clientY);
        const hit = hitTest(s.bounds, x, y);
        const prevHit = state.hoveredIndex;
        const newIndex = hit ? hit.index : -1;

        if (hit) {
          tip.textContent = hit.label != null ? `${hit.label}: ${hit.value}` : String(hit.value);
          tip.style.display = 'block';
          tip.style.left = (e.clientX + 12) + 'px';
          tip.style.top = (e.clientY + 12) + 'px';
        } else {
          tip.style.display = 'none';
        }

        if (newIndex !== prevHit) {
          state.hoveredIndex = newIndex;
          redraw();
          if (config.onHover) config.onHover(hit ? { index: hit.index, value: hit.value, label: hit.label } : null, !!hit);
        }
      }

      function onMouseLeave() {
        tip.style.display = 'none';
        if (state.hoveredIndex !== -1) {
          state.hoveredIndex = -1;
          redraw();
          if (config.onHover) config.onHover(null, false);
        }
      }

      function onClick(e) {
        const { x, y } = getCanvasCoords(canvas, e.clientX, e.clientY);
        const hit = hitTest(bounds, x, y);
        if (hit && config.onClick) config.onClick({ index: hit.index, value: hit.value, label: hit.label });
      }

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
      canvas.addEventListener('click', onClick);

      const removeListeners = () => {
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseleave', onMouseLeave);
        canvas.removeEventListener('click', onClick);
      };

      state.listeners = [removeListeners];
    }

    const state = _chartState.get(canvas);
    if (state) state.listeners.forEach(rm => rm());

    _chartState.set(canvas, {
      config,
      bounds: [],
      hoveredIndex: -1,
      listeners: []
    });

    if (animate && duration > 0) {
      runAnimation();
    } else {
      const bounds = drawChart(canvas, config);
      setupListeners(bounds);
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width) || 400;
        const h = Math.floor(rect.height) || 300;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          const s = _chartState.get(canvas);
          if (s) {
            s.bounds = drawChart(canvas, s.config, { hoveredIndex: s.hoveredIndex });
          }
        }
      });
      ro.observe(canvas);
      _chartState.get(canvas).listeners.push(() => ro.disconnect());
    }
  };

  coffee._brewBar = function (ctx, data, labels, padding, width, height, max, roast, progress, hoveredIndex) {
    const barWidth = (width / data.length) * 0.8;
    const spacing = (width / data.length) * 0.2;
    const bounds = [];

    data.forEach((val, i) => {
      const fullHeight = (val / max) * height;
      const barHeight = fullHeight * progress;
      const x = padding + (i * (barWidth + spacing)) + (spacing / 2);
      const y = padding + height - barHeight;

      const isHovered = i === hoveredIndex;
      const scale = isHovered ? 1.05 : 1;
      const fillColor = isHovered ? roast.accent : roast.fill;

      ctx.save();
      ctx.translate(x + barWidth / 2, y + barHeight);
      ctx.scale(scale, scale);
      ctx.translate(-(x + barWidth / 2), -(y + barHeight));

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeStyle = roast.stroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barWidth, barHeight);

      ctx.fillStyle = '#777';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barWidth / 2, y - 5);

      ctx.restore();

      const bw = isHovered ? barWidth * scale : barWidth;
      const bh = isHovered ? fullHeight * scale : fullHeight;
      const bx = isHovered ? x - (barWidth * (scale - 1) / 2) : x;
      const by = isHovered ? y - (fullHeight * (scale - 1)) : y;
      bounds.push({ x: bx, y: by, w: bw, h: bh, index: i, value: val, label: labels[i] });
    });
    return bounds;
  };

  coffee._brewLine = function (ctx, data, labels, padding, width, height, max, roast, progress, hoveredIndex) {
    const bounds = [];
    const n = data.length;
    const segments = Math.max(n - 1, 1);
    const targetSeg = progress * segments;
    const fullSegs = Math.floor(targetSeg);
    const frac = targetSeg - fullSegs;

    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = padding + (i * (width / segments));
      const y = padding + height - ((data[i] / max) * height);
      pts.push({ x, y });
    }

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = roast.accent;
    ctx.lineJoin = 'round';
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i <= fullSegs && i < n; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    if (frac > 0 && fullSegs + 1 < n) {
      const p0 = pts[fullSegs];
      const p1 = pts[fullSegs + 1];
      ctx.lineTo(p0.x + (p1.x - p0.x) * frac, p0.y + (p1.y - p0.y) * frac);
    }
    ctx.stroke();

    data.forEach((val, i) => {
      const pt = pts[i];
      const isHovered = i === hoveredIndex;
      const r = isHovered ? 8 : 5;
      const ry = isHovered ? 10 : 7;
      ctx.fillStyle = isHovered ? roast.accent : roast.stroke;
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, r, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      bounds.push({ x: pt.x, y: pt.y, r: 12, index: i, value: val, label: labels[i] });
    });
    return bounds;
  };

  window.coffee = coffee;
})();
