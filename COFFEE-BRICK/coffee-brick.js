/**
 * coffee.brick — Headless 2D physics engine.
 * No canvas, no deps. Pass state in, get state out.
 *
 * const world = coffee.brick.world({ width: 400, height: 300, gravity: 0.5 });
 * world.addBody(100, 50, 'circle');
 * world.step(1/60);
 * const bodies = world.getBodies();
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.brick = {
    /**
     * Create a physics world.
     * @param {object} opts - { width, height, gravity, friction, restitution }
     */
    world(opts = {}) {
      const {
        width = 400,
        height = 300,
        gravity = 0.5,
        friction = 0.98,
        restitution = 0.7
      } = opts;

      const bodies = [];
      const settings = { gravity, friction, restitution };
      const bounds = { width, height };

      function step() {
        const w = bounds.width;
        const h = bounds.height;

        bodies.forEach((b) => {
          b.vy += settings.gravity;
          b.vx *= settings.friction;
          b.vy *= settings.friction;
          b.x += b.vx;
          b.y += b.vy;

          if (b.type === 'circle') {
            if (b.y + b.radius > h) {
              b.y = h - b.radius;
              b.vy *= -settings.restitution;
              b.vx *= settings.friction;
            }
            if (b.y - b.radius < 0) {
              b.y = b.radius;
              b.vy *= -settings.restitution;
            }
            if (b.x + b.radius > w) {
              b.x = w - b.radius;
              b.vx *= -settings.restitution;
            }
            if (b.x - b.radius < 0) {
              b.x = b.radius;
              b.vx *= -settings.restitution;
            }
          } else {
            if (b.y + b.height > h) {
              b.y = h - b.height;
              b.vy *= -settings.restitution;
              b.vx *= settings.friction;
            }
            if (b.y < 0) {
              b.y = 0;
              b.vy *= -settings.restitution;
            }
            if (b.x + b.width > w) {
              b.x = w - b.width;
              b.vx *= -settings.restitution;
            }
            if (b.x < 0) {
              b.x = 0;
              b.vx *= -settings.restitution;
            }
          }
        });
      }

      function addBody(x, y, type = 'box', bodyOpts = {}) {
        const b = {
          x: Number(x),
          y: Number(y),
          vx: (bodyOpts.vx ?? (Math.random() - 0.5) * 10),
          vy: (bodyOpts.vy ?? (Math.random() - 0.5) * 10),
          type: type === 'circle' ? 'circle' : 'box',
          radius: bodyOpts.radius ?? 20 + Math.random() * 20,
          width: bodyOpts.width ?? 40 + Math.random() * 40,
          height: bodyOpts.height ?? 40 + Math.random() * 40,
          color: bodyOpts.color ?? `hsl(${Math.random() * 360}, 60%, 60%)`
        };
        bodies.push(b);
        return b;
      }

      return {
        addBody,
        step,
        getBodies: () => bodies,
        clear: () => bodies.length = 0,
        get settings() { return settings; },
        set settings(s) { Object.assign(settings, s); },
        get bounds() { return bounds; },
        set bounds(b) { Object.assign(bounds, b); }
      };
    }
  };

  window.coffee = coffee;
})();
