/**
 * coffee.cup — Game logic framework (headless).
 * State, physics, collision, input. step(dt) → state.
 * No rendering. Outputs state for coffee.dot or other renderers.
 *
 * coffee.cup.create(opts) → instance
 * instance.spawn(props) → entity
 * instance.shoot(origin, targetX, targetY) → projectile
 * instance.step(dt) → state
 * instance.keys, instance.mouse — input
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function getDistance(a, b) {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  function checkCollision(a, b, aRadius, bRadius) {
    const ar = aRadius ?? a.radius ?? 20;
    const br = bRadius ?? b.radius ?? 20;
    return getDistance(a, b) < ar + br;
  }

  /**
   * Create a CUP game instance.
   * @param {object} opts - { width, height, friction, gravity }
   * @returns {object} CUP instance
   */
  function create(opts = {}) {
    const config = {
      friction: 0.92,
      gravity: 0,
      width: opts.width ?? 800,
      height: opts.height ?? 600,
      ...opts
    };

    const entities = [];
    const projectiles = [];
    const keys = {};
    const mouse = { x: 0, y: 0, down: false };

    // Input (browser only)
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
      window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mousedown', () => { mouse.down = true; });
      window.addEventListener('mouseup', () => { mouse.down = false; });
    }

    const instance = {
      config,
      entities,
      projectiles,
      keys,
      mouse,

      spawn(props = {}) {
        const entity = {
          id: Math.random().toString(36).substr(2, 9),
          x: props.x ?? config.width / 2,
          y: props.y ?? config.height / 2,
          vx: 0,
          vy: 0,
          radius: props.radius ?? 20,
          speed: props.speed ?? 0.8,
          maxSpeed: props.maxSpeed ?? 8,
          health: 100,
          score: 0,
          color: props.color ?? '#00ff88',
          name: props.name ?? 'Entity',
          tags: props.tags ?? [],
          lastShot: 0,
          ...props
        };
        entities.push(entity);
        return entity;
      },

      shoot(origin, targetX, targetY, speed = 15) {
        const angle = Math.atan2(targetY - origin.y, targetX - origin.x);
        projectiles.push({
          x: origin.x + Math.cos(angle) * (origin.radius ?? 20),
          y: origin.y + Math.sin(angle) * (origin.radius ?? 20),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: origin.color ?? '#ffffff',
          owner: origin.id,
          life: 100,
          radius: 3
        });
      },

      removeEntity(entity) {
        const i = entities.indexOf(entity);
        if (i >= 0) entities.splice(i, 1);
      },

      removeProjectile(proj) {
        const i = projectiles.indexOf(proj);
        if (i >= 0) projectiles.splice(i, 1);
      },

      getDistance,
      checkCollision(e1, e2) {
        return checkCollision(e1, e2);
      },

      /**
       * Step simulation. Mutates entities/projectiles, returns state snapshot.
       * @param {number} dt - Delta time (ms). Optional; used for fixed-step if needed.
       * @returns {object} State { width, height, entities, projectiles }
       */
      step(dt = 16) {
        const { friction, gravity, width, height } = config;

        // Projectile movement & removal
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;

          if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
            projectiles.splice(i, 1);
          }
        }

        // Entity physics
        entities.forEach(ent => {
          ent.vx *= friction;
          ent.vy *= friction;
          ent.vy += gravity;
          ent.x += ent.vx;
          ent.y += ent.vy;

          // Bounds (bounce)
          if (ent.x < ent.radius) {
            ent.x = ent.radius;
            ent.vx *= -0.5;
          }
          if (ent.x > width - ent.radius) {
            ent.x = width - ent.radius;
            ent.vx *= -0.5;
          }
          if (ent.y < ent.radius) {
            ent.y = ent.radius;
            ent.vy *= -0.5;
          }
          if (ent.y > height - ent.radius) {
            ent.y = height - ent.radius;
            ent.vy *= -0.5;
          }
        });

        return {
          width,
          height,
          entities: [...entities],
          projectiles: [...projectiles]
        };
      },

      /**
       * Get current state without stepping. Read-only snapshot.
       */
      getState() {
        return {
          width: config.width,
          height: config.height,
          entities: [...entities],
          projectiles: [...projectiles]
        };
      },

      resize(w, h) {
        config.width = w;
        config.height = h;
      }
    };

    return instance;
  }

  coffee.cup = {
    create,
    getDistance,
    checkCollision
  };

  window.coffee = coffee;
})();
