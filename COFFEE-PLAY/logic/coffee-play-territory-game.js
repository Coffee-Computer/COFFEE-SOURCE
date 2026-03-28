/**
 * coffee.playTerritoryGame — headless 2D tile sandbox (no canvas, no DOM).
 * From TERRITORY1-POC: procedural world, AABB player, smooth camera, mine/place reach.
 *
 * coffee.playTerritoryGame.create({ callbacks?, config?, blockData? })
 *   → { step, getState, setSelectedSlot, reset, mouseWorldCell, BLOCKS, blockData, config }
 *
 * callbacks.onInventory(inventory, selectedSlot, blockData) — blockData passed so UI works during create()
 *
 * step(dtMs, input)
 *   keys — CUP-style lowercase: a,d,w, arrowleft, arrowright, arrowup, ' '
 *   mouseCanvasX, mouseCanvasY, mouseDown — canvas pixel coords (same space as POC mouse)
 *   viewW, viewH — canvas size for camera smoothing & culling hints
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const BLOCKS = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5
  };

  const DEFAULT_BLOCK_DATA = {
    [BLOCKS.DIRT]: { color: '#8B4513', emoji: '🟫', name: 'Dirt' },
    [BLOCKS.GRASS]: { color: '#228B22', emoji: '🌱', name: 'Grass' },
    [BLOCKS.STONE]: { color: '#808080', emoji: '🪨', name: 'Stone' },
    [BLOCKS.WOOD]: { color: '#5D4037', emoji: '🪵', name: 'Wood' },
    [BLOCKS.LEAVES]: { color: '#2E7D32', emoji: '🍃', name: 'Leaves' }
  };

  const DEFAULTS = {
    tileSize: 32,
    worldWidth: 250,
    worldHeight: 80,
    gravity: 0.35,
    friction: 0.82,
    moveAccel: 0.8,
    jumpForce: -8.5,
    collisionBuffer: 0.1,
    cameraLerp: 0.15,
    reachPx: 180,
    playerWidth: 22,
    playerHeight: 46,
    initialInventory: [
      { type: BLOCKS.DIRT, count: 50 },
      { type: BLOCKS.WOOD, count: 20 },
      { type: BLOCKS.STONE, count: 10 }
    ]
  };

  function create(opts) {
    const cfg = { ...DEFAULTS, ...(opts && opts.config) };
    const BLOCK_DATA = (opts && opts.blockData) || DEFAULT_BLOCK_DATA;
    const cb = (opts && opts.callbacks) || {};

    const s = {
      world: [],
      camera: { x: 0, y: 0 },
      player: null,
      viewW: 800,
      viewH: 600
    };

    function notifyInventory() {
      if (typeof cb.onInventory === 'function') {
        cb.onInventory(s.player.inventory, s.player.selectedSlot, BLOCK_DATA);
      }
    }

    function findSurface(wx) {
      if (wx < 0 || wx >= cfg.worldWidth) return 0;
      for (let y = 0; y < cfg.worldHeight; y++) {
        if (s.world[wx][y] !== BLOCKS.AIR) return y;
      }
      return cfg.worldHeight - 1;
    }

    function safeSetBlock(x, y, type) {
      if (x >= 0 && x < cfg.worldWidth && y >= 0 && y < cfg.worldHeight) {
        s.world[x][y] = type;
      }
    }

    function generateWorld() {
      const W = cfg.worldWidth;
      const H = cfg.worldHeight;
      for (let x = 0; x < W; x++) {
        s.world[x] = new Array(H).fill(BLOCKS.AIR);
      }

      for (let x = 0; x < W; x++) {
        const groundHeight = 40 + Math.sin(x * 0.1) * 6 + Math.cos(x * 0.05) * 3;
        for (let y = 0; y < H; y++) {
          if (y > groundHeight + 8) {
            s.world[x][y] = BLOCKS.STONE;
          } else if (y > groundHeight) {
            s.world[x][y] = BLOCKS.DIRT;
          } else if (y > groundHeight - 1) {
            s.world[x][y] = BLOCKS.GRASS;
          }
        }
      }

      for (let x = 10; x < W - 10; x++) {
        if (x % 12 === 0 && Math.random() > 0.3) {
          const groundY = findSurface(x);
          if (s.world[x][groundY] === BLOCKS.GRASS) {
            for (let h = 1; h <= 5; h++) {
              safeSetBlock(x, groundY - h, BLOCKS.WOOD);
            }
            const ly = groundY - 5;
            safeSetBlock(x - 1, ly, BLOCKS.LEAVES);
            safeSetBlock(x + 1, ly, BLOCKS.LEAVES);
            safeSetBlock(x, ly - 1, BLOCKS.LEAVES);
          }
        }
      }
    }

    function makePlayer() {
      const ts = cfg.tileSize;
      const px = (cfg.worldWidth * ts) / 2;
      const cx = Math.floor(px / ts);
      const py = (findSurface(cx) - 3) * ts;
      return {
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        width: cfg.playerWidth,
        height: cfg.playerHeight,
        grounded: false,
        selectedSlot: 0,
        inventory: cfg.initialInventory.map(function (row) {
          return { type: row.type, count: row.count };
        })
      };
    }

    function key(keys, a, b, c) {
      return !!(keys[a] || (b && keys[b]) || (c && keys[c]));
    }

    function checkCollisions(isHorizontal) {
      const p = s.player;
      const ts = cfg.tileSize;
      const buf = cfg.collisionBuffer;
      const left = Math.floor(p.x / ts);
      const right = Math.floor((p.x + p.width) / ts);
      const top = Math.floor(p.y / ts);
      const bottom = Math.floor((p.y + p.height) / ts);

      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          if (x >= 0 && x < cfg.worldWidth && y >= 0 && y < cfg.worldHeight) {
            if (s.world[x][y] !== BLOCKS.AIR) {
              if (isHorizontal) {
                if (p.vx > 0) {
                  p.x = x * ts - p.width - buf;
                } else if (p.vx < 0) {
                  p.x = (x + 1) * ts + buf;
                }
                p.vx = 0;
              } else {
                if (p.vy > 0) {
                  p.y = y * ts - p.height - buf;
                  p.grounded = true;
                } else if (p.vy < 0) {
                  p.y = (y + 1) * ts + buf;
                }
                p.vy = 0;
              }
            }
          }
        }
      }
    }

    function handleInteract(mcx, mcy) {
      const p = s.player;
      const ts = cfg.tileSize;
      const cam = s.camera;
      const worldX = Math.floor((mcx + cam.x) / ts);
      const worldY = Math.floor((mcy + cam.y) / ts);

      if (worldX < 0 || worldX >= cfg.worldWidth || worldY < 0 || worldY >= cfg.worldHeight) return;

      const dx = (p.x + p.width / 2) - (worldX * ts + ts / 2);
      const dy = (p.y + p.height / 2) - (worldY * ts + ts / 2);
      if (Math.hypot(dx, dy) > cfg.reachPx) return;

      const currentItem = p.inventory[p.selectedSlot];

      if (s.world[worldX][worldY] !== BLOCKS.AIR) {
        const minedType = s.world[worldX][worldY];
        s.world[worldX][worldY] = BLOCKS.AIR;
        let invItem = p.inventory.find(function (i) { return i.type === minedType; });
        if (invItem) invItem.count++;
        else p.inventory.push({ type: minedType, count: 1 });
        notifyInventory();
      } else if (currentItem && currentItem.count > 0) {
        const blockRect = { x: worldX * ts, y: worldY * ts, w: ts, h: ts };
        const pRect = { x: p.x, y: p.y, w: p.width, h: p.height };
        const overlap = !(
          blockRect.x >= pRect.x + pRect.w ||
          blockRect.x + blockRect.w <= pRect.x ||
          blockRect.y >= pRect.y + pRect.h ||
          blockRect.y + blockRect.h <= pRect.y
        );
        if (!overlap) {
          s.world[worldX][worldY] = currentItem.type;
          currentItem.count--;
          notifyInventory();
        }
      }
    }

    function step(dtMs, input) {
      const keys = (input && input.keys) || {};
      const p = s.player;
      const vw = (input && input.viewW) || s.viewW;
      const vh = (input && input.viewH) || s.viewH;
      s.viewW = vw;
      s.viewH = vh;

      let moveDir = 0;
      if (key(keys, 'a', 'arrowleft')) moveDir -= 1;
      if (key(keys, 'd', 'arrowright')) moveDir += 1;

      p.vx += moveDir * cfg.moveAccel;
      p.vx *= cfg.friction;

      if ((key(keys, 'w', 'arrowup') || keys[' ']) && p.grounded) {
        p.vy = cfg.jumpForce;
        p.grounded = false;
      }

      p.vy += cfg.gravity;

      p.x += p.vx;
      checkCollisions(true);

      p.y += p.vy;
      p.grounded = false;
      checkCollisions(false);

      const targetCamX = p.x - vw / 2;
      const targetCamY = p.y - vh / 2;
      const l = cfg.cameraLerp;
      s.camera.x += (targetCamX - s.camera.x) * l;
      s.camera.y += (targetCamY - s.camera.y) * l;

      if (input && input.mouseDown) {
        const mcx = input.mouseCanvasX != null ? input.mouseCanvasX : 0;
        const mcy = input.mouseCanvasY != null ? input.mouseCanvasY : 0;
        handleInteract(mcx, mcy);
      }
    }

    function setSelectedSlot(index) {
      if (index < 0 || index >= s.player.inventory.length) return;
      s.player.selectedSlot = index;
      notifyInventory();
    }

    function getState() {
      return {
        world: s.world,
        camera: { x: s.camera.x, y: s.camera.y },
        player: {
          x: s.player.x,
          y: s.player.y,
          vx: s.player.vx,
          vy: s.player.vy,
          width: s.player.width,
          height: s.player.height,
          grounded: s.player.grounded,
          selectedSlot: s.player.selectedSlot,
          inventory: s.player.inventory.map(function (i) {
            return { type: i.type, count: i.count };
          })
        },
        tileSize: cfg.tileSize,
        worldWidth: cfg.worldWidth,
        worldHeight: cfg.worldHeight,
        viewW: s.viewW,
        viewH: s.viewH
      };
    }

    function mouseWorldCell(mouseCanvasX, mouseCanvasY) {
      const ts = cfg.tileSize;
      return {
        tx: Math.floor((mouseCanvasX + s.camera.x) / ts),
        ty: Math.floor((mouseCanvasY + s.camera.y) / ts)
      };
    }

    function reset() {
      generateWorld();
      s.player = makePlayer();
      s.camera.x = s.player.x - s.viewW / 2;
      s.camera.y = s.player.y - s.viewH / 2;
      notifyInventory();
    }

    generateWorld();
    s.player = makePlayer();
    s.camera.x = s.player.x - 800 / 2;
    s.camera.y = s.player.y - 600 / 2;
    notifyInventory();

    return {
      step,
      getState,
      setSelectedSlot,
      reset,
      mouseWorldCell,
      BLOCKS,
      blockData: BLOCK_DATA,
      config: cfg
    };
  }

  coffee.playTerritoryGame = {
    create,
    BLOCKS,
    DEFAULT_BLOCK_DATA,
    DEFAULTS
  };
  window.coffee = coffee;
})();
