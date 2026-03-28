/**
 * coffee.playPlatformerGame — headless side-scroller tile platformer (no canvas, no DOM).
 * From MANNY1-POC: gravity, AABB tiles, camera, stomp enemies, goal / fall death.
 *
 * coffee.playPlatformerGame.create({ levelData, enemySpawns?, callbacks?, config? })
 *   → { step, getState, reset, config }
 *
 * step(dtMs, input)
 *   input.viewW, input.viewH — viewport (canvas) size; world height = rows * tileSize
 *   input.keys — CUP-style lowercase: arrowleft, arrowright, arrowup, a, d, w, ' '
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULTS = {
    tileSize: 40,
    gravity: 0.6,
    jumpForce: -12,
    walkSpeed: 4,
    mannyW: 30,
    mannyH: 38,
    enemyW: 30,
    enemyH: 30,
    enemySpeed: 1.5,
    stompBounceVy: -8,
    stompDist: 28,
    mannyStartX: 80,
    mannyStartY: 200
  };

  function cloneLevel(rows) {
    return rows.map(function (row) { return row.slice(); });
  }

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const cb = (opts && opts.callbacks) || {};
    const levelTemplate = opts && opts.levelData;
    if (!levelTemplate || !levelTemplate.length) {
      throw new Error('coffee.playPlatformerGame.create: levelData required');
    }

    const defaultSpawns = [
      { x: 400, y: 320 },
      { x: 700, y: 320 },
      { x: 1000, y: 320 }
    ];
    const spawnList = (opts && opts.enemySpawns) || defaultSpawns;

    const s = {
      levelData: null,
      rows: 0,
      cols: 0,
      cameraX: 0,
      score: 0,
      running: true,
      endTitle: '',
      manny: null,
      enemies: [],
      viewW: 800,
      viewH: 600
    };

    function makeManny() {
      return {
        x: cfg.mannyStartX,
        y: cfg.mannyStartY,
        vx: 0,
        vy: 0,
        width: cfg.mannyW,
        height: cfg.mannyH,
        onGround: false,
        facingRight: true
      };
    }

    function makeEnemy(sp) {
      return {
        x: sp.x,
        y: sp.y,
        vx: -cfg.enemySpeed,
        width: cfg.enemyW,
        height: cfg.enemyH,
        dead: false
      };
    }

    function endGame(title) {
      s.running = false;
      s.endTitle = title;
      if (typeof cb.onGameEnd === 'function') cb.onGameEnd(title, s.score);
    }

    function addScore(delta, detail) {
      s.score += delta;
      if (typeof cb.onScore === 'function') cb.onScore(s.score, detail || {});
    }

    function key(keys, a, b) {
      return !!(keys[a] || (b && keys[b]));
    }

    function updateManny(keys) {
      const m = s.manny;
      const T = cfg.tileSize;
      const levelData = s.levelData;

      if (key(keys, 'arrowleft', 'a')) {
        m.vx = -cfg.walkSpeed;
        m.facingRight = false;
      } else if (key(keys, 'arrowright', 'd')) {
        m.vx = cfg.walkSpeed;
        m.facingRight = true;
      } else {
        m.vx *= 0.8;
      }

      if ((key(keys, 'arrowup', 'w') || keys[' ']) && m.onGround) {
        m.vy = cfg.jumpForce;
        m.onGround = false;
      }

      m.vy += cfg.gravity;
      m.x += m.vx;
      m.y += m.vy;

      checkMannyCollisions();

      if (m.y > s.viewH) endGame('FELL OFF!');
    }

    function checkMannyCollisions() {
      const m = s.manny;
      const T = cfg.tileSize;
      const levelData = s.levelData;
      const left = Math.floor(m.x / T);
      const right = Math.floor((m.x + m.width) / T);
      const top = Math.floor(m.y / T);
      const bottom = Math.floor((m.y + m.height) / T);

      m.onGround = false;

      for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
          if (levelData[r] && levelData[r][c] > 0) {
            const tileType = levelData[r][c];
            const tileX = c * T;
            const tileY = r * T;

            if (m.x < tileX + T && m.x + m.width > tileX &&
                m.y < tileY + T && m.y + m.height > tileY) {
              if (tileType === 5) {
                endGame('LEVEL CLEAR!');
                return;
              }

              if (m.vy > 0 && m.y + m.height - m.vy <= tileY) {
                m.y = tileY - m.height;
                m.vy = 0;
                m.onGround = true;
              } else if (m.vy < 0 && m.y - m.vy >= tileY + T) {
                m.y = tileY + T;
                m.vy = 0;
                if (tileType === 3) addScore(100, { kind: 'mystery' });
              }

              if (m.vx > 0 && m.x + m.width - m.vx <= tileX) {
                m.x = tileX - m.width;
              } else if (m.vx < 0 && m.x - m.vx >= tileX + T) {
                m.x = tileX + T;
              }
            }
          }
        }
      }
    }

    function updateEnemies() {
      const T = cfg.tileSize;
      const levelData = s.levelData;
      const m = s.manny;

      for (let i = 0; i < s.enemies.length; i++) {
        const e = s.enemies[i];
        if (e.dead) continue;
        e.x += e.vx;

        const c = Math.floor((e.vx > 0 ? e.x + e.width : e.x) / T);
        const r = Math.floor((e.y + e.height + 2) / T);
        if (!levelData[r] || levelData[r][c] === 0) {
          e.vx *= -1;
        }

        const ecx = e.x + e.width / 2;
        const ecy = e.y + e.height / 2;
        const mcx = m.x + m.width / 2;
        const mcy = m.y + m.height * 0.5;
        const dist = Math.hypot(ecx - mcx, ecy - mcy);

        if (dist < cfg.stompDist) {
          if (m.vy > 0 && m.y < e.y) {
            e.dead = true;
            m.vy = cfg.stompBounceVy;
            addScore(200, { kind: 'stomp' });
          } else {
            endGame('STOMPED!');
            return;
          }
        }
      }
    }

    function reset() {
      s.levelData = cloneLevel(levelTemplate);
      s.rows = s.levelData.length;
      s.cols = s.levelData[0] ? s.levelData[0].length : 0;
      s.cameraX = 0;
      s.score = 0;
      s.running = true;
      s.endTitle = '';
      s.manny = makeManny();
      s.enemies = spawnList.map(function (sp) { return makeEnemy(sp); });
      if (typeof cb.onScore === 'function') cb.onScore(0, { kind: 'reset' });
    }

    function step(dtMs, input) {
      const keys = input.keys || {};
      s.viewW = input.viewW;
      s.viewH = input.viewH;

      if (!s.running) return;

      updateManny(keys);
      if (!s.running) return;

      updateEnemies();

      const m = s.manny;
      if (m.x > s.viewW / 2) {
        s.cameraX = m.x - s.viewW / 2;
      }
    }

    function getState() {
      return {
        running: s.running,
        endTitle: s.endTitle,
        score: s.score,
        cameraX: s.cameraX,
        viewW: s.viewW,
        viewH: s.viewH,
        tileSize: cfg.tileSize,
        levelData: s.levelData,
        rows: s.rows,
        cols: s.cols,
        manny: s.manny,
        enemies: s.enemies
      };
    }

    reset();

    return {
      step,
      getState,
      reset,
      config: cfg
    };
  }

  coffee.playPlatformerGame = { create, DEFAULTS };
  window.coffee = coffee;
})();
