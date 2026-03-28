/** Directory URL of this script (…/DUCK-IDE/). Set synchronously at load. */
var __duckIdeScriptBase = (function () {
    var s = document.currentScript;
    return s && s.src ? new URL('.', s.src).href : '';
})();

function coffeeSourceRootUrl() {
    if (__duckIdeScriptBase) return new URL('../../../', __duckIdeScriptBase);
    return new URL('../../../../', window.location.href);
}

function coffeeScriptUrl(pathFromCoffeeSource) {
    return new URL(String(pathFromCoffeeSource).replace(/^\/+/, ''), coffeeSourceRootUrl()).href;
}

function duckProjectsManifestUrl() {
    if (__duckIdeScriptBase) return new URL('projects/duck-templates.json', __duckIdeScriptBase).href;
    return new URL('../projects/duck-templates.json', window.location.href).href;
}

let editor;

/** When set, preview HTML gets &lt;base href&gt; so template script src (../../…) resolves to that template’s folder. */
let duckPreviewBaseHref = null;

/** Same game as TEMPLATES/CIRCLE-DUDE/CIRCLE-DUDE.html — absolute script URLs work from srcdoc preview. */
const starterCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DUCK preview · Circle-Dude (coffee.play)</title>
    <style>
* { box-sizing: border-box; }
body { margin: 0; background: #000; color: #ffe135; font-family: system-ui, sans-serif; overflow: hidden; }
canvas { display: block; width: 100vw; height: 100vh; touch-action: none; }
#hud {
    position: fixed; left: 0; right: 0; top: 0; padding: 10px 16px;
    display: flex; justify-content: space-between; align-items: flex-start;
    pointer-events: none; font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
    text-shadow: 0 0 8px #000, 0 0 2px #000;
}
.cd-touch {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
    display: flex; flex-direction: column; align-items: center;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    pointer-events: auto; gap: 10px;
}
.cd-touch-grid {
    display: grid; grid-template-columns: repeat(3, minmax(72px, 1fr));
    gap: 10px; max-width: 280px; width: 100%;
}
.cd-touch-btn {
    background: #1a1a2e; color: #fff; border: 1px solid rgba(76, 76, 255, 0.35);
    border-radius: 12px; padding: 14px 8px; font-size: 11px; font-weight: 800;
    letter-spacing: 0.08em; text-align: center; user-select: none;
    touch-action: manipulation; cursor: pointer;
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.08);
}
.cd-touch-btn:active { transform: scale(0.96); background: #252540; }
.cd-touch-hint { font-size: 10px; color: rgba(255, 255, 255, 0.35); font-weight: 600; }
@media (min-width: 768px) { .cd-touch { display: none; } }
    </style>
    <script src="${coffeeScriptUrl('COFFEE-DOT/coffee-dot.js')}"><\/script>
    <script src="${coffeeScriptUrl('COFFEE-CUP/coffee-cup.js')}"><\/script>
    <script src="${coffeeScriptUrl('COFFEE-PLAY/shapes/coffee-play-shapes.js')}"><\/script>
    <script src="${coffeeScriptUrl('COFFEE-PLAY/logic/coffee-play-maze-game.js')}"><\/script>
    <script src="${coffeeScriptUrl('COFFEE-PLAY/coffee-play.js')}"><\/script>
</head>
<body>
    <div id="hud"><span id="score">0</span><span id="lives">♥♥♥</span><span>ARROWS / WASD · TOUCH (≤768px) · POWER DOTS</span></div>
    <canvas id="stage"><\/canvas>
    <div class="cd-touch" id="cd-touch" aria-label="Touch controls">
<div class="cd-touch-grid">
    <span><\/span>
    <button type="button" class="cd-touch-btn" data-dir="up">UP</button>
    <span><\/span>
    <button type="button" class="cd-touch-btn" data-dir="left">LEFT</button>
    <button type="button" class="cd-touch-btn" data-dir="down">DOWN</button>
    <button type="button" class="cd-touch-btn" data-dir="right">RIGHT</button>
</div>
<span class="cd-touch-hint">Tap to queue direction</span>
    </div>
    <script>
(function () {
    var RAW = [
'###############',
'#.............#',
'#.###.#.#.###.#',
'#o...........o#',
'#.###.#.#.###.#',
'#....G#G#G....#',
'#.###.#.#.###.#',
'#o...........o#',
'#.###.#.#.###.#',
'#.....S.......#',
'###############'
    ];

    // DUCK_IDE_ANCHOR_SCRIPT

    var readIntent = coffee.playMazeGame.readIntent;
    var touchIntent = null;

    function setTouchIntent(dir) {
switch (dir) {
    case 'up': touchIntent = { wdr: -1, wdc: 0 }; break;
    case 'down': touchIntent = { wdr: 1, wdc: 0 }; break;
    case 'left': touchIntent = { wdr: 0, wdc: -1 }; break;
    case 'right': touchIntent = { wdr: 0, wdc: 1 }; break;
    default: break;
}
    }

    function mergeIntent(keys) {
var k = readIntent(keys);
if (k.wdr !== 0 || k.wdc !== 0) return k;
if (touchIntent) return touchIntent;
return k;
    }

    (function bindTouchPad() {
var root = document.getElementById('cd-touch');
if (!root) return;
function onGo(dir, ev) {
    if (ev.type === 'touchstart') ev.preventDefault();
    setTouchIntent(dir);
}
root.querySelectorAll('[data-dir]').forEach(function (btn) {
    var dir = btn.getAttribute('data-dir');
    btn.addEventListener('touchstart', onGo.bind(null, dir), { passive: false });
    btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        setTouchIntent(dir);
    });
});
    })();

    window.addEventListener('keydown', function (e) {
if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) e.preventDefault();
    }, { passive: false });

    var mg = coffee.playMazeGame.create({
raw: RAW,
callbacks: {
    onScore: function (sum) {
        var el = document.getElementById('score');
        if (el) el.textContent = String(sum);
    },
    onLives: function (n) {
        var el = document.getElementById('lives');
        if (el) el.textContent = '♥'.repeat(Math.max(0, n));
    },
    onWin: function () {},
    onGameOver: function () {}
}
    });

    var layout = { cell: 24, ox: 0, oy: 0 };

    function drawWorld(ctx, w, h, game) {
var st = mg.getState();
var cell = layout.cell;
var ox = layout.ox;
var oy = layout.oy;
var ROWS = mg.rows;
var COLS = mg.cols;
var walls = mg.mazeWalls;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

// DUCK_IDE_ANCHOR_DRAW  (snippets may use ctx, game, w, h)

for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
        if (!walls[r][c]) continue;
        var wx = ox + c * cell;
        var wy = oy + r * cell;
        coffee.playShapes.drawWallFilled(ctx, { x: wx, y: wy, size: cell });
    }
}

st.pellets.forEach(function (p) {
    var pcx = ox + p.c * cell + cell / 2;
    var pcy = oy + p.r * cell + cell / 2;
    coffee.playShapes.drawPellet(ctx, {
        cx: pcx,
        cy: pcy,
        r: p.power ? cell * 0.18 : cell * 0.1,
        power: !!p.power
    });
});

var pac = st.pac;
var pr = cell * 0.38;
var fdr = pac.dr || pac.wantDr;
var fdc = pac.dc || pac.wantDc;
coffee.playShapes.drawPac(ctx, {
    cx: ox + pac.c * cell,
    cy: oy + pac.r * cell,
    radius: pr,
    dirX: fdc,
    dirY: fdr,
    mouthOpen: 0.22 + Math.sin(st.tick * 0.012) * 0.12,
    fill: '#ffe135'
});

st.ghosts.forEach(function (g) {
    coffee.playShapes.drawGhost(ctx, {
        cx: ox + g.c * cell,
        cy: oy + g.r * cell,
        radius: cell * 0.36,
        color: g.color,
        scared: g.scared > 0,
        dirX: Math.sign(g.dc) || 0,
        dirY: Math.sign(g.dr) || 0
    });
});

if (st.gameOver || st.win) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = st.win ? '#ffe135' : '#ff4444';
    ctx.font = 'bold ' + Math.min(48, cell * 1.2) + 'px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.win ? 'YOU WIN' : 'GAME OVER', w / 2, h / 2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '14px system-ui';
    ctx.fillText('Refresh page to replay', w / 2, h / 2 + 24);
}
    }

    coffee.play('#stage', {
friction: 1,
gravity: 0,
onUpdate: function (game) {
    var canvas = game.canvas;
    layout = mg.layoutForCanvas(canvas.width, canvas.height);
    // DUCK_IDE_ANCHOR_UPDATE
    mg.step(16, mergeIntent(game.keys));
    game.entities.length = 0;
    game.projectiles.length = 0;
},
onDraw: function (ctx, game) {
    drawWorld(ctx, game.canvas.width, game.canvas.height, game);
}
    });
})();
    <\/script>
</body>
</html>`;

const snippets = {
    shapePac: `
// coffee.playShapes — Pac (add inside onDraw after clear/background)
if (coffee.playShapes) {
    coffee.playShapes.drawPac(ctx, {
        cx: game.canvas.width * 0.35,
        cy: game.canvas.height * 0.45,
        radius: 36,
        dirX: 1,
        dirY: 0,
        mouthOpen: 0.2
    });
}`,
    shapeGhost: `
if (coffee.playShapes) {
    coffee.playShapes.drawGhost(ctx, {
        cx: game.canvas.width * 0.65,
        cy: game.canvas.height * 0.45,
        radius: 32,
        color: '#ef4444',
        dirX: 0,
        dirY: 0
    });
}`,
    shapeShip: `
if (coffee.playShapes) {
    coffee.playShapes.drawShip(ctx, {
        cx: game.canvas.width * 0.5,
        cy: game.canvas.height * 0.35,
        angle: -Math.PI / 2,
        thrusting: !!(game.keys[' '] || game.keys['w'])
    });
}`,
    shapeBullet: `
if (coffee.playShapes) {
    coffee.playShapes.drawBulletDot(ctx, {
        cx: game.mouse.x,
        cy: game.mouse.y,
        r: 5,
        fill: '#fbbf24'
    });
}`,
    square: `
ctx.fillStyle = '#f43f5e';
ctx.fillRect(200, 200, 80, 80);`,
    circle: `
ctx.beginPath();
ctx.arc(400, 300, 40, 0, Math.PI * 2);
ctx.fillStyle = '#10b981';
ctx.fill();`,
    movement: `
// Raw RAF loop only — if you use coffee.play, prefer game.keys in onUpdate
const keys = {};
window.onkeydown = e => keys[e.key.toLowerCase()] = true;
window.onkeyup = e => keys[e.key.toLowerCase()] = false;
if (keys['w']) player.y -= 5;
if (keys['s']) player.y += 5;
if (keys['a']) player.x -= 5;
if (keys['d']) player.x += 5;`,
    gravity: `
player.vy = (player.vy || 0);
var gravity = 0.5;
player.vy += gravity;
player.y += player.vy;
if (player.y + player.size > height) {
    player.y = height - player.size;
    player.vy = 0;
}`,
    collision: `
function checkCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}`,
    particle: `
const particles = [];
function createParticle(x, y) {
    particles.push({ x: x, y: y, vx: Math.random()-0.5, vy: Math.random()-0.5, life: 1 });
}
for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.01;
    ctx.fillStyle = 'rgba(255,255,255,' + p.life + ')';
    ctx.fillRect(p.x, p.y, 2, 2);
    if (p.life <= 0) particles.splice(i, 1);
}`
};

function docTypeIndex(s) {
    const a = s.indexOf('<!DOCTYPE');
    const b = s.indexOf('<!doctype');
    const c = s.indexOf('<html');
    let i = -1;
    if (a >= 0) i = a;
    if (b >= 0 && (i < 0 || b < i)) i = b;
    if (c >= 0 && (i < 0 || c < i)) i = c;
    return i;
}

/** Anything before DOCTYPE/html = broken preview (e.g. old cursor-inject JS). */
function isCorruptedHtmlProject(s) {
    if (!s || !String(s).trim()) return false;
    const i = docTypeIndex(s);
    if (i < 0) return true;
    if (i > 0 && /[^\s\uFEFF]/.test(s.slice(0, i))) return true;
    return false;
}

function updateRepairBanner() {
    const el = document.getElementById('duck-repair-banner');
    if (!el || !editor) return;
    const v = editor.getValue();
    const corrupt = isCorruptedHtmlProject(v);
    const dismissed = sessionStorage.getItem('duck_repair_dismissed') === '1';
    const show = corrupt && !dismissed;
    el.classList.toggle('visible', show);
    const msg = document.getElementById('duck-repair-msg');
    if (msg && corrupt) {
        msg.innerHTML = 'This buffer has <strong>content before <code class="duck-code-inline">&lt;!DOCTYPE html&gt;</code></strong> (often from an older DUCK IDE that injected at the cursor). The iframe preview treats that as plain text — not a valid single HTML document. Use <strong>Restore</strong> below.';
    }
}

function restoreStarter() {
    duckPreviewBaseHref = null;
    try {
        localStorage.removeItem('duck_preview_base');
    } catch (e0) {}
    editor.setValue(starterCode);
    localStorage.setItem('duck_ide_code', starterCode);
    sessionStorage.removeItem('duck_repair_dismissed');
    updateRepairBanner();
    updateStats();
    runCode();
}

function injectPreviewBase(html, baseHref) {
    if (!baseHref) return html;
    if (/\b<base\s+href=/i.test(html)) return html;
    const m = html.match(/<head[^>]*>/i);
    if (m) {
        return html.replace(m[0], m[0] + '\n    <base href="' + baseHref + '">');
    }
    return '<base href="' + baseHref + '">\n' + html;
}

function loadTemplateFile(relativeToCoffeeSource) {
    var absFile = new URL(String(relativeToCoffeeSource).replace(/^\/+/, ''), coffeeSourceRootUrl()).href;
    return fetch(absFile)
        .then(function (res) {
            if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
            return res.text();
        })
        .then(function (text) {
            duckPreviewBaseHref = new URL('.', absFile).href;
            try {
                localStorage.setItem('duck_preview_base', duckPreviewBaseHref);
            } catch (e2) {}
            editor.setValue(text);
            localStorage.setItem('duck_ide_code', text);
            updateStats();
            updateRepairBanner();
            if (editor.refresh) editor.refresh();
            runCode();
        });
}

function loadTemplatesManifest() {
    var container = document.getElementById('duck-template-list');
    if (!container) return;
    container.innerHTML = '<span class="duck-muted">Loading…</span>';
    fetch(duckProjectsManifestUrl())
        .then(function (r) {
            if (!r.ok) throw new Error(r.statusText);
            return r.json();
        })
        .then(function (data) {
            container.innerHTML = '';
            (data.templates || []).forEach(function (t) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sidebar-btn duck-sidebar-btn';
                var sub = t.subtitle ? '<span class="duck-template-sub">' + escapeHtml(t.subtitle) + '</span>' : '';
                btn.innerHTML = '<span class="duck-template-title">' + escapeHtml(t.title) + '</span>' + sub;
                (function (file) {
                    btn.addEventListener('click', function () {
                        loadTemplateFile(file).catch(function (err) {
                            window.alert('Could not load template:\n' + (err && err.message ? err.message : String(err)));
                        });
                    });
                })(t.file);
                container.appendChild(btn);
            });
        })
        .catch(function () {
            container.innerHTML = '<p class="duck-muted duck-muted-block">Could not load <code class="duck-code-muted">projects/duck-templates.json</code>. Open DUCK IDE over HTTP (e.g. Live Server).</p>';
        });
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** CodeMirror 5: `height: 100%` often collapses when the wrapper only has flex sizing (α layout). */
var __duckEditorResizeObserver = null;

function duckSyncEditorLayout() {
    if (!editor || typeof editor.setSize !== 'function') return;
    var wrap = document.getElementById('duck-editor-wrap');
    if (!wrap) return;
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    if (h < 24 || w < 24) return;
    editor.setSize(w, h);
    if (typeof editor.refresh === 'function') editor.refresh();
}

function duckOnWindowResizeForEditor() {
    duckSyncEditorLayout();
}

function duckUpdateSidebarToggleAria() {
    var btn = document.getElementById('duck-sidebar-toggle');
    if (!btn) return;
    var collapsed = document.body.classList.contains('duck-sidebar-collapsed');
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('title', collapsed ? 'Open tools panel' : 'Hide tools panel');
}

function duckToggleSidebar() {
    document.body.classList.toggle('duck-sidebar-collapsed');
    try {
        localStorage.setItem('duck_sidebar_collapsed', document.body.classList.contains('duck-sidebar-collapsed') ? '1' : '0');
    } catch (err) {}
    duckUpdateSidebarToggleAria();
    requestAnimationFrame(function () {
        duckSyncEditorLayout();
    });
}

function duckRestoreSidebarCollapsed() {
    try {
        if (localStorage.getItem('duck_sidebar_collapsed') === '1') {
            document.body.classList.add('duck-sidebar-collapsed');
        }
    } catch (err) {}
    duckUpdateSidebarToggleAria();
}

function duckBindEditorLayout() {
    window.removeEventListener('resize', duckOnWindowResizeForEditor);
    window.addEventListener('resize', duckOnWindowResizeForEditor);
    var wrap = document.getElementById('duck-editor-wrap');
    if (__duckEditorResizeObserver) {
        __duckEditorResizeObserver.disconnect();
        __duckEditorResizeObserver = null;
    }
    if (wrap && typeof ResizeObserver !== 'undefined') {
        __duckEditorResizeObserver = new ResizeObserver(function () {
            duckSyncEditorLayout();
        });
        __duckEditorResizeObserver.observe(wrap);
    }
}

function initEditor() {
    duckRestoreSidebarCollapsed();

    editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        tabSize: 4,
        indentUnit: 4,
        lineWrapping: true
    });

    const saved = localStorage.getItem('duck_ide_code');
    const legacy = localStorage.getItem('canvas_forge_code');
    editor.setValue(saved || legacy || starterCode);
    if (legacy && !saved) {
        localStorage.setItem('duck_ide_code', legacy);
    }
    try {
        duckPreviewBaseHref = localStorage.getItem('duck_preview_base') || null;
    } catch (e1) {
        duckPreviewBaseHref = null;
    }

    editor.on('change', () => {
        localStorage.setItem('duck_ide_code', editor.getValue());
        updateStats();
        updateRepairBanner();
        debounce(runCode, 1000)();
    });

    document.getElementById('duck-repair-restore').addEventListener('click', restoreStarter);
    document.getElementById('duck-repair-dismiss').addEventListener('click', function () {
        sessionStorage.setItem('duck_repair_dismissed', '1');
        document.getElementById('duck-repair-banner').classList.remove('visible');
    });

    updateStats();
    updateRepairBanner();
    setupPanelResizer();
    loadTemplatesManifest();

    var sb = document.getElementById('duck-sidebar');
    if (sb) {
        sb.addEventListener('transitionend', function (e) {
            if (e.propertyName !== 'width' && e.propertyName !== 'min-width') return;
            duckSyncEditorLayout();
        });
    }

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            duckBindEditorLayout();
            duckSyncEditorLayout();
        });
    });
    runCode();
}

function runCode() {
    var code = editor.getValue();
    if (duckPreviewBaseHref) {
        code = injectPreviewBase(code, duckPreviewBaseHref);
    }
    const frame = document.getElementById('preview-frame');
    const newFrame = frame.cloneNode();
    frame.parentNode.replaceChild(newFrame, frame);

    const doc = newFrame.contentDocument || newFrame.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();

    newFrame.contentWindow.onerror = function (msg, url, line, col, err) {
        const toast = document.getElementById('error-toast');
        toast.textContent = 'Runtime error: ' + (msg || (err && err.message) || 'unknown');
        toast.classList.remove('hidden');
        setTimeout(function () { toast.classList.add('hidden'); }, 6000);
    };
}

/** Snippet targets (unique strings — no line may be a prefix of another) */
const ANCHOR_SCRIPT = '// DUCK_IDE_ANCHOR_SCRIPT';
const ANCHOR_UPDATE = '// DUCK_IDE_ANCHOR_UPDATE';
const ANCHOR_DRAW = '// DUCK_IDE_ANCHOR_DRAW';

function inject(type) {
    const snippet = snippets[type];
    if (!snippet) return;

    let anchor;
    let indentCols;
    if (type === 'collision') {
        anchor = ANCHOR_SCRIPT;
        indentCols = 8;
    } else if (type === 'movement' || type === 'gravity') {
        anchor = ANCHOR_UPDATE;
        indentCols = 16;
    } else {
        anchor = ANCHOR_DRAW;
        indentCols = 16;
    }

    const full = editor.getValue();
    const idx = full.indexOf(anchor);
    if (idx === -1) {
        updateRepairBanner();
        window.alert(
            'Anchor not found: ' + anchor + '\n\n' +
            'If the editor has JS above <!DOCTYPE> or you’re on an old save, click ' +
            '“Restore Circle-Dude starter” in the sidebar or the yellow bar.'
        );
        return;
    }

    const pad = new Array(indentCols + 1).join(' ');
    const lines = snippet.trim().split('\n');
    const body = lines.map(function (line) {
        return pad + line.replace(/^\s*/, '');
    }).join('\n');
    const replacement = body + '\n' + pad + anchor;

    const from = editor.posFromIndex(idx);
    const to = editor.posFromIndex(idx + anchor.length);
    editor.getDoc().replaceRange(replacement, from, to);
    editor.focus();
    runCode();
}

function resetEditor() {
    if (confirm('Replace everything with the default Circle-Dude starter?')) {
        restoreStarter();
    }
}

function updateStats() {
    document.getElementById('char-count').textContent = 'Chars: ' + editor.getValue().length;
}

function downloadProject() {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duck-ide-game.html';
    a.click();
    URL.revokeObjectURL(url);
}

let timer;
function debounce(fn, ms) {
    return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, ms);
    };
}

/**
 * Split editor / preview using real main row geometry (fixes wrong fixed 320px offset).
 */
function setupPanelResizer() {
    var main = document.getElementById('duck-main-split');
    var handle = document.getElementById('duck-resizer');
    var leftEl = document.getElementById('editor-container');
    if (!main || !handle || !leftEl) return;

    var dragging = false;

    function applySplit(clientX) {
        var rect = main.getBoundingClientRect();
        if (rect.width < 80) return;
        var x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        var pct = (x / rect.width) * 100;
        var clamped = Math.min(82, Math.max(18, pct));
        leftEl.style.flex = '0 0 ' + clamped + '%';
        leftEl.style.maxWidth = 'none';
        requestAnimationFrame(function () {
            duckSyncEditorLayout();
        });
    }

    handle.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        handle.classList.add('dragging');
        try {
            handle.setPointerCapture(e.pointerId);
        } catch (err) {}
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    handle.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        applySplit(e.clientX);
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        handle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (e && e.pointerId != null) {
            try {
                handle.releasePointerCapture(e.pointerId);
            } catch (err2) {}
        }
        duckSyncEditorLayout();
    }

    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
}

window.onload = initEditor;
