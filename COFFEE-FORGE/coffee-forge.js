/**
 * coffee.forge — Compile/parse/engine for generative art.
 * Loads presets from COIL, runs engines, produces drawables.
 * Drawable format: { type: 'fill'|'line'|'circle'|'rect', ... }
 *
 * coffee.forge.create(preset) → { step(w, h) → drawables }
 * coffee.forge.register(name, engine) — add engine
 * coffee.forge.engines — param schemas for UI
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const noise = (x, y, seed) => Math.sin(x * 0.01 + seed) * Math.cos(y * 0.01 + seed);

  const ENGINES = {
    flow: {
      params: {
        complexity: { label: 'Turbulence', min: 0.001, max: 0.02, step: 0.001, val: 0.005 },
        speed: { label: 'Viscosity', min: 0.1, max: 5, step: 0.1, val: 1.2 },
        hue: { label: 'Palette Shift', min: 0, max: 360, step: 1, val: 30 },
        zoom: { label: 'Line Weight', min: 0.5, max: 10, step: 0.5, val: 1 }
      },
      init(runner) {
        runner._particles = [];
      },
      step(runner, w, h) {
        const s = runner.state;
        const p = runner._particles;
        const out = [];

        out.push({ type: 'fill', x: 0, y: 0, w, h, style: 'rgba(5, 5, 5, 0.05)' });

        if (p.length < 500) {
          for (let i = 0; i < 5; i++) {
            p.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: 0, vy: 0,
              age: 0,
              maxAge: 50 + Math.random() * 150,
              h: (s.hue + Math.random() * 40) % 360
            });
          }
        }

        for (let i = p.length - 1; i >= 0; i--) {
          const pt = p[i];
          const angle = noise(pt.x * s.complexity * 100, pt.y * s.complexity * 100, s.seed) * Math.PI * 4;
          pt.vx = Math.cos(angle) * s.speed;
          pt.vy = Math.sin(angle) * s.speed;
          const x2 = pt.x + pt.vx;
          const y2 = pt.y + pt.vy;
          out.push({
            type: 'line',
            x1: pt.x, y1: pt.y, x2, y2,
            strokeStyle: `hsla(${pt.h}, 70%, 60%, ${1 - pt.age / pt.maxAge})`,
            lineWidth: s.zoom
          });
          pt.x = x2;
          pt.y = y2;
          pt.age++;
          if (pt.age > pt.maxAge || pt.x < 0 || pt.x > w || pt.y < 0 || pt.y > h) p.splice(i, 1);
        }
        return out;
      }
    },

    fractal: {
      params: {
        complexity: { label: 'Recursion Depth', min: 4, max: 12, step: 1, val: 8 },
        speed: { label: 'Sway Rate', min: 0.01, max: 0.1, step: 0.01, val: 0.03 },
        hue: { label: 'Base Hue', min: 0, max: 360, step: 1, val: 180 },
        zoom: { label: 'Angle Spread', min: 0.1, max: 1.5, step: 0.05, val: 0.5 }
      },
      init() {},
      step(runner, w, h) {
        const s = runner.state;
        const frame = runner._frame;
        const out = [];

        out.push({ type: 'fill', x: 0, y: 0, w, h, style: '#050505' });

        const recurse = (x, y, len, angle, depth) => {
          if (depth <= 0) return;
          const x2 = x + Math.cos(angle) * len;
          const y2 = y + Math.sin(angle) * len;
          const sway = Math.sin(frame * s.speed + depth) * s.zoom;
          out.push({
            type: 'line',
            x1: x, y1: y, x2, y2,
            strokeStyle: `hsla(${s.hue + depth * 15}, 70%, 60%, 0.8)`,
            lineWidth: depth * 0.5
          });
          recurse(x2, y2, len * 0.75, angle - 0.4 + sway, depth - 1);
          recurse(x2, y2, len * 0.75, angle + 0.4 + sway, depth - 1);
        };

        recurse(w / 2, h * 0.9, h * 0.25, -Math.PI / 2, s.complexity);
        return out;
      }
    },

    orbit: {
      params: {
        complexity: { label: 'Orbitals', min: 2, max: 20, step: 1, val: 8 },
        speed: { label: 'Angular Velocity', min: 0.1, max: 2, step: 0.1, val: 0.5 },
        hue: { label: 'Chromatic Sat', min: 0, max: 100, step: 1, val: 60 },
        zoom: { label: 'Radius', min: 10, max: 400, step: 10, val: 200 }
      },
      init() {},
      step(runner, w, h) {
        const s = runner.state;
        const frame = runner._frame;
        const cx = w / 2;
        const cy = h / 2;
        const out = [];

        out.push({ type: 'fill', x: 0, y: 0, w, h, style: 'rgba(5, 5, 5, 0.1)' });

        let prevPx, prevPy;
        for (let i = 0; i < s.complexity; i++) {
          const t = frame * s.speed * 0.05 * (i + 1);
          const r = s.zoom + Math.sin(t * 0.5) * 50;
          const px = cx + Math.cos(t) * r;
          const py = cy + Math.sin(t) * r;
          out.push({
            type: 'circle',
            x: px, y: py, r: 2,
            fillStyle: `hsla(${s.hue + i * 10}, ${s.hue > 0 ? 80 : 0}%, 60%, 0.8)`
          });
          if (i > 0) {
            out.push({
              type: 'line',
              x1: px, y1: py, x2: prevPx, y2: prevPy,
              strokeStyle: `hsla(${s.hue + i * 10}, 80%, 60%, 0.1)`,
              lineWidth: 1
            });
          }
          prevPx = px;
          prevPy = py;
        }
        return out;
      }
    },

    glitch: {
      params: {
        complexity: { label: 'Artifact Density', min: 1, max: 50, step: 1, val: 15 },
        speed: { label: 'Refresh Rate', min: 0.1, max: 2, step: 0.1, val: 0.5 },
        hue: { label: 'Glitch Hue', min: 0, max: 360, step: 1, val: 0 },
        zoom: { label: 'Extrusion', min: 1, max: 100, step: 5, val: 40 }
      },
      init() {},
      step(runner, w, h) {
        const s = runner.state;
        const frame = runner._frame;
        if (frame % Math.floor(10 / s.speed) !== 0) return runner._lastDrawables || [];

        const out = [];
        out.push({ type: 'fill', x: 0, y: 0, w, h, style: 'rgba(5, 5, 5, 0.2)' });

        for (let i = 0; i < s.complexity; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const rw = Math.random() * s.zoom * 2;
          const rh = Math.random() * 4;
          out.push({
            type: 'rect',
            x, y, w: rw, h: rh,
            fillStyle: `hsla(${s.hue + Math.random() * 50}, 90%, 50%, 0.6)`
          });
          if (Math.random() > 0.9) {
            out.push({
              type: 'rect',
              x: x - 10, y: y - 10, w: rw + 20, h: rh + 20,
              strokeStyle: '#fff',
              fillStyle: null
            });
          }
        }
        runner._lastDrawables = out;
        return out;
      }
    }
  };

  coffee.forge = {
    engines: ENGINES,

    register(name, engine) {
      ENGINES[name] = engine;
    },

    /**
     * Create a runner from a preset. Preset: { engine, params, seed? }
     * @returns {{ step(w, h) → drawables, state, reset() }}
     */
    create(preset) {
      const engineName = preset.engine;
      const engine = ENGINES[engineName];
      if (!engine) throw new Error(`coffee.forge: unknown engine ${engineName}`);

      const params = preset.params || {};
      const state = {
        complexity: params.complexity ?? engine.params.complexity?.val ?? 0.5,
        speed: params.speed ?? engine.params.speed?.val ?? 0.2,
        hue: params.hue ?? engine.params.hue?.val ?? 30,
        zoom: params.zoom ?? engine.params.zoom?.val ?? 1,
        seed: preset.seed ?? Math.random() * 1000
      };

      const runner = {
        state,
        _frame: 0,
        _particles: [],
        _lastDrawables: []
      };

      engine.init(runner);

      return {
        state,
        step(w, h) {
          runner._frame++;
          return engine.step(runner, w, h);
        },
        reset() {
          runner._frame = 0;
          runner._particles = [];
          runner._lastDrawables = [];
          engine.init(runner);
        }
      };
    }
  };

  window.coffee = coffee;
})();
