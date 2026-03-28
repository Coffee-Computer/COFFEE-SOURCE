/**
 * coffee.playMazeGame — headless grid “Pac-ish” chase (no canvas, no DOM).
 * Pair with coffee.play + coffee.playShapes, or a raw RAF loop.
 *
 * coffee.playMazeGame.parseAsciiMaze(rawLines, opts?)
 * coffee.playMazeGame.readIntent(keys)  // CUP-style keys object
 * coffee.playMazeGame.create({ raw, callbacks?, config? })
 *
 * instance.step(dtMs, { wdr, wdc })
 * instance.getState()
 * instance.layoutForCanvas(width, height, paddingCells?)
 * instance.reset()
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_GHOST_COLORS = ['#ff0000', '#ffb8ff', '#00ffff', '#ffa502'];

  /**
   * @param {string[]} rawLines — '#'=wall, '.'=pellet, 'o'=power, 'S'=start, 'G'=ghost
   */
  function parseAsciiMaze(rawLines, opts) {
    const ghostColors = (opts && opts.ghostColors) || DEFAULT_GHOST_COLORS;
    const rows = rawLines.length;
    const cols = rawLines[0] ? rawLines[0].length : 0;
    const walls = [];
    const pellets = [];
    let pr = 0;
    let pc = 0;
    const ghostsInit = [];

    for (let r = 0; r < rows; r++) {
      walls[r] = [];
      const line = rawLines[r];
      for (let c = 0; c < cols; c++) {
        const ch = line[c];
        walls[r][c] = ch === '#';
        if (ch === '.' || ch === 'o') pellets.push({ r, c, power: ch === 'o' });
        if (ch === 'S') {
          pr = r;
          pc = c;
        }
        if (ch === 'G') {
          ghostsInit.push({
            r: r + 0.5,
            c: c + 0.5,
            dr: 0,
            dc: 0,
            color: ghostColors[ghostsInit.length % ghostColors.length],
            scared: 0
          });
        }
      }
    }

    let ghostHome = { r: pr + 0.5, c: pc + 0.5 };
    if (ghostsInit.length) {
      let sr = 0;
      let sc = 0;
      ghostsInit.forEach(function (g) {
        sr += g.r;
        sc += g.c;
      });
      ghostHome = { r: sr / ghostsInit.length, c: sc / ghostsInit.length };
    }

    return {
      rows,
      cols,
      walls,
      pellets,
      pr,
      pc,
      ghostsInit,
      ghostHome
    };
  }

  function readIntent(keys) {
    let wdr = 0;
    let wdc = 0;
    if (!keys) return { wdr: 0, wdc: 0 };
    if (keys.arrowup || keys.w) wdr = -1;
    else if (keys.arrowdown || keys.s) wdr = 1;
    if (keys.arrowleft || keys.a) wdc = -1;
    else if (keys.arrowright || keys.d) wdc = 1;
    if (wdr !== 0 && wdc !== 0) wdc = 0;
    return { wdr, wdc };
  }

  function clonePellets(list) {
    return list.map(function (p) {
      return { r: p.r, c: p.c, power: !!p.power };
    });
  }

  function cloneGhosts(list) {
    return list.map(function (g) {
      return {
        r: g.r,
        c: g.c,
        dr: g.dr,
        dc: g.dc,
        color: g.color,
        scared: g.scared
      };
    });
  }

  /**
   * @param {object} opts
   * @param {string[]} opts.raw — ASCII maze lines
   * @param {object} [opts.callbacks]
   * @param {function(number):void} [opts.callbacks.onScore]
   * @param {function(number):void} [opts.callbacks.onLives]
   * @param {function():void} [opts.callbacks.onWin]
   * @param {function():void} [opts.callbacks.onGameOver]
   * @param {object} [opts.config]
   */
  function create(opts) {
    const parsed = parseAsciiMaze(opts.raw, opts);
    const cb = opts.callbacks || {};
    const cfg = Object.assign(
      {
        pacSpeed: 0.12,
        ghostSpeed: 0.055,
        powerMs: 6000,
        pointsPellet: 10,
        pointsPower: 50,
        pointsGhost: 200,
        invulnMs: 1800,
        lives: 3
      },
      opts.config || {}
    );

    const pellets0 = clonePellets(parsed.pellets);
    const ghosts0 = cloneGhosts(parsed.ghostsInit);

    const maze = {
      walls: parsed.walls,
      pr: parsed.pr,
      pc: parsed.pc
    };

    const ROWS = parsed.rows;
    const COLS = parsed.cols;
    const ghostHome = parsed.ghostHome;

    const s = {
      pac: {
        r: maze.pr + 0.5,
        c: maze.pc + 0.5,
        dr: 0,
        dc: 0,
        wantDr: 0,
        wantDc: 0,
        speed: cfg.pacSpeed
      },
      ghosts: cloneGhosts(ghosts0),
      pellets: clonePellets(pellets0),
      score: 0,
      lives: cfg.lives,
      powerTimer: 0,
      gameOver: false,
      win: false,
      tick: 0,
      invuln: 0
    };

    function wallAt(r, c) {
      const rr = Math.floor(r);
      const cc = Math.floor(c);
      if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) return true;
      return maze.walls[rr][cc];
    }

    function tryAlignTurn() {
      const cr = Math.floor(s.pac.r) + 0.5;
      const cc = Math.floor(s.pac.c) + 0.5;
      if (s.pac.dr === 0 && s.pac.dc === 0) {
        if (Math.abs(s.pac.r - cr) < 0.22 && Math.abs(s.pac.c - cc) < 0.22) {
          s.pac.r = cr;
          s.pac.c = cc;
        }
      }
      if (Math.abs(s.pac.r - cr) > 0.14 || Math.abs(s.pac.c - cc) > 0.14) return;
      const wdr = s.pac.wantDr;
      const wdc = s.pac.wantDc;
      if (wdr === 0 && wdc === 0) return;
      let tnr = cr;
      let tnc = cc;
      if (wdr !== 0) {
        tnr = cr + wdr;
        tnc = cc;
      } else {
        tnr = cr;
        tnc = cc + wdc;
      }
      if (wallAt(tnr, tnc)) return;
      s.pac.r = cr;
      s.pac.c = cc;
      s.pac.dr = wdr;
      s.pac.dc = wdc;
    }

    function movePac(dt) {
      if (s.gameOver || s.win) return;
      tryAlignTurn();
      const step = s.pac.speed * (dt / 16);
      if (s.pac.dr === 0 && s.pac.dc === 0) return;
      const nr = s.pac.r + s.pac.dr * step;
      const nc = s.pac.c + s.pac.dc * step;
      const checkR = s.pac.dr !== 0 ? nr + Math.sign(s.pac.dr) * 0.35 : nr;
      const checkC = s.pac.dc !== 0 ? nc + Math.sign(s.pac.dc) * 0.35 : nc;
      if (wallAt(checkR, checkC)) {
        const ccr = Math.floor(s.pac.r) + 0.5;
        const ccc = Math.floor(s.pac.c) + 0.5;
        s.pac.r = ccr;
        s.pac.c = ccc;
        s.pac.dr = 0;
        s.pac.dc = 0;
        return;
      }
      s.pac.r = nr;
      s.pac.c = nc;
    }

    function eatPellets() {
      const cr = Math.floor(s.pac.r);
      const cc = Math.floor(s.pac.c);
      for (let i = s.pellets.length - 1; i >= 0; i--) {
        const p = s.pellets[i];
        if (p.r === cr && p.c === cc) {
          const pts = p.power ? cfg.pointsPower : cfg.pointsPellet;
          s.score += pts;
          if (p.power) s.powerTimer = cfg.powerMs;
          s.pellets.splice(i, 1);
          if (cb.onScore) cb.onScore(s.score, { kind: p.power ? 'power' : 'pellet', points: pts });
        }
      }
      if (s.pellets.length === 0 && !s.win) {
        s.win = true;
        if (cb.onWin) cb.onWin();
      }
    }

    function moveGhosts(dt) {
      const step = cfg.ghostSpeed * (dt / 16);
      if (s.powerTimer > 0) s.powerTimer -= dt;
      s.ghosts.forEach(function (g) {
        g.scared = s.powerTimer > 0 ? s.powerTimer : 0;
        if (Math.random() < 0.02 || (g.dr === 0 && g.dc === 0)) {
          const opts = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(function (pair) {
            const dr = pair[0];
            const dc = pair[1];
            const nr = Math.floor(g.r) + 0.5 + dr;
            const nc = Math.floor(g.c) + 0.5 + dc;
            return !wallAt(nr, nc);
          });
          if (opts.length) {
            const pick = opts[Math.floor(Math.random() * opts.length)];
            g.dr = pick[0];
            g.dc = pick[1];
          }
        }
        const nr = g.r + g.dr * step;
        const nc = g.c + g.dc * step;
        if (wallAt(nr + g.dr * 0.3, nc + g.dc * 0.3)) {
          g.r = Math.floor(g.r) + 0.5;
          g.c = Math.floor(g.c) + 0.5;
          g.dr = 0;
          g.dc = 0;
        } else {
          g.r = nr;
          g.c = nc;
        }
      });
    }

    function hitTest() {
      if (s.invuln > 0) return;
      const thresh = 0.55;
      s.ghosts.forEach(function (g) {
        const d = Math.hypot(s.pac.r - g.r, s.pac.c - g.c);
        if (d >= thresh) return;
        if (g.scared > 0) {
          g.r = ghostHome.r;
          g.c = ghostHome.c;
          g.dr = 0;
          g.dc = 0;
          s.score += cfg.pointsGhost;
          if (cb.onScore) cb.onScore(s.score, { kind: 'ghost', points: cfg.pointsGhost });
        } else {
          s.lives--;
          s.invuln = cfg.invulnMs;
          if (cb.onLives) cb.onLives(s.lives);
          if (s.lives <= 0) {
            s.gameOver = true;
            if (cb.onGameOver) cb.onGameOver();
          } else {
            s.pac.r = maze.pr + 0.5;
            s.pac.c = maze.pc + 0.5;
            s.pac.dr = 0;
            s.pac.dc = 0;
          }
        }
      });
    }

    return {
      rows: ROWS,
      cols: COLS,
      mazeWalls: maze.walls,

      getState: function () {
        return {
          pac: Object.assign({}, s.pac),
          ghosts: s.ghosts.map(function (g) {
            return Object.assign({}, g);
          }),
          pellets: clonePellets(s.pellets),
          score: s.score,
          lives: s.lives,
          powerTimer: s.powerTimer,
          gameOver: s.gameOver,
          win: s.win,
          tick: s.tick,
          invuln: s.invuln
        };
      },

      /** @param {number} dtMs @param {{ wdr: number, wdc: number }} intent */
      step: function (dtMs, intent) {
        s.tick++;
        s.pac.wantDr = intent.wdr;
        s.pac.wantDc = intent.wdc;
        if (s.gameOver || s.win) return;
        if (s.invuln > 0) s.invuln -= dtMs;
        movePac(dtMs);
        eatPellets();
        moveGhosts(dtMs);
        hitTest();
      },

      layoutForCanvas: function (width, height, pad) {
        const p = pad == null ? 2 : pad;
        const cell = Math.floor(
          Math.min(width / (COLS + p), height / (ROWS + p))
        );
        const ox = Math.floor((width - cell * COLS) / 2);
        const oy = Math.floor((height - cell * ROWS) / 2);
        return { cell, ox, oy };
      },

      reset: function () {
        s.pac = {
          r: maze.pr + 0.5,
          c: maze.pc + 0.5,
          dr: 0,
          dc: 0,
          wantDr: 0,
          wantDc: 0,
          speed: cfg.pacSpeed
        };
        s.ghosts = cloneGhosts(ghosts0);
        s.pellets = clonePellets(pellets0);
        s.score = 0;
        s.lives = cfg.lives;
        s.powerTimer = 0;
        s.gameOver = false;
        s.win = false;
        s.tick = 0;
        s.invuln = 0;
        if (cb.onScore) cb.onScore(0, { kind: 'reset' });
        if (cb.onLives) cb.onLives(s.lives);
      }
    };
  }

  coffee.playMazeGame = {
    create,
    parseAsciiMaze,
    readIntent,
    DEFAULT_GHOST_COLORS
  };

  window.coffee = coffee;
})();
