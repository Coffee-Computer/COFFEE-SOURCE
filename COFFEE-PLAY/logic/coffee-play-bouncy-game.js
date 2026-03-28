/**
 * coffee.playBouncyGame — headless stacker physics (no canvas, no DOM).
 * From BOUNCY1-POC: AABB boxes, floor, pairwise resolution, sub-steps, camera follow, preview + drop delay.
 *
 * coffee.playBouncyGame.create({ callbacks?, config? })
 *   → { step, getState, setPreviewX, tryDrop, reset, config }
 *
 * step(dtMs, { viewW, viewH, now? })
 * setPreviewX(canvasX) — horizontal position of ghost (screen/canvas x, matches POC clientX)
 * tryDrop() — commit preview; next preview after previewDelayMs
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_COLORS = [
    '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'
  ];

  const DEFAULTS = {
    gravity: 0.25,
    friction: 0.98,
    bounce: 0.3,
    groundY: 150,
    slop: 0.5,
    percent: 0.4,
    subSteps: 2,
    cameraLerp: 0.05,
    previewYOffset: 100,
    previewDelayMs: 350,
    cullMarginX: 200,
    cullMaxY: 1000,
    minW: 40,
    maxW: 100,
    minH: 30,
    maxH: 60,
    colors: DEFAULT_COLORS,
    defaultViewW: 800,
    defaultViewH: 600
  };

  function cloneBlock(b) {
    return {
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      color: b.color,
      vx: b.vx,
      vy: b.vy,
      isResting: b.isResting
    };
  }

  function randomBlockSpec(cfg) {
    const w = cfg.minW + Math.random() * (cfg.maxW - cfg.minW);
    const h = cfg.minH + Math.random() * (cfg.maxH - cfg.minH);
    const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    return { w, h, color };
  }

  function onTopOfSomething(s, shapes, floorY, cfg) {
    if (Math.abs(s.y + s.h / 2 - floorY) < 1) return true;
    for (let i = 0; i < shapes.length; i++) {
      const other = shapes[i];
      if (other === s) continue;
      const dx = Math.abs(s.x - other.x);
      const dy = other.y - other.h / 2 - (s.y + s.h / 2);
      if (dx < (s.w + other.w) / 2 && dy >= 0 && dy < 1) return true;
    }
    return false;
  }

  function resolveCollision(a, b, cfg) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const halfW = (a.w + b.w) / 2;
    const halfH = (a.h + b.h) / 2;

    if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
      const overlapX = halfW - Math.abs(dx);
      const overlapY = halfH - Math.abs(dy);

      if (overlapX < overlapY) {
        const dir = dx > 0 ? 1 : -1;
        const correction = Math.max(overlapX - cfg.slop, 0) * cfg.percent * dir;
        a.x += correction;
        b.x -= correction;
        const relativeVelocity = a.vx - b.vx;
        if (relativeVelocity * dir < 0) {
          const j = -(1 + cfg.bounce) * relativeVelocity;
          a.vx += j * 0.5 * dir;
          b.vx -= j * 0.5 * dir;
        }
      } else {
        const dir = dy > 0 ? 1 : -1;
        const correction = Math.max(overlapY - cfg.slop, 0) * cfg.percent * dir;
        a.y += correction;
        b.y -= correction;
        const relativeVelocity = a.vy - b.vy;
        if (relativeVelocity * dir < 0) {
          const j = -(1 + cfg.bounce) * relativeVelocity;
          a.vy += j * 0.5 * dir;
          b.vy -= j * 0.5 * dir;
        }
        const frictionImpulse = (b.vx - a.vx) * 0.1;
        a.vx += frictionImpulse;
        b.vx -= frictionImpulse;
      }
    }
  }

  function updateBlock(s, shapes, height, cfg) {
    s.vy += cfg.gravity;
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= cfg.friction;
    s.vy *= cfg.friction;

    const floorY = height - cfg.groundY;
    if (s.y + s.h / 2 > floorY) {
      const penetration = s.y + s.h / 2 - floorY;
      s.y -= penetration;
      s.vy *= -cfg.bounce;
      s.vx *= 0.9;
      if (Math.abs(s.vy) < 0.5) s.vy = 0;
    }

    for (let i = 0; i < shapes.length; i++) {
      const other = shapes[i];
      if (other === s) continue;
      resolveCollision(s, other, cfg);
    }

    if (Math.abs(s.vx) < 0.01) s.vx = 0;
    if (Math.abs(s.vy) < 0.1 && onTopOfSomething(s, shapes, floorY, cfg)) s.vy = 0;
  }

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const cb = (opts && opts.callbacks) || {};

    const s = {
      shapes: [],
      preview: null,
      cameraY: 0,
      pendingPreviewUntil: 0,
      lastViewW: cfg.defaultViewW,
      lastViewH: cfg.defaultViewH,
      previewPointerX: cfg.defaultViewW / 2,
      now: 0
    };

    function spawnPreview(viewW, viewH) {
      const spec = randomBlockSpec(cfg);
      s.preview = {
        x: viewW / 2,
        y: cfg.previewYOffset + s.cameraY,
        w: spec.w,
        h: spec.h,
        color: spec.color,
        vx: 0,
        vy: 0,
        isResting: false
      };
      s.previewPointerX = s.preview.x;
    }

    function notifyDrop(count) {
      if (typeof cb.onDrop === 'function') cb.onDrop(count);
    }

    function step(dtMs, input) {
      const viewW = (input && input.viewW) || s.lastViewW;
      const viewH = (input && input.viewH) || s.lastViewH;
      s.lastViewW = viewW;
      s.lastViewH = viewH;
      const now = (input && input.now != null)
        ? input.now
        : (typeof performance !== 'undefined' ? performance.now() : Date.now());
      s.now = now;

      if (!s.preview && now >= s.pendingPreviewUntil) {
        spawnPreview(viewW, viewH);
      }

      if (s.preview) {
        s.preview.x = s.previewPointerX;
        s.preview.y = cfg.previewYOffset + s.cameraY;
      }

      const sub = cfg.subSteps;
      for (let stepIdx = 0; stepIdx < sub; stepIdx++) {
        for (let i = 0; i < s.shapes.length; i++) {
          updateBlock(s.shapes[i], s.shapes, viewH, cfg);
        }
      }

      const maxY = viewH + cfg.cullMaxY;
      s.shapes = s.shapes.filter(function (sh) {
        return sh.x > -cfg.cullMarginX &&
          sh.x < viewW + cfg.cullMarginX &&
          sh.y < maxY;
      });

      let highestPoint = viewH - cfg.groundY;
      for (let i = 0; i < s.shapes.length; i++) {
        const sh = s.shapes[i];
        if (sh.y - sh.h / 2 < highestPoint) highestPoint = sh.y - sh.h / 2;
      }
      const targetCameraY = Math.min(0, highestPoint - viewH * 0.5);
      s.cameraY += (targetCameraY - s.cameraY) * cfg.cameraLerp;
    }

    function setPreviewX(canvasX) {
      s.previewPointerX = canvasX;
    }

    function tryDrop() {
      if (!s.preview) return;
      const committed = cloneBlock(s.preview);
      s.shapes.push(committed);
      s.preview = null;
      const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
      s.pendingPreviewUntil = t + cfg.previewDelayMs;
      notifyDrop(s.shapes.length);
    }

    function getState() {
      return {
        shapes: s.shapes.map(cloneBlock),
        preview: s.preview ? cloneBlock(s.preview) : null,
        cameraY: s.cameraY,
        groundY: cfg.groundY,
        viewW: s.lastViewW,
        viewH: s.lastViewH,
        previewYOffset: cfg.previewYOffset,
        now: s.now
      };
    }

    function reset() {
      s.shapes = [];
      s.preview = null;
      s.cameraY = 0;
      s.pendingPreviewUntil = 0;
      spawnPreview(s.lastViewW, s.lastViewH);
    }

    spawnPreview(s.lastViewW, s.lastViewH);

    return {
      step,
      getState,
      setPreviewX,
      tryDrop,
      reset,
      config: cfg
    };
  }

  coffee.playBouncyGame = {
    create,
    DEFAULTS,
    DEFAULT_COLORS
  };
  window.coffee = coffee;
})();
