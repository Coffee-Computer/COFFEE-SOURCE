/**
 * coffee.playAsteroidsGame — headless wrap/thrust shooter (no canvas, no DOM).
 * Pair with coffee.play + coffee.playShapes, or a raw RAF loop.
 *
 * coffee.playAsteroidsGame.create({ callbacks?, config? })
 *   → { step, getState, reset, initLevel, resize }
 *
 * step(dtMs, input)
 *   input.bounds { w, h } — playfield size (e.g. canvas dimensions)
 *   input.aimX, input.aimY — screen coords ship nose points toward
 *   input.keys — CUP-style object (lowercase: w, arrowup, a, d, arrowleft, arrowright)
 *   input.fireRequested — true for one frame to spawn a bullet (space / tap / click edge)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULTS = {
    friction: 0.99,
    shipThrust: 0.15,
    shipTurnSpeed: 0.08,
    bulletSpeed: 8,
    bulletMaxDistFrac: 0.7,
    maxBullets: 8,
    shipRadius: 12,
    bulletRadius: 2,
    invulnFrames: 120,
    spawnClearRadius: 150,
    initialLives: 3,
    initialAsteroidCount: 5,
    baseAsteroidRadius: 40
  };

  function wrapEntity(e, w, h) {
    const r = e.radius;
    if (e.x < -r) e.x = w + r;
    else if (e.x > w + r) e.x = -r;
    if (e.y < -r) e.y = h + r;
    else if (e.y > h + r) e.y = -r;
  }

  function makeAsteroid(x, y, radius, level, w, h) {
    const speed = (4 - level) * 0.8 + Math.random();
    const ang = Math.random() * Math.PI * 2;
    const vertCount = 8 + Math.floor(Math.random() * 5);
    const offsets = [];
    for (let i = 0; i < vertCount; i++) offsets.push(Math.random() * 0.4 + 0.8);
    return {
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      radius,
      level,
      vertCount,
      offsets
    };
  }

  function makeShip(cx, cy, cfg) {
    return {
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      radius: cfg.shipRadius,
      thrusting: false,
      invulnerable: cfg.invulnFrames
    };
  }

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const cb = (opts && opts.callbacks) || {};

    const s = {
      tick: 0,
      score: 0,
      lives: cfg.initialLives,
      gameOver: false,
      w: 800,
      h: 600,
      ship: null,
      asteroids: [],
      bullets: [],
      particles: []
    };

    function spawnAsteroids(count) {
      const ship = s.ship;
      if (!ship) return;
      for (let i = 0; i < count; i++) {
        let x;
        let y;
        let guard = 0;
        do {
          x = Math.random() * s.w;
          y = Math.random() * s.h;
          guard++;
        } while (Math.hypot(x - ship.x, y - ship.y) < cfg.spawnClearRadius && guard < 80);
        s.asteroids.push(makeAsteroid(x, y, cfg.baseAsteroidRadius, 3, s.w, s.h));
      }
    }

    function createExplosion(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2,
          life: 1,
          decay: 0.02 + Math.random() * 0.02,
          color
        });
      }
    }

    function initLevel() {
      s.ship = makeShip(s.w / 2, s.h / 2, cfg);
      s.asteroids = [];
      s.bullets = [];
      s.particles = [];
      spawnAsteroids(cfg.initialAsteroidCount);
    }

    function reset() {
      s.tick = 0;
      s.score = 0;
      s.lives = cfg.initialLives;
      s.gameOver = false;
      if (typeof cb.onScore === 'function') cb.onScore(0, { kind: 'reset' });
      if (typeof cb.onLives === 'function') cb.onLives(s.lives);
      initLevel();
    }

    function endGame() {
      s.gameOver = true;
      if (typeof cb.onGameOver === 'function') cb.onGameOver(s.score);
    }

    function step(dtMs, input) {
      s.tick++;
      const w = input.bounds.w;
      const h = input.bounds.h;
      s.w = w;
      s.h = h;
      const keys = input.keys || {};
      const k = (name) => !!keys[name];

      if (s.gameOver) return;

      const ship = s.ship;
      if (!ship) return;

      const aimX = input.aimX != null ? input.aimX : ship.x;
      const aimY = input.aimY != null ? input.aimY : ship.y;
      ship.angle = Math.atan2(aimY - ship.y, aimX - ship.x);

      if (k('w') || k('arrowup')) {
        ship.vx += Math.cos(ship.angle) * cfg.shipThrust;
        ship.vy += Math.sin(ship.angle) * cfg.shipThrust;
        ship.thrusting = true;
      } else {
        ship.thrusting = false;
      }

      if (k('a') || k('arrowleft')) ship.angle -= cfg.shipTurnSpeed;
      if (k('d') || k('arrowright')) ship.angle += cfg.shipTurnSpeed;

      ship.vx *= cfg.friction;
      ship.vy *= cfg.friction;
      if (ship.invulnerable > 0) ship.invulnerable--;

      ship.x += ship.vx;
      ship.y += ship.vy;
      wrapEntity(ship, w, h);

      if (input.fireRequested && s.bullets.length < cfg.maxBullets) {
        s.bullets.push({
          x: ship.x,
          y: ship.y,
          vx: Math.cos(ship.angle) * cfg.bulletSpeed,
          vy: Math.sin(ship.angle) * cfg.bulletSpeed,
          radius: cfg.bulletRadius,
          distTraveled: 0
        });
      }

      const maxBulletDist = w * cfg.bulletMaxDistFrac;
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        wrapEntity(b, w, h);
        b.distTraveled += cfg.bulletSpeed;
        if (b.distTraveled > maxBulletDist) s.bullets.splice(i, 1);
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        wrapEntity(a, w, h);

        if (ship.invulnerable <= 0) {
          if (Math.hypot(ship.x - a.x, ship.y - a.y) < ship.radius + a.radius) {
            createExplosion(ship.x, ship.y, '#00ffcc', 20);
            s.lives--;
            if (typeof cb.onLives === 'function') cb.onLives(s.lives);
            if (s.lives <= 0) {
              endGame();
              return;
            }
            s.ship = makeShip(w / 2, h / 2, cfg);
          }
        }

        let hit = false;
        for (let j = s.bullets.length - 1; j >= 0; j--) {
          const b = s.bullets[j];
          if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
            createExplosion(a.x, a.y, '#fff', 15);
            s.score += (4 - a.level) * 100;
            if (typeof cb.onScore === 'function') cb.onScore(s.score, { kind: 'asteroid', level: a.level });
            if (a.level > 1) {
              s.asteroids.push(makeAsteroid(a.x, a.y, a.radius / 2, a.level - 1, w, h));
              s.asteroids.push(makeAsteroid(a.x, a.y, a.radius / 2, a.level - 1, w, h));
            }
            s.asteroids.splice(i, 1);
            s.bullets.splice(j, 1);
            hit = true;
            break;
          }
        }
        if (hit) continue;
      }

      if (s.asteroids.length === 0 && !s.gameOver) {
        spawnAsteroids(Math.floor(s.score / 1000) + cfg.initialAsteroidCount);
      }
    }

    function getState() {
      return {
        tick: s.tick,
        score: s.score,
        lives: s.lives,
        gameOver: s.gameOver,
        ship: s.ship,
        asteroids: s.asteroids,
        bullets: s.bullets,
        particles: s.particles,
        bounds: { w: s.w, h: s.h }
      };
    }

    function resize(nw, nh) {
      s.w = nw;
      s.h = nh;
    }

    reset();

    return {
      step,
      getState,
      reset,
      initLevel,
      resize,
      config: cfg
    };
  }

  coffee.playAsteroidsGame = { create, DEFAULTS };
  window.coffee = coffee;
})();
