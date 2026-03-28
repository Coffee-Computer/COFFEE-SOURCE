/**
 * coffee.playShapes — reusable Canvas2D “sprites” for micro-games (no deps).
 * Extracted from CIRCLE-DUDE + CIRCLE-DUDE-POC1 patterns; safe to load without coffee.play.
 *
 * coffee.playShapes.drawPac(ctx, opts)
 * coffee.playShapes.drawGhost(ctx, opts)
 * coffee.playShapes.drawPellet(ctx, opts)
 * coffee.playShapes.drawWallFilled(ctx, opts)   — solid maze block (play template)
 * coffee.playShapes.drawWallNeon(ctx, opts)     — stroked tile (POC1 look)
 * coffee.playShapes.drawGhostGate(ctx, opts)    — horizontal bar (ghost house)
 * coffee.playShapes.drawShip(ctx, opts)         — thrust triangle + flame (SHIPZ)
 * coffee.playShapes.drawAsteroidRock(ctx, opts) — jagged polygon from offsets[]
 * coffee.playShapes.drawBulletDot(ctx, opts)    — filled circle
 * coffee.playShapes.drawParticle(ctx, opts)     — alpha dot (explosion bits)
 * coffee.playShapes.drawPlatformSky(ctx, opts)   — full-viewport fill (MANNY)
 * coffee.playShapes.drawPlatformTile(ctx, opts) — tile types 1–5 (screen x,y)
 * coffee.playShapes.drawMannyHero(ctx, opts)     — red plumber-ish rect (screen coords)
 * coffee.playShapes.drawEnemyGoomba(ctx, opts)   — brown circle enemy (screen coords)
 * coffee.playShapes.drawTetrominoCell(ctx, opts) — grid cell (Super Shapes / tetromino POC)
 * coffee.playShapes.drawSurvivalGrid(ctx, opts)   — world grid lines (Stay Alive)
 * coffee.playShapes.drawSurvivalPlayer(ctx, opts) — circle + facing tick
 * coffee.playShapes.drawSurvivalLootIcon(ctx, opts) — emoji/text at screen coords
 * coffee.playShapes.drawZomboniArenaGrid(ctx, opts) — dark floor grid
 * coffee.playShapes.drawZomboniBullet(ctx, opts)
 * coffee.playShapes.drawZomboniEnemy(ctx, opts) — zombie + red eyes
 * coffee.playShapes.drawZomboniPlayer(ctx, opts) — gun + blue body + yellow head
 * coffee.playShapes.drawFarmSoilTile(ctx, opts) — rounded soil / grass cell
 * coffee.playShapes.drawFarmGrowingOverlay(ctx, opts) — sprout + growth bar
 * coffee.playShapes.drawFarmMatureOverlay(ctx, opts) — crop icon + harvest dashed box
 * coffee.playShapes.drawSweetToothBoardBorder(ctx, opts) — magenta frame around board
 * coffee.playShapes.drawSweetToothCheckerCell(ctx, opts) — alternating tile tint
 * coffee.playShapes.drawSweetToothPickHighlight(ctx, opts) — cyan selection
 * coffee.playShapes.drawSweetToothCandy(ctx, opts) — scaled emoji candy
 * coffee.playShapes.drawTerritorySky(ctx, opts) — vertical sky gradient (screen space)
 * coffee.playShapes.drawTerritoryBlock(ctx, opts) — filled tile + POC shading (world px)
 * coffee.playShapes.drawTerritoryPlayer(ctx, opts) — blue shirt + head + eyes by vx (world px)
 * coffee.playShapes.drawTerritoryCursorTile(ctx, opts) — white stroke highlight (world px)
 * coffee.playShapes.drawLyfeFloorGrid(ctx, opts) — subtle tile strokes (LYFE room)
 * coffee.playShapes.drawLyfeRoomBorder(ctx, opts) — outer stroke rect (margins)
 * coffee.playShapes.drawLyfeAppliance(ctx, opts) — shadowed rect + name label
 * coffee.playShapes.drawLyfeCharacter(ctx, opts) — circle body + pulse ring + look-at eyes
 * coffee.playShapes.drawBouncySkyGradient(ctx, opts) — vertical slate gradient (BOUNCY)
 * coffee.playShapes.drawBouncyGround(ctx, opts) — floor fill + top strip (camera offset)
 * coffee.playShapes.drawBouncyStackBlock(ctx, opts) — centered rect + shadow + shine
 * coffee.playShapes.drawBouncyDropGuide(ctx, opts) — dashed vertical drop line
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} o
   * @param {number} o.cx o.cy o.radius
   * @param {number} [o.dirX] [o.dirY] -1|0|1 grid/step dir (screen Y down = dy positive)
   * @param {number} [o.mouthOpen] 0..~0.35 wedge size (POC1 style multiplier on PI)
   * @param {string} [o.fill]
   */
  function drawPac(ctx, o) {
    const cx = o.cx;
    const cy = o.cy;
    const r = o.radius;
    const dx = o.dirX ?? 0;
    const dy = o.dirY ?? 0;
    const mouth = o.mouthOpen != null ? o.mouthOpen : 0.2;
    ctx.fillStyle = o.fill || '#ffe135';
    ctx.beginPath();
    if (dx === 0 && dy === 0) {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      const rot = Math.atan2(dy, dx);
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, rot + mouth * Math.PI, rot + (2 - mouth) * Math.PI);
    }
    ctx.fill();
  }

  /**
   * @param {object} o
   * @param {number} [o.dirX] [o.dirY] eye look direction (-1..1)
   */
  function drawGhost(ctx, o) {
    const x = o.cx;
    const y = o.cy;
    const radius = o.radius;
    const color = o.scared ? '#1e3a8a' : (o.color || '#ff0000');
    const dirX = o.dirX ?? 0;
    const dirY = o.dirY ?? 0;
    const pupil = Math.max(0.8, radius * 0.12);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - radius * 0.15, radius * 0.85, Math.PI, 0);
    ctx.lineTo(x + radius, y + radius * 0.5);
    for (let i = 3; i >= 0; i--) {
      ctx.lineTo(x + radius * (0.75 - i * 0.5), y + radius * 0.9);
    }
    ctx.lineTo(x - radius, y + radius * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - radius * 0.35, y - radius * 0.15, radius * 0.22, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.35, y - radius * 0.15, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - radius * 0.35 + dirX * pupil, y - radius * 0.12 + dirY * pupil, radius * 0.1, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.35 + dirX * pupil, y - radius * 0.12 + dirY * pupil, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPellet(ctx, o) {
    const { cx, cy, r, power } = o;
    ctx.beginPath();
    ctx.fillStyle = power ? '#fff' : '#ffb897';
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWallFilled(ctx, o) {
    const { x, y, size, fill = '#2121de', stroke = '#4c4cff', lineWidth = 2 } = o;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  }

  function drawWallNeon(ctx, o) {
    const { x, y, size, stroke = '#2424b3', lineWidth = 2, inset = 2 } = o;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
  }

  function drawGhostGate(ctx, o) {
    const { x, y, size, fill = '#555' } = o;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y + size / 2 - 2, size, 4);
  }

  /** @param {object} o cx, cy, angle (rad), thrusting?, hullStroke, flameStroke, lineWidth */
  function drawShip(ctx, o) {
    const cx = o.cx;
    const cy = o.cy;
    const ang = o.angle;
    const thrusting = !!o.thrusting;
    const hull = o.hullStroke || '#00ffcc';
    const flame = o.flameStroke || '#ff3300';
    const lw = o.lineWidth != null ? o.lineWidth : 2;
    if (o.visible === false) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.strokeStyle = hull;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.stroke();
    if (thrusting) {
      ctx.strokeStyle = flame;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  /** @param {object} o cx, cy, radius, vertCount, offsets (length vertCount, 0.8–1.2 multipliers) */
  function drawAsteroidRock(ctx, o) {
    const { cx, cy, radius, vertCount, offsets } = o;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = o.stroke || '#fff';
    ctx.lineWidth = o.lineWidth != null ? o.lineWidth : 1.5;
    ctx.beginPath();
    for (let i = 0; i < vertCount; i++) {
      const angle = (i / vertCount) * Math.PI * 2;
      const r = radius * offsets[i];
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawBulletDot(ctx, o) {
    ctx.fillStyle = o.fill || '#ff3300';
    ctx.beginPath();
    ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticle(ctx, o) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, o.life);
    ctx.fillStyle = o.color || '#fff';
    ctx.beginPath();
    ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlatformSky(ctx, o) {
    const w = o.w;
    const h = o.h;
    ctx.fillStyle = o.color || '#5c94fc';
    ctx.fillRect(0, 0, w, h);
  }

  /** @param {object} o type 1=ground 2=brick 3=mystery 4=pipe 5=goal — x,y,size screen */
  function drawPlatformTile(ctx, o) {
    const tx = o.x;
    const ty = o.y;
    const T = o.size;
    const tile = o.type;
    if (tile === 1) {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(tx, ty, T, T);
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(tx, ty, T, 5);
    } else if (tile === 2) {
      ctx.fillStyle = '#a52a2a';
      ctx.fillRect(tx + 1, ty + 1, T - 2, T - 2);
    } else if (tile === 3) {
      ctx.fillStyle = '#ffa500';
      ctx.fillRect(tx + 1, ty + 1, T - 2, T - 2);
      ctx.fillStyle = 'white';
      ctx.font = (o.fontSize || 20) + 'px Arial';
      ctx.fillText('?', tx + 15, ty + 25);
    } else if (tile === 4) {
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(tx + 5, ty, T - 10, T);
    } else if (tile === 5) {
      ctx.fillStyle = 'white';
      ctx.fillRect(tx + 18, ty - 100, 4, 140);
      ctx.fillStyle = 'green';
      ctx.fillRect(tx - 10, ty - 100, 30, 20);
    }
  }

  /** Screen-space Manny (POC look): sx = worldX - cameraX */
  function drawMannyHero(ctx, o) {
    const sx = o.sx;
    const sy = o.sy;
    const w = o.w;
    const h = o.h;
    const fr = o.facingRight !== false;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(sx, sy, w, h);
    ctx.fillStyle = '#000';
    const eyeX = fr ? sx + 20 : sx + 5;
    ctx.fillRect(eyeX, sy + 8, 5, 5);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(sx + 10, sy + 25, 10, 5);
  }

  function drawEnemyGoomba(ctx, o) {
    const sx = o.sx;
    const sy = o.sy;
    const w = o.w != null ? o.w : 30;
    const h = o.h != null ? o.h : 30;
    const cx = sx + w / 2;
    const cy = sy + h / 2;
    const r = o.radius != null ? o.radius : 15;
    ctx.fillStyle = o.fill || '#8b4513';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillRect(sx + 8, sy + 10, 4, 4);
    ctx.fillRect(sx + 18, sy + 10, 4, 4);
  }

  function drawSurvivalGrid(ctx, o) {
    const viewW = o.viewW;
    const viewH = o.viewH;
    const camX = o.camX;
    const camY = o.camY;
    const step = o.step != null ? o.step : 100;
    ctx.strokeStyle = o.stroke || '#243a24';
    ctx.lineWidth = 1;
    let x;
    let y;
    for (x = -camX % step; x < viewW; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewH);
      ctx.stroke();
    }
    for (y = -camY % step; y < viewH; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(viewW, y);
      ctx.stroke();
    }
  }

  function drawSurvivalPlayer(ctx, o) {
    const cx = o.cx;
    const cy = o.cy;
    const r = o.r;
    ctx.fillStyle = o.fill || '#4ade80';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = o.noseStroke || 'white';
    ctx.lineWidth = o.noseWidth != null ? o.noseWidth : 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - (o.noseLen != null ? o.noseLen : 25));
    ctx.stroke();
  }

  function drawSurvivalLootIcon(ctx, o) {
    ctx.font = o.font || '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.icon, o.cx, o.cy);
  }

  function drawZomboniArenaGrid(ctx, o) {
    const w = o.w;
    const h = o.h;
    const grid = o.grid != null ? o.grid : 60;
    ctx.strokeStyle = o.stroke || '#1a1a1a';
    ctx.lineWidth = 1;
    let gx;
    let gy;
    for (gx = 0; gx < w; gx += grid) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (gy = 0; gy < h; gy += grid) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
  }

  function drawZomboniBullet(ctx, o) {
    ctx.fillStyle = o.fill || '#ffcc00';
    ctx.beginPath();
    ctx.arc(o.cx, o.cy, o.r != null ? o.r : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawZomboniEnemy(ctx, o) {
    const x = o.cx;
    const y = o.cy;
    const rad = o.r != null ? o.r : o.size;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    const look = o.lookAngle != null ? o.lookAngle : 0;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + Math.cos(look + 0.4) * 8, y + Math.sin(look + 0.4) * 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + Math.cos(look - 0.4) * 8, y + Math.sin(look - 0.4) * 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawZomboniPlayer(ctx, o) {
    const x = o.cx;
    const y = o.cy;
    const size = o.size;
    const ang = o.angle;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = o.gunFill || '#444';
    ctx.fillRect(10, -4, 18, 8);
    ctx.fillStyle = o.bodyFill || '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = o.headFill || '#fde047';
    ctx.beginPath();
    ctx.arc(-2, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function pathRoundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, rr);
      return;
    }
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawFarmSoilTile(ctx, o) {
    const fill = !o.tilled ? '#568a4d' : (o.watered ? '#4d3319' : '#6b4423');
    ctx.fillStyle = fill;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    const inset = 2;
    const px = o.px + inset;
    const py = o.py + inset;
    const w = o.size - inset * 2;
    const h = w;
    const rad = o.radius != null ? o.radius : 8;
    pathRoundRect(ctx, px, py, w, h, rad);
    ctx.fill();
    ctx.stroke();
  }

  function drawFarmGrowingOverlay(ctx, o) {
    const sproutSize = (o.size * 0.4) * o.growth + 5;
    const cx = o.px + o.size / 2;
    const cy = o.py + o.size / 2;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(cx, cy, sproutSize / 2, 0, Math.PI * 2);
    ctx.fill();
    const bw = o.size - 24;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(o.px + 12, o.py + o.size - 12, bw, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(o.px + 12, o.py + o.size - 12, bw * o.growth, 4);
  }

  function drawFarmMatureOverlay(ctx, o) {
    ctx.font = o.font || '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.icon, o.cx, o.cy);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(o.px + 6, o.py + 6, o.size - 12, o.size - 12);
    ctx.setLineDash([]);
  }

  function drawSweetToothBoardBorder(ctx, o) {
    ctx.strokeStyle = o.stroke || '#ff00ff';
    ctx.lineWidth = o.lineWidth != null ? o.lineWidth : 6;
    const pad = o.pad != null ? o.pad : 3;
    ctx.strokeRect(o.x - pad, o.y - pad, o.w + pad * 2, o.h + pad * 2);
  }

  function drawSweetToothCheckerCell(ctx, o) {
    ctx.fillStyle = o.light
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(255,255,255,0.08)';
    ctx.fillRect(o.px, o.py, o.size, o.size);
  }

  function drawSweetToothPickHighlight(ctx, o) {
    ctx.fillStyle = 'rgba(0,255,255,0.4)';
    ctx.fillRect(o.px, o.py, o.size, o.size);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(o.px + 4, o.py + 4, o.size - 8, o.size - 8);
  }

  function drawSweetToothCandy(ctx, o) {
    const sc = o.scale != null ? o.scale : 1;
    ctx.save();
    ctx.translate(o.cx, o.cy);
    ctx.scale(sc, sc);
    ctx.font = o.font || 'bold 54px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;
    ctx.fillStyle = o.textFill || '#ffffff';
    ctx.fillText(o.icon, 0, 0);
    ctx.restore();
  }

  /** Full-viewport sky (call before world translate). o.h = canvas height */
  function drawTerritorySky(ctx, o) {
    const h = o.h;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, o.top || '#29a3e3');
    sky.addColorStop(1, o.bottom || '#87CEEB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, o.w, h);
  }

  /** World-space tile top-left o.x,o.y size o.size color o.color */
  function drawTerritoryBlock(ctx, o) {
    const { x, y, size, color } = o;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x, y + size - 4, size, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, y, size, 4);
  }

  /** o.x,o.y player top-left; o.w,o.h; o.vx for eye flip */
  function drawTerritoryPlayer(ctx, o) {
    const { x, y, w, h, vx } = o;
    ctx.fillStyle = '#3F51B5';
    ctx.fillRect(x, y + 20, w, 26);
    ctx.fillStyle = '#FFCC88';
    ctx.fillRect(x + 2, y, w - 4, 20);
    ctx.fillStyle = '#000';
    const eyeX = (vx != null && vx >= 0) ? 14 : 4;
    ctx.fillRect(x + eyeX, y + 6, 4, 4);
  }

  function drawTerritoryCursorTile(ctx, o) {
    ctx.strokeStyle = o.stroke || 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = o.lineWidth != null ? o.lineWidth : 2;
    ctx.strokeRect(o.x, o.y, o.size, o.size);
  }

  function drawLyfeFloorGrid(ctx, o) {
    const ts = o.tileSize != null ? o.tileSize : 64;
    const cols = Math.ceil(o.w / ts);
    const rows = Math.ceil(o.h / ts);
    ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.strokeRect(i * ts, j * ts, ts, ts);
      }
    }
  }

  /** o.margin, o.bottomInset — POC: strokeRect(margin, margin, w-2m, h-margin-bottom) */
  function drawLyfeRoomBorder(ctx, o) {
    const m = o.margin != null ? o.margin : 50;
    const bi = o.bottomInset != null ? o.bottomInset : 200;
    ctx.strokeStyle = o.stroke || '#fff';
    ctx.lineWidth = o.lineWidth != null ? o.lineWidth : 5;
    ctx.strokeRect(m, m, o.w - m * 2, o.h - m - bi);
  }

  function drawLyfeAppliance(ctx, o) {
    ctx.save();
    ctx.fillStyle = o.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = o.labelFill || 'white';
    ctx.font = o.font || '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(o.name, o.x + o.w / 2, o.y - 5);
    ctx.restore();
  }

  /** o.cx, o.cy, o.radius, o.color, o.targetX, o.targetY, o.now — pulse ring + eyes */
  function drawLyfeCharacter(ctx, o) {
    const cx = o.cx;
    const cy = o.cy;
    const r = o.radius != null ? o.radius : 20;
    ctx.fillStyle = o.color || '#4ade80';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    const now = o.now != null ? o.now : Date.now();
    const pulse = 25 + Math.sin(now / 200) * 2;
    ctx.strokeStyle = o.ringColor || '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();

    const angle = Math.atan2(o.targetY - cy, o.targetX - cx);
    const ex = cx + Math.cos(angle) * 10;
    const ey = cy + Math.sin(angle) * 10;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(ex - 5, ey, 3, 0, Math.PI * 2);
    ctx.arc(ex + 5, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBouncySkyGradient(ctx, o) {
    const h = o.h;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, o.top || '#1e293b');
    grad.addColorStop(1, o.bottom || '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, o.w, h);
  }

  /** World floor drawn in screen space: top of fill at (height - groundY - cameraY) */
  function drawBouncyGround(ctx, o) {
    const top = o.h - o.groundY - o.cameraY;
    ctx.fillStyle = o.fill || '#334155';
    ctx.fillRect(0, top, o.w, o.h + 500);
    ctx.fillStyle = o.stripFill || '#475569';
    ctx.fillRect(0, top, o.w, 8);
  }

  /** o.cx, o.cy — center of block in canvas pixels */
  function drawBouncyStackBlock(ctx, o) {
    const w = o.w;
    const h = o.h;
    ctx.save();
    ctx.translate(o.cx, o.cy);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);
    ctx.fillStyle = o.color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-w / 2, -h / 2, w, 4);
    ctx.restore();
  }

  function drawBouncyDropGuide(ctx, o) {
    ctx.save();
    ctx.setLineDash(o.dash || [4, 4]);
    ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.1)';
    ctx.lineWidth = o.lineWidth != null ? o.lineWidth : 1;
    ctx.beginPath();
    ctx.moveTo(o.x, o.yTop);
    ctx.lineTo(o.x, o.yTo);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /** @param o px, py — top-left pixel; size — cell edge; color; ghost — dimmed ghost piece */
  function drawTetrominoCell(ctx, o) {
    const ghost = !!o.ghost;
    ctx.fillStyle = o.color;
    ctx.globalAlpha = ghost ? 0.3 : 1;
    ctx.fillRect(o.px, o.py, o.size, o.size);
    ctx.strokeStyle = ghost ? o.color : (o.strokeEmpty || 'rgba(255,255,255,0.1)');
    ctx.strokeRect(o.px, o.py, o.size, o.size);
    ctx.globalAlpha = 1;
  }

  coffee.playShapes = {
    drawPac,
    drawGhost,
    drawPellet,
    drawWallFilled,
    drawWallNeon,
    drawGhostGate,
    drawShip,
    drawAsteroidRock,
    drawBulletDot,
    drawParticle,
    drawPlatformSky,
    drawPlatformTile,
    drawMannyHero,
    drawEnemyGoomba,
    drawTetrominoCell,
    drawSurvivalGrid,
    drawSurvivalPlayer,
    drawSurvivalLootIcon,
    drawZomboniArenaGrid,
    drawZomboniBullet,
    drawZomboniEnemy,
    drawZomboniPlayer,
    drawFarmSoilTile,
    drawFarmGrowingOverlay,
    drawFarmMatureOverlay,
    drawSweetToothBoardBorder,
    drawSweetToothCheckerCell,
    drawSweetToothPickHighlight,
    drawSweetToothCandy,
    drawTerritorySky,
    drawTerritoryBlock,
    drawTerritoryPlayer,
    drawTerritoryCursorTile,
    drawLyfeFloorGrid,
    drawLyfeRoomBorder,
    drawLyfeAppliance,
    drawLyfeCharacter,
    drawBouncySkyGradient,
    drawBouncyGround,
    drawBouncyStackBlock,
    drawBouncyDropGuide
  };

  window.coffee = coffee;
})();
