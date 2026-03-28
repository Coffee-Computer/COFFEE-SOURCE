/**
 * coffee.playSurvivalGame — headless top-down survival (no canvas, no DOM).
 * From STAY-ALIVE1-POC: stats decay, pickups, delayed respawn, craft, inventory use.
 *
 * coffee.playSurvivalGame.create({ callbacks?, config? })
 *   → { step, getState, reset, useItem, tryCraftBandage, useHotkeyConsumable }
 *
 * step(dtMs, input) — input.keys (CUP lowercase), viewW, viewH, now (ms, default Date.now)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_ITEMS = {
    Berry: { icon: '🍒', food: 15, water: 5, hp: 0 },
    Water: { icon: '💧', food: 0, water: 30, hp: 0 },
    Fiber: { icon: '🌿', food: 0, water: 0, hp: 0 },
    Bandage: { icon: '🩹', food: 0, water: 0, hp: 25 }
  };

  const DEFAULTS = {
    worldSize: 4000,
    initialLootCount: 100,
    lootTypes: ['Berry', 'Water', 'Fiber'],
    pickupRadius: 30,
    respawnDelayMs: 10000,
    hungerDecay: 0.015,
    thirstDecay: 0.025,
    starveHpDrain: 0.05,
    playerStartX: 2000,
    playerStartY: 2000,
    playerSpeed: 3,
    playerSize: 20,
    bandageFiberCost: 2
  };

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const ITEMS = (opts && opts.items) || DEFAULT_ITEMS;
    const cb = (opts && opts.callbacks) || {};

    const invKeys = Object.keys(ITEMS);

    const s = {
      player: {
        x: cfg.playerStartX,
        y: cfg.playerStartY,
        speed: cfg.playerSpeed,
        hp: 100,
        hunger: 100,
        thirst: 100,
        size: cfg.playerSize
      },
      inventory: {},
      worldItems: [],
      respawnQueue: [],
      active: true,
      viewW: 800,
      viewH: 600
    };

    invKeys.forEach(function (k) {
      s.inventory[k] = 0;
    });

    function log(msg) {
      if (typeof cb.onLog === 'function') cb.onLog(msg);
    }

    function notifyStats() {
      const p = s.player;
      if (typeof cb.onStats === 'function') {
        cb.onStats({ hp: p.hp, hunger: p.hunger, thirst: p.thirst });
      }
    }

    function notifyInventory() {
      if (typeof cb.onInventory === 'function') cb.onInventory(s.inventory);
    }

    function deathCause() {
      if (s.player.hunger <= 0) return 'You starved.';
      return 'Dehydration took you.';
    }

    function endGame() {
      s.active = false;
      if (typeof cb.onGameOver === 'function') cb.onGameOver(deathCause());
    }

    function spawnLootPiece(type) {
      s.worldItems.push({
        type: type,
        x: Math.random() * cfg.worldSize,
        y: Math.random() * cfg.worldSize,
        id: Math.random().toString(36).slice(2) + Date.now()
      });
    }

    function spawnInitialLoot(count) {
      s.worldItems = [];
      const types = cfg.lootTypes;
      for (let i = 0; i < count; i++) {
        spawnLootPiece(types[Math.floor(Math.random() * types.length)]);
      }
    }

    function key(keys, a, b) {
      return !!(keys[a] || (b && keys[b]));
    }

    function step(dtMs, input) {
      if (!s.active) return;

      const keys = (input && input.keys) || {};
      const now = (input && input.now != null) ? input.now : Date.now();
      s.viewW = (input && input.viewW) || s.viewW;
      s.viewH = (input && input.viewH) || s.viewH;

      const p = s.player;
      let dx = 0;
      let dy = 0;
      if (key(keys, 'w', 'arrowup')) dy -= p.speed;
      if (key(keys, 's', 'arrowdown')) dy += p.speed;
      if (key(keys, 'a', 'arrowleft')) dx -= p.speed;
      if (key(keys, 'd', 'arrowright')) dx += p.speed;

      p.x += dx;
      p.y += dy;
      p.x = Math.max(0, Math.min(cfg.worldSize, p.x));
      p.y = Math.max(0, Math.min(cfg.worldSize, p.y));

      p.hunger -= cfg.hungerDecay;
      p.thirst -= cfg.thirstDecay;

      if (p.hunger <= 0 || p.thirst <= 0) {
        p.hp -= cfg.starveHpDrain;
        p.hunger = Math.max(0, p.hunger);
        p.thirst = Math.max(0, p.thirst);
      }

      if (p.hp <= 0) {
        p.hp = 0;
        notifyStats();
        endGame();
        return;
      }

      notifyStats();

      const pr = cfg.pickupRadius;
      for (let i = s.worldItems.length - 1; i >= 0; i--) {
        const it = s.worldItems[i];
        if (Math.hypot(p.x - it.x, p.y - it.y) < pr) {
          s.inventory[it.type]++;
          log('Picked up ' + it.type);
          s.worldItems.splice(i, 1);
          notifyInventory();
          s.respawnQueue.push({ type: it.type, at: now + cfg.respawnDelayMs });
        }
      }

      const rq = [];
      for (let j = 0; j < s.respawnQueue.length; j++) {
        const q = s.respawnQueue[j];
        if (now >= q.at) {
          spawnLootPiece(q.type);
        } else {
          rq.push(q);
        }
      }
      s.respawnQueue = rq;
    }

    function useItem(type) {
      if (!s.active) return false;
      if (!ITEMS[type] || s.inventory[type] <= 0) return false;
      const item = ITEMS[type];
      if (item.food > 0 || item.water > 0 || item.hp > 0) {
        const p = s.player;
        p.hunger = Math.min(100, p.hunger + item.food);
        p.thirst = Math.min(100, p.thirst + item.water);
        p.hp = Math.min(100, p.hp + item.hp);
        s.inventory[type]--;
        log('Used ' + type);
        notifyStats();
        notifyInventory();
        return true;
      }
      return false;
    }

    function tryCraftBandage() {
      if (!s.active) return false;
      const cost = cfg.bandageFiberCost;
      if (s.inventory.Fiber >= cost) {
        s.inventory.Fiber -= cost;
        s.inventory.Bandage++;
        log('Crafted Bandage');
        notifyInventory();
        return true;
      }
      log('Not enough Fiber!');
      return false;
    }

    function useHotkeyConsumable() {
      if (s.inventory.Berry > 0) return useItem('Berry');
      if (s.inventory.Water > 0) return useItem('Water');
      return false;
    }

    function reset() {
      s.player = {
        x: cfg.playerStartX,
        y: cfg.playerStartY,
        speed: cfg.playerSpeed,
        hp: 100,
        hunger: 100,
        thirst: 100,
        size: cfg.playerSize
      };
      invKeys.forEach(function (k) {
        s.inventory[k] = 0;
      });
      s.respawnQueue = [];
      s.active = true;
      spawnInitialLoot(cfg.initialLootCount);
      notifyStats();
      notifyInventory();
    }

    function getState() {
      const p = s.player;
      const camX = p.x - s.viewW / 2;
      const camY = p.y - s.viewH / 2;
      return {
        active: s.active,
        player: { ...p },
        camera: { x: camX, y: camY },
        inventory: { ...s.inventory },
        worldItems: s.worldItems.slice(),
        items: ITEMS,
        viewW: s.viewW,
        viewH: s.viewH,
        worldSize: cfg.worldSize
      };
    }

    spawnInitialLoot(cfg.initialLootCount);
    notifyStats();

    return {
      step,
      getState,
      reset,
      useItem,
      tryCraftBandage,
      useHotkeyConsumable,
      config: cfg,
      items: ITEMS
    };
  }

  coffee.playSurvivalGame = {
    create,
    DEFAULTS,
    DEFAULT_ITEMS
  };
  window.coffee = coffee;
})();
