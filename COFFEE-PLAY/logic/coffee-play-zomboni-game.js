/**
 * coffee.playZomboniGame — headless top-down zombie wave shooter (no canvas, no DOM).
 * From ZOMBONI1-POC: waves, aim, ammo + timed reload, bullets, chase AI, contact damage.
 *
 * coffee.playZomboniGame.create({ callbacks?, config? })
 *   → { step, getState, reset }
 *
 * step(dtMs, input)
 *   viewW, viewH, aimX, aimY, keys (CUP lowercase)
 *   shootHeld — true while firing (mouse down); fire rate still enforced
 *   reloadOnRelease — true the frame R goes from pressed → released (POC: keyup reload)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULTS = {
    playerSize: 18,
    playerSpeed: 3.5,
    maxHp: 100,
    maxAmmo: 15,
    reloadTimeMs: 1200,
    fireRateMs: 150,
    bulletSpeed: 12,
    bulletSpawnDist: 20,
    bulletLifeFrames: 100,
    bulletRadius: 3,
    contactDamage: 0.5,
    enemiesPerWaveBase: 5,
    enemiesPerWaveScale: 3,
    spawnMargin: 50
  };

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const cb = (opts && opts.callbacks) || {};

    const s = {
      active: true,
      score: 0,
      wave: 1,
      enemies: [],
      bullets: [],
      particles: [],
      player: null,
      viewW: 800,
      viewH: 600
    };

    function makePlayer(cx, cy) {
      return {
        x: cx,
        y: cy,
        size: cfg.playerSize,
        speed: cfg.playerSpeed,
        hp: cfg.maxHp,
        maxHp: cfg.maxHp,
        angle: 0,
        ammo: cfg.maxAmmo,
        maxAmmo: cfg.maxAmmo,
        reloading: false,
        reloadEndAt: 0,
        lastFire: 0,
        fireRate: cfg.fireRateMs
      };
    }

    function notifyHud() {
      const p = s.player;
      if (typeof cb.onHud === 'function') {
        cb.onHud({
          hp: p.hp,
          score: s.score,
          wave: s.wave,
          ammo: p.ammo,
          reloading: p.reloading
        });
      }
    }

    function endGame() {
      s.active = false;
      if (typeof cb.onGameOver === 'function') cb.onGameOver(s.wave, s.score);
    }

    function spawnEnemy() {
      const w = s.viewW;
      const h = s.viewH;
      const m = cfg.spawnMargin;
      let x;
      let y;
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -m : w + m;
        y = Math.random() * h;
      } else {
        x = Math.random() * w;
        y = Math.random() > 0.5 ? -m : h + m;
      }
      const wave = s.wave;
      s.enemies.push({
        x,
        y,
        speed: 1 + Math.random() + wave * 0.1,
        hp: 2 + Math.floor(wave / 3),
        size: 16,
        color: 'hsl(' + (90 + Math.random() * 30) + ', 40%, 40%)'
      });
    }

    function startWave() {
      const n = cfg.enemiesPerWaveBase + s.wave * cfg.enemiesPerWaveScale;
      for (let i = 0; i < n; i++) spawnEnemy();
      if (typeof cb.onWave === 'function') cb.onWave(s.wave);
      notifyHud();
    }

    function createExplosion(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        s.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
          color
        });
      }
    }

    function tryReload(now) {
      const p = s.player;
      if (p.reloading || p.ammo === p.maxAmmo) return;
      p.reloading = true;
      p.reloadEndAt = now + cfg.reloadTimeMs;
      if (typeof cb.onReloading === 'function') cb.onReloading(true);
      notifyHud();
    }

    function finishReloadIfNeeded(now) {
      const p = s.player;
      if (p.reloading && now >= p.reloadEndAt) {
        p.reloading = false;
        p.ammo = p.maxAmmo;
        if (typeof cb.onReloading === 'function') cb.onReloading(false);
        notifyHud();
      }
    }

    function tryFire(now) {
      if (!s.active) return;
      const p = s.player;
      if (p.reloading || p.ammo <= 0) return;
      if (now - p.lastFire < p.fireRate) return;

      const ang = p.angle;
      s.bullets.push({
        x: p.x + Math.cos(ang) * cfg.bulletSpawnDist,
        y: p.y + Math.sin(ang) * cfg.bulletSpawnDist,
        vx: Math.cos(ang) * cfg.bulletSpeed,
        vy: Math.sin(ang) * cfg.bulletSpeed,
        life: cfg.bulletLifeFrames
      });

      p.ammo--;
      p.lastFire = now;
      notifyHud();

      if (p.ammo === 0) tryReload(now);
    }

    function key(keys, a, b) {
      return !!(keys[a] || (b && keys[b]));
    }

    function step(dtMs, input) {
      const keys = (input && input.keys) || {};
      const now = (input && input.now != null) ? input.now : Date.now();
      s.viewW = (input && input.viewW) || s.viewW;
      s.viewH = (input && input.viewH) || s.viewH;

      if (!s.active) return;

      finishReloadIfNeeded(now);

      if (input && input.reloadOnRelease) {
        tryReload(now);
      }

      const p = s.player;
      const w = s.viewW;
      const h = s.viewH;

      p.angle = Math.atan2(
        (input && input.aimY != null ? input.aimY : p.y) - p.y,
        (input && input.aimX != null ? input.aimX : p.x) - p.x
      );

      let mx = 0;
      let my = 0;
      if (key(keys, 'w', 'arrowup')) my -= p.speed;
      if (key(keys, 's', 'arrowdown')) my += p.speed;
      if (key(keys, 'a', 'arrowleft')) mx -= p.speed;
      if (key(keys, 'd', 'arrowright')) mx += p.speed;

      if (mx !== 0 && my !== 0) {
        const f = 0.707;
        mx *= f;
        my *= f;
      }

      p.x = Math.max(p.size, Math.min(w - p.size, p.x + mx));
      p.y = Math.max(p.size, Math.min(h - p.size, p.y + my));

      if (input && input.shootHeld) {
        tryFire(now);
      }

      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        if (b.x < 0 || b.x > w || b.y < 0 || b.y > h || b.life <= 0) {
          s.bullets.splice(i, 1);
          continue;
        }

        let hit = false;
        for (let j = s.enemies.length - 1; j >= 0; j--) {
          const e = s.enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.size) {
            e.hp--;
            createExplosion(b.x, b.y, '#ffff00', 3);
            s.bullets.splice(i, 1);
            hit = true;

            if (e.hp <= 0) {
              createExplosion(e.x, e.y, e.color, 12);
              s.enemies.splice(j, 1);
              s.score += 50;
              if (typeof cb.onScore === 'function') cb.onScore(s.score);
            }
            break;
          }
        }
        if (hit) continue;
      }

      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const e = s.enemies[i];
        const ang = Math.atan2(p.y - e.y, p.x - e.x);
        e.x += Math.cos(ang) * e.speed;
        e.y += Math.sin(ang) * e.speed;

        if (Math.hypot(e.x - p.x, e.y - p.y) < p.size + e.size) {
          p.hp -= cfg.contactDamage;
          createExplosion(p.x, p.y, '#ff0000', 1);
          if (p.hp <= 0) {
            p.hp = 0;
            notifyHud();
            endGame();
            return;
          }
        }
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= pt.decay;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      if (s.enemies.length === 0) {
        s.wave++;
        startWave();
      }

      notifyHud();
    }

    function getState() {
      return {
        active: s.active,
        score: s.score,
        wave: s.wave,
        player: { ...s.player },
        enemies: s.enemies.map(function (e) { return { ...e }; }),
        bullets: s.bullets.map(function (b) { return { ...b }; }),
        particles: s.particles.map(function (p) { return { ...p }; }),
        viewW: s.viewW,
        viewH: s.viewH
      };
    }

    function reset(viewW, viewH) {
      if (viewW != null) s.viewW = viewW;
      if (viewH != null) s.viewH = viewH;
      s.active = true;
      s.score = 0;
      s.wave = 1;
      s.enemies = [];
      s.bullets = [];
      s.particles = [];
      s.player = makePlayer(s.viewW / 2, s.viewH / 2);
      if (typeof cb.onReloading === 'function') cb.onReloading(false);
      startWave();
      if (typeof cb.onScore === 'function') cb.onScore(0);
      notifyHud();
    }

    s.player = makePlayer(s.viewW / 2, s.viewH / 2);

    return {
      step,
      getState,
      reset,
      config: cfg
    };
  }

  coffee.playZomboniGame = { create, DEFAULTS };
  window.coffee = coffee;
})();
