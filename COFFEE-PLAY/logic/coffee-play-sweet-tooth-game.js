/**
 * coffee.playSweetToothGame — headless match-3 style candy grid (no canvas, no DOM).
 * From SWEET-TOOTH1-POC: swap-adjacent, clears, gravity, chain combos, juice → level.
 *
 * Phases replace async/setTimeout: pop_wait (120ms), fall_wait (180ms), swap_revert_wait (200ms).
 *
 * coffee.playSweetToothGame.create({ callbacks?, config?, candyTypes? })
 *   → { step, interactCanvas, getState, reset, candyTypes, config }
 *
 * interactCanvas(x, y, viewW, viewH, now) — canvas pixel coords + viewport for hit-test.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_TYPES = ['🍭', '🍬', '🍫', '🍩', '🧁', '🍪'];

  const DEFAULTS = {
    rows: 8,
    cols: 8,
    tileSize: 75,
    popDelayMs: 120,
    fallDelayMs: 180,
    swapFailDelayMs: 200,
    juicePerCell: 4,
    scorePerCell: 25,
    juiceLevelThreshold: 100,
    fallSpeed: 18,
    scaleSpeed: 0.2
  };

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const TYPES = (opts && opts.candyTypes) || DEFAULT_TYPES;
    const cb = (opts && opts.callbacks) || {};

    const s = {
      grid: [],
      score: 0,
      level: 1,
      juice: 0,
      selected: null,
      processing: false,
      phase: 'idle',
      phaseUntil: 0,
      pendingMatches: null,
      swapRevert: null,
      viewW: 800,
      viewH: 600
    };

    function notifyScoreJuice() {
      if (typeof cb.onScore === 'function') cb.onScore(s.score);
      if (typeof cb.onJuice === 'function') {
        cb.onJuice({ juice: s.juice, level: s.level });
      }
    }

    function applyJuiceLevel() {
      if (s.juice >= cfg.juiceLevelThreshold) {
        s.juice = 0;
        s.level++;
      }
    }

    function createCandy(r, c) {
      const typeIndex = Math.floor(Math.random() * TYPES.length);
      return {
        type: typeIndex,
        icon: TYPES[typeIndex],
        r,
        c,
        scale: 1,
        offsetY: 0
      };
    }

    function findMatches() {
      const R = cfg.rows;
      const C = cfg.cols;
      const matches = [];
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C - 2; c++) {
          const type = s.grid[r][c].type;
          if (s.grid[r][c + 1].type === type && s.grid[r][c + 2].type === type) {
            matches.push({ r, c }, { r, c: c + 1 }, { r, c: c + 2 });
          }
        }
      }
      for (let c = 0; c < C; c++) {
        for (let r = 0; r < R - 2; r++) {
          const type = s.grid[r][c].type;
          if (s.grid[r + 1][c].type === type && s.grid[r + 2][c].type === type) {
            matches.push({ r, c }, { r: r + 1, c }, { r: r + 2, c });
          }
        }
      }
      const uniq = Array.from(new Set(matches.map(function (m) { return m.r + ',' + m.c; })))
        .map(function (key) {
          const parts = key.split(',');
          return { r: Number(parts[0]), c: Number(parts[1]) };
        });
      return uniq;
    }

    function generateGrid() {
      const R = cfg.rows;
      const C = cfg.cols;
      s.grid = [];
      for (let r = 0; r < R; r++) {
        s.grid[r] = [];
        for (let c = 0; c < C; c++) {
          s.grid[r][c] = createCandy(r, c);
        }
      }
      if (findMatches().length > 0) generateGrid();
    }

    function doSwap(r1, c1, r2, c2) {
      const t = s.grid[r1][c1];
      s.grid[r1][c1] = s.grid[r2][c2];
      s.grid[r2][c2] = t;
      s.grid[r1][c1].r = r1;
      s.grid[r1][c1].c = c1;
      s.grid[r2][c2].r = r2;
      s.grid[r2][c2].c = c2;
    }

    function collapseGrid(matches) {
      const R = cfg.rows;
      const C = cfg.cols;
      const ts = cfg.tileSize;
      for (let c = 0; c < C; c++) {
        let emptySpaces = 0;
        for (let r = R - 1; r >= 0; r--) {
          if (matches.some(function (m) { return m.r === r && m.c === c; })) {
            emptySpaces++;
          } else if (emptySpaces > 0) {
            const candy = s.grid[r][c];
            s.grid[r + emptySpaces][c] = candy;
            candy.r = r + emptySpaces;
            candy.offsetY = -emptySpaces * ts;
          }
        }
        for (let i = 0; i < emptySpaces; i++) {
          const newCandy = createCandy(i, c);
          s.grid[i][c] = newCandy;
          newCandy.offsetY = -emptySpaces * ts;
        }
      }
    }

    function startMatchRound(now) {
      const matches = findMatches();
      if (matches.length === 0) {
        s.processing = false;
        s.phase = 'idle';
        return;
      }
      s.score += matches.length * cfg.scorePerCell;
      s.juice += matches.length * cfg.juicePerCell;
      applyJuiceLevel();
      notifyScoreJuice();
      matches.forEach(function (m) {
        s.grid[m.r][m.c].scale = 0;
      });
      s.pendingMatches = matches;
      s.phase = 'pop_wait';
      s.phaseUntil = now + cfg.popDelayMs;
      s.processing = true;
    }

    function advancePhase(now) {
      switch (s.phase) {
        case 'pop_wait':
          collapseGrid(s.pendingMatches);
          s.pendingMatches = null;
          s.phase = 'fall_wait';
          s.phaseUntil = now + cfg.fallDelayMs;
          break;
        case 'fall_wait':
          startMatchRound(now);
          break;
        case 'swap_revert_wait':
          if (s.swapRevert) {
            const w = s.swapRevert;
            doSwap(w.r1, w.c1, w.r2, w.c2);
            s.swapRevert = null;
          }
          s.processing = false;
          s.phase = 'idle';
          break;
        default:
          break;
      }
    }

    function trySwap(r1, c1, r2, c2, now) {
      if (s.processing) return;
      doSwap(r1, c1, r2, c2);
      if (findMatches().length === 0) {
        s.swapRevert = { r1, c1, r2, c2 };
        s.phase = 'swap_revert_wait';
        s.phaseUntil = now + cfg.swapFailDelayMs;
        s.processing = true;
      } else {
        startMatchRound(now);
      }
    }

    function animateCandies() {
      const R = cfg.rows;
      const C = cfg.cols;
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          const candy = s.grid[r][c];
          if (candy.offsetY < 0) candy.offsetY += cfg.fallSpeed;
          if (candy.offsetY > 0) candy.offsetY = 0;
          if (candy.scale < 1) candy.scale += cfg.scaleSpeed;
        }
      }
    }

    function step(dtMs, input) {
      const now = (input && input.now != null) ? input.now : Date.now();
      if (input && input.viewW) s.viewW = input.viewW;
      if (input && input.viewH) s.viewH = input.viewH;

      animateCandies();

      if (s.processing && s.phase !== 'idle' && now >= s.phaseUntil) {
        advancePhase(now);
      }
    }

    function gridOffset() {
      const ts = cfg.tileSize;
      return {
        x: (s.viewW - cfg.cols * ts) / 2,
        y: (s.viewH - cfg.rows * ts) / 2
      };
    }

    function interactCanvas(canvasX, canvasY, viewW, viewH, now) {
      if (s.processing) return;
      if (viewW != null) s.viewW = viewW;
      if (viewH != null) s.viewH = viewH;
      const ts = cfg.tileSize;
      const off = gridOffset();
      const c = Math.floor((canvasX - off.x) / ts);
      const r = Math.floor((canvasY - off.y) / ts);
      if (r < 0 || r >= cfg.rows || c < 0 || c >= cfg.cols) return;

      if (!s.selected) {
        s.selected = { r, c };
        if (typeof cb.onSelect === 'function') cb.onSelect(s.selected);
      } else {
        const dr = Math.abs(s.selected.r - r);
        const dc = Math.abs(s.selected.c - c);
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          trySwap(s.selected.r, s.selected.c, r, c, now != null ? now : Date.now());
        }
        s.selected = null;
        if (typeof cb.onSelect === 'function') cb.onSelect(null);
      }
    }

    function getState() {
      const gridCopy = s.grid.map(function (row) {
        return row.map(function (cell) {
          return {
            type: cell.type,
            icon: cell.icon,
            r: cell.r,
            c: cell.c,
            scale: cell.scale,
            offsetY: cell.offsetY
          };
        });
      });
      return {
        grid: gridCopy,
        score: s.score,
        level: s.level,
        juice: s.juice,
        selected: s.selected ? { ...s.selected } : null,
        processing: s.processing,
        tileSize: cfg.tileSize,
        rows: cfg.rows,
        cols: cfg.cols,
        offset: gridOffset()
      };
    }

    function reset() {
      s.score = 0;
      s.level = 1;
      s.juice = 0;
      s.selected = null;
      s.processing = false;
      s.phase = 'idle';
      s.phaseUntil = 0;
      s.pendingMatches = null;
      s.swapRevert = null;
      generateGrid();
      notifyScoreJuice();
      if (typeof cb.onSelect === 'function') cb.onSelect(null);
    }

    generateGrid();
    notifyScoreJuice();

    return {
      step,
      interactCanvas,
      getState,
      reset,
      candyTypes: TYPES,
      config: cfg
    };
  }

  coffee.playSweetToothGame = {
    create,
    DEFAULTS,
    DEFAULT_TYPES
  };
  window.coffee = coffee;
})();
