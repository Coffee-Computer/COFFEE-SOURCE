/**
 * coffee.playLyfeGame — headless life-sim click-to-move (no canvas, no DOM).
 * From LYFE1-POC: needs decay, walk to target, interact at appliances for timed actions.
 *
 * coffee.playLyfeGame.create({ callbacks?, config?, objects? })
 *   → { step, getState, click, reset, DEFAULT_OBJECTS, config }
 *
 * step(dtMs, { now? }) — now for UI pulse; defaults to performance.now in template
 * click(canvasX, canvasY) — hit appliance or set walk target (canvas pixel coords)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_OBJECTS = [
    { name: 'Fridge', x: 100, y: 100, w: 50, h: 50, color: '#ecf0f1', need: 'hunger', gain: 30, cost: 5, msg: 'Eating...' },
    { name: 'Bed', x: 600, y: 100, w: 80, h: 100, color: '#3498db', need: 'energy', gain: 50, cost: 0, msg: 'Sleeping...' },
    { name: 'TV', x: 600, y: 450, w: 100, h: 20, color: '#2c3e50', need: 'fun', gain: 40, cost: 0, msg: 'Watching TV...' },
    { name: 'Computer', x: 100, y: 450, w: 60, h: 40, color: '#95a5a6', need: 'fun', gain: 20, cost: 0, msg: 'Gaming...', workReward: 10 }
  ];

  const DEFAULTS = {
    tileSize: 64,
    arrivalThreshold: 5,
    moveSpeed: 3,
    actionDurationMs: 2000,
    /** Per ~16.67ms frame at 60fps — scaled by dt in step */
    decayHungerPerTick: 0.01,
    decayEnergyPerTick: 0.005,
    decayFunPerTick: 0.015,
    referenceFrameMs: 1000 / 60,
    startX: 300,
    startY: 300,
    startNeeds: { hunger: 80, energy: 100, fun: 60 },
    startMoney: 100,
    lyferColor: '#4ade80',
    ringColor: '#4ade80',
    characterRadius: 20
  };

  function cloneObjects(list) {
    return list.map(function (o) {
      return {
        name: o.name,
        x: o.x,
        y: o.y,
        w: o.w,
        h: o.h,
        color: o.color,
        need: o.need,
        gain: o.gain,
        cost: o.cost,
        msg: o.msg,
        workReward: o.workReward
      };
    });
  }

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const sourceObjects = (opts && opts.objects) || DEFAULT_OBJECTS;
    const objects = cloneObjects(sourceObjects);
    const cb = (opts && opts.callbacks) || {};

    const s = {
      objects,
      lyfer: null,
      now: 0
    };

    function makeLyfer() {
      return {
        x: cfg.startX,
        y: cfg.startY,
        targetX: cfg.startX,
        targetY: cfg.startY,
        speed: cfg.moveSpeed,
        color: cfg.lyferColor,
        needs: {
          hunger: cfg.startNeeds.hunger,
          energy: cfg.startNeeds.energy,
          fun: cfg.startNeeds.fun
        },
        money: cfg.startMoney,
        action: null,
        actionElapsedMs: 0
      };
    }

    function notifyUI() {
      const L = s.lyfer;
      if (typeof cb.onNeeds === 'function') {
        cb.onNeeds({
          hunger: L.needs.hunger,
          energy: L.needs.energy,
          fun: L.needs.fun,
          money: L.money
        });
      }
    }

    function clampNeeds() {
      const n = s.lyfer.needs;
      n.hunger = Math.max(0, Math.min(100, n.hunger));
      n.energy = Math.max(0, Math.min(100, n.energy));
      n.fun = Math.max(0, Math.min(100, n.fun));
    }

    function step(dtMs, input) {
      const now = (input && input.now != null) ? input.now : (typeof performance !== 'undefined' ? performance.now() : Date.now());
      s.now = now;
      const L = s.lyfer;
      const tick = dtMs / cfg.referenceFrameMs;

      if (!L.action) {
        L.needs.hunger -= cfg.decayHungerPerTick * tick;
        L.needs.energy -= cfg.decayEnergyPerTick * tick;
        L.needs.fun -= cfg.decayFunPerTick * tick;
      }

      const dx = L.targetX - L.x;
      const dy = L.targetY - L.y;
      const dist = Math.hypot(dx, dy);

      if (dist > cfg.arrivalThreshold) {
        L.x += (dx / dist) * L.speed;
        L.y += (dy / dist) * L.speed;
        L.actionElapsedMs = 0;
      } else if (L.action) {
        L.actionElapsedMs += dtMs;
        if (L.actionElapsedMs >= cfg.actionDurationMs) {
          const act = L.action;
          L.needs[act.need] += act.gain;
          L.money -= act.cost;
          if (act.workReward != null) L.money += act.workReward;
          L.action = null;
          L.actionElapsedMs = 0;
        }
      }

      clampNeeds();
      notifyUI();
    }

    function hitTest(mx, my) {
      for (let i = s.objects.length - 1; i >= 0; i--) {
        const obj = s.objects[i];
        if (mx > obj.x && mx < obj.x + obj.w && my > obj.y && my < obj.y + obj.h) {
          return obj;
        }
      }
      return null;
    }

    function click(canvasX, canvasY) {
      const L = s.lyfer;
      const clicked = hitTest(canvasX, canvasY);
      if (clicked) {
        L.targetX = clicked.x + clicked.w / 2;
        L.targetY = clicked.y + clicked.h / 2;
        L.action = clicked;
        L.actionElapsedMs = 0;
      } else {
        L.targetX = canvasX;
        L.targetY = canvasY;
        L.action = null;
        L.actionElapsedMs = 0;
      }
      notifyUI();
    }

    function getState() {
      const L = s.lyfer;
      const dist = Math.hypot(L.targetX - L.x, L.targetY - L.y);
      const atTarget = dist <= cfg.arrivalThreshold;
      const bubble =
        L.action && atTarget
          ? { visible: true, text: L.action.msg, x: L.x, y: L.y - 40 }
          : { visible: false, text: '', x: L.x, y: L.y - 40 };

      return {
        lyfer: {
          x: L.x,
          y: L.y,
          targetX: L.targetX,
          targetY: L.targetY,
          color: L.color,
          needs: { hunger: L.needs.hunger, energy: L.needs.energy, fun: L.needs.fun },
          money: L.money,
          hasAction: !!L.action,
          actionElapsedMs: L.actionElapsedMs,
          actionDurationMs: cfg.actionDurationMs
        },
        objects: s.objects.map(function (o) {
          return {
            name: o.name,
            x: o.x,
            y: o.y,
            w: o.w,
            h: o.h,
            color: o.color,
            need: o.need,
            gain: o.gain,
            cost: o.cost,
            msg: o.msg,
            workReward: o.workReward
          };
        }),
        bubble,
        tileSize: cfg.tileSize,
        roomMargin: 50,
        roomBottomInset: 200,
        ringColor: cfg.ringColor,
        characterRadius: cfg.characterRadius,
        now: s.now
      };
    }

    function reset() {
      s.lyfer = makeLyfer();
      s.objects = cloneObjects(sourceObjects);
      notifyUI();
    }

    s.lyfer = makeLyfer();
    notifyUI();

    return {
      step,
      getState,
      click,
      reset,
      DEFAULT_OBJECTS,
      config: cfg
    };
  }

  coffee.playLyfeGame = {
    create,
    DEFAULT_OBJECTS,
    DEFAULTS
  };
  window.coffee = coffee;
})();
