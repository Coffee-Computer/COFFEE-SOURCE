/**
 * coffee.playTetrominoGame — headless falling-block / tetromino stacker (no canvas, no DOM).
 * From SUPER-SHAPES1-POC: gravity, lock, line clear, level/speed, wall-kick rotate.
 *
 * coffee.playTetrominoGame.create({ callbacks?, config? })
 *   → { step, getState, reset }
 *
 * step(dtMs, input)
 *   input.actions — one-shot this frame: moveLeft, moveRight, rotate, stepDown, hardDrop (booleans)
 *   input.softDropHeld — fast drop while true (e.g. touch-hold)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_PIECES = [
    [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[1, 1, 1], [0, 1, 0], [0, 0, 0]],
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [1, 0, 0], [0, 0, 0]],
    [[1, 1, 1], [0, 0, 1], [0, 0, 0]]
  ];

  const DEFAULT_COLORS = [
    '#00f0f0',
    '#a000f0',
    '#f00000',
    '#00f000',
    '#f0f000',
    '#f0a000',
    '#0000f0'
  ];

  const DEFAULTS = {
    rows: 20,
    cols: 10,
    vacant: '#0f3460',
    lineScores: [0, 100, 300, 500, 800],
    linesPerLevel: 10,
    baseDropMs: 1000,
    dropMsPerLevel: 100,
    minDropMs: 100,
    softDropMs: 50,
    spawnX: 3,
    spawnY: -2
  };

  function cloneMatrix(m) {
    return m.map(function (row) { return row.slice(); });
  }

  function rotateMatrix(mat) {
    const n = mat.length;
    const next = [];
    for (let i = 0; i < n; i++) {
      next[i] = [];
      for (let j = 0; j < n; j++) {
        next[i][j] = mat[n - j - 1][i];
      }
    }
    return next;
  }

  function collision(board, vacant, pieceX, pieceY, pattern, cols, rows, dx, dy) {
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern.length; c++) {
        if (!pattern[r][c]) continue;
        const newX = pieceX + c + dx;
        const newY = pieceY + r + dy;
        if (newX < 0 || newX >= cols || newY >= rows) return true;
        if (newY < 0) continue;
        if (board[newY][newX] !== vacant) return true;
      }
    }
    return false;
  }

  function ghostY(board, vacant, pieceX, pieceY, pattern, cols, rows) {
    let gy = pieceY;
    while (!collision(board, vacant, pieceX, gy, pattern, cols, rows, 0, 1)) {
      gy++;
    }
    return gy;
  }

  function createEmptyBoard(rows, cols, vacant) {
    const b = [];
    for (let r = 0; r < rows; r++) {
      b[r] = [];
      for (let c = 0; c < cols; c++) b[r][c] = vacant;
    }
    return b;
  }

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const cb = (opts && opts.callbacks) || {};
    const PIECES = (opts && opts.pieces) || DEFAULT_PIECES;
    const COLORS = (opts && opts.colors) || DEFAULT_COLORS;

    const s = {
      board: null,
      piece: null,
      score: 0,
      totalLines: 0,
      level: 1,
      gameOver: false,
      dropAcc: 0,
      softAcc: 0
    };

    function randomPiece() {
      const idx = Math.floor(Math.random() * PIECES.length);
      return {
        matrix: cloneMatrix(PIECES[idx]),
        color: COLORS[idx],
        x: cfg.spawnX,
        y: cfg.spawnY
      };
    }

    function notifyStats() {
      if (typeof cb.onScore === 'function') cb.onScore(s.score, {});
      if (typeof cb.onLines === 'function') cb.onLines(s.totalLines, {});
      if (typeof cb.onLevel === 'function') cb.onLevel(s.level, {});
    }

    function dropIntervalMs() {
      return Math.max(cfg.minDropMs, cfg.baseDropMs - (s.level - 1) * cfg.dropMsPerLevel);
    }

    function tryMove(dx, dy, pattern) {
      const p = s.piece;
      if (!p || s.gameOver) return false;
      const pat = pattern || p.matrix;
      if (collision(s.board, cfg.vacant, p.x, p.y, pat, cfg.cols, cfg.rows, dx, dy)) return false;
      p.x += dx;
      p.y += dy;
      return true;
    }

    function tryRotate() {
      const p = s.piece;
      if (!p || s.gameOver) return;
      const nextPattern = rotateMatrix(p.matrix);
      let kick = 0;
      if (collision(s.board, cfg.vacant, p.x, p.y, nextPattern, cfg.cols, cfg.rows, 0, 0)) {
        kick = p.x > cfg.cols / 2 ? -1 : 1;
      }
      if (!collision(s.board, cfg.vacant, p.x + kick, p.y, nextPattern, cfg.cols, cfg.rows, 0, 0)) {
        p.x += kick;
        p.matrix = nextPattern;
      }
    }

    function lockPiece() {
      const p = s.piece;
      if (!p) return;

      for (let r = 0; r < p.matrix.length; r++) {
        for (let c = 0; c < p.matrix.length; c++) {
          if (!p.matrix[r][c]) continue;
          if (p.y + r < 0) {
            s.gameOver = true;
            if (typeof cb.onGameOver === 'function') cb.onGameOver(s.score, s.totalLines);
            return;
          }
          s.board[p.y + r][p.x + c] = p.color;
        }
      }

      let linesCleared = 0;
      for (let r = 0; r < cfg.rows; r++) {
        let full = true;
        for (let c = 0; c < cfg.cols; c++) {
          if (s.board[r][c] === cfg.vacant) {
            full = false;
            break;
          }
        }
        if (full) {
          linesCleared++;
          for (let y = r; y > 0; y--) {
            for (let c = 0; c < cfg.cols; c++) {
              s.board[y][c] = s.board[y - 1][c];
            }
          }
          for (let c = 0; c < cfg.cols; c++) s.board[0][c] = cfg.vacant;
          r--;
        }
      }

      if (linesCleared > 0) {
        const table = cfg.lineScores;
        s.score += table[linesCleared] != null ? table[linesCleared] : 0;
        s.totalLines += linesCleared;
        s.level = Math.floor(s.totalLines / cfg.linesPerLevel) + 1;
        notifyStats();
      }

      s.piece = randomPiece();
      s.dropAcc = 0;
      s.softAcc = 0;
    }

    function moveDownOrLock() {
      const p = s.piece;
      if (!p || s.gameOver) return;
      if (!tryMove(0, 1, p.matrix)) {
        lockPiece();
      }
    }

    function hardDrop() {
      const p = s.piece;
      if (!p || s.gameOver) return;
      while (!collision(s.board, cfg.vacant, p.x, p.y, p.matrix, cfg.cols, cfg.rows, 0, 1)) {
        p.y++;
      }
      lockPiece();
    }

    function reset() {
      s.board = createEmptyBoard(cfg.rows, cfg.cols, cfg.vacant);
      s.score = 0;
      s.totalLines = 0;
      s.level = 1;
      s.gameOver = false;
      s.dropAcc = 0;
      s.softAcc = 0;
      s.piece = randomPiece();
      if (typeof cb.onScore === 'function') cb.onScore(0, { kind: 'reset' });
      if (typeof cb.onLines === 'function') cb.onLines(0, { kind: 'reset' });
      if (typeof cb.onLevel === 'function') cb.onLevel(1, { kind: 'reset' });
    }

    function step(dtMs, input) {
      const actions = (input && input.actions) || {};
      const softHeld = !!(input && input.softDropHeld);

      if (s.gameOver) return;

      if (actions.moveLeft) tryMove(-1, 0);
      if (actions.moveRight) tryMove(1, 0);
      if (actions.rotate) tryRotate();
      if (actions.stepDown) moveDownOrLock();
      if (actions.hardDrop) hardDrop();

      if (s.gameOver) return;

      s.dropAcc += dtMs;
      const interval = dropIntervalMs();
      if (s.dropAcc >= interval) {
        s.dropAcc = 0;
        moveDownOrLock();
      }

      if (softHeld && !s.gameOver) {
        s.softAcc += dtMs;
        if (s.softAcc >= cfg.softDropMs) {
          s.softAcc = 0;
          moveDownOrLock();
        }
      } else {
        s.softAcc = 0;
      }
    }

    function getState() {
      const p = s.piece;
      let gy = null;
      if (p && !s.gameOver) {
        gy = ghostY(s.board, cfg.vacant, p.x, p.y, p.matrix, cfg.cols, cfg.rows);
      }
      return {
        rows: cfg.rows,
        cols: cfg.cols,
        vacant: cfg.vacant,
        board: s.board,
        piece: p,
        ghostY: gy,
        score: s.score,
        totalLines: s.totalLines,
        level: s.level,
        gameOver: s.gameOver
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

  coffee.playTetrominoGame = {
    create,
    DEFAULTS,
    DEFAULT_PIECES,
    DEFAULT_COLORS
  };
  window.coffee = coffee;
})();
