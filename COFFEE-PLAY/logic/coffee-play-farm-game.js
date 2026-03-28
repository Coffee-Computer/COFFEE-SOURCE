/**
 * coffee.playFarmGame — headless grid farm sim (no canvas, no DOM).
 * From MY-FARM1-POC: till, water, plant, timed growth when watered, harvest for coins.
 *
 * coffee.playFarmGame.create({ callbacks?, config?, crops? })
 *   → { step, interactCanvas, setTool, getState, reset, crops, config }
 *
 * interactCanvas(x, y, viewW, viewH, now) — pixel coords in canvas space (same as draw).
 * step(dtMs, { now }) — updates growth timers.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_CROPS = {
    wheat: { name: 'Wheat', cost: 2, sell: 6, time: 5000, color: '#f5d142', icon: '🌾' },
    carrot: { name: 'Carrot', cost: 5, sell: 15, time: 10000, color: '#f59e42', icon: '🥕' }
  };

  const DEFAULTS = {
    tileSize: 64,
    gridRows: 8,
    gridCols: 8,
    startCoins: 10,
    defaultTool: 'hoe'
  };

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const CROPS = (opts && opts.crops) || DEFAULT_CROPS;
    const cb = (opts && opts.callbacks) || {};

    const s = {
      coins: cfg.startCoins,
      currentTool: cfg.defaultTool,
      grid: []
    };

    function status(msg) {
      if (typeof cb.onStatus === 'function') cb.onStatus(msg);
    }

    function notifyCoins() {
      if (typeof cb.onCoins === 'function') cb.onCoins(s.coins);
    }

    function buildGrid() {
      s.grid = [];
      for (let r = 0; r < cfg.gridRows; r++) {
        for (let c = 0; c < cfg.gridCols; c++) {
          s.grid.push({
            r,
            c,
            tilled: false,
            watered: false,
            crop: null,
            growth: 0,
            plantedAt: 0
          });
        }
      }
    }

    function plotAt(gx, gy) {
      if (gx < 0 || gx >= cfg.gridCols || gy < 0 || gy >= cfg.gridRows) return null;
      return s.grid[gy * cfg.gridCols + gx];
    }

    function setTool(tool) {
      s.currentTool = tool;
      if (typeof cb.onToolChange === 'function') cb.onToolChange(tool);
    }

    function interactCanvas(canvasX, canvasY, viewW, viewH, now) {
      const ts = cfg.tileSize;
      const ox = (viewW - cfg.gridCols * ts) / 2;
      const oy = (viewH - cfg.gridRows * ts) / 2;
      const gx = Math.floor((canvasX - ox) / ts);
      const gy = Math.floor((canvasY - oy) / ts);
      const plot = plotAt(gx, gy);
      if (!plot) return;

      const t = s.currentTool;
      const time = now != null ? now : Date.now();

      if (t === 'hoe') {
        if (!plot.tilled) {
          plot.tilled = true;
          status('Tilled the soil.');
        } else if (plot.crop && plot.growth >= 1) {
          const data = CROPS[plot.crop];
          s.coins += data.sell;
          status('Harvested ' + data.name + '! +' + data.sell + '🪙');
          plot.crop = null;
          plot.growth = 0;
          plot.watered = false;
          notifyCoins();
        }
      } else if (t === 'water') {
        if (plot.tilled && !plot.watered) {
          plot.watered = true;
          status('Watered the plot.');
        }
      } else if (t.startsWith('seed-')) {
        const type = t.split('-')[1];
        const cropData = CROPS[type];
        if (!cropData) return;

        if (plot.tilled && !plot.crop) {
          if (s.coins >= cropData.cost) {
            s.coins -= cropData.cost;
            plot.crop = type;
            plot.growth = 0;
            plot.plantedAt = time;
            notifyCoins();
            status('Planted ' + cropData.name + '.');
          } else {
            status('Not enough coins!');
          }
        }
      }
    }

    function step(dtMs, input) {
      const now = (input && input.now != null) ? input.now : Date.now();
      s.grid.forEach(function (plot) {
        if (plot.crop && plot.watered && plot.growth < 1) {
          const elapsed = now - plot.plantedAt;
          const cropTime = CROPS[plot.crop].time;
          plot.growth = Math.min(1, elapsed / cropTime);
        }
      });
    }

    function getState() {
      return {
        coins: s.coins,
        currentTool: s.currentTool,
        grid: s.grid.map(function (p) {
          return {
            r: p.r,
            c: p.c,
            tilled: p.tilled,
            watered: p.watered,
            crop: p.crop,
            growth: p.growth,
            plantedAt: p.plantedAt
          };
        }),
        tileSize: cfg.tileSize,
        gridRows: cfg.gridRows,
        gridCols: cfg.gridCols
      };
    }

    function reset() {
      s.coins = cfg.startCoins;
      s.currentTool = cfg.defaultTool;
      buildGrid();
      notifyCoins();
      status('Ready to farm!');
      if (typeof cb.onToolChange === 'function') cb.onToolChange(s.currentTool);
    }

    buildGrid();
    notifyCoins();
    status('Ready to farm!');

    return {
      step,
      interactCanvas,
      setTool,
      getState,
      reset,
      crops: CROPS,
      config: cfg
    };
  }

  coffee.playFarmGame = {
    create,
    DEFAULTS,
    DEFAULT_CROPS
  };
  window.coffee = coffee;
})();
