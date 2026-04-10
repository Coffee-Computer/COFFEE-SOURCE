/**
 * Coffee Source — ONE script tag to pull the whole in-repo browser stack (best-effort).
 *
 *   <script src="https://cdn.jsdelivr.net/gh/OWNER/REPO@BRANCH/COFFEE-CDN/load-all.js"
 *           data-coffee-cdn="https://cdn.jsdelivr.net/gh/OWNER/REPO@BRANCH/"></script>
 *
 * Or before the tag: window.COFFEE_CDN_BASE = 'https://.../';
 *
 * Order: (1) import map  (2) COFFEE-BASE  (3) parallel ESM imports  (4) classic coffee-*.js at each COFFEE-* package root (CLASSIC_REST)
 *
 * When finished: window.COFFEE_LOAD_ALL_PROMISE resolves; document fires "coffee:cdn:ready".
 *
 * Limits: only listed top-level coffee-*.js under each COFFEE-* package + ESM extras. Nested paths (e.g. COFFEE-COMMUNITY/tools) are NOT auto-loaded. Some scripts may 404 or throw; failures are logged, not fatal.
 */
(function () {
  var cur = document.currentScript;
  var w = typeof window !== 'undefined' ? window : {};
  var base =
    (cur && cur.getAttribute('data-coffee-cdn')) ||
    w.COFFEE_CDN_BASE ||
    'https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/';

  base = String(base).trim();
  if (base.slice(-1) !== '/') base += '/';

  var map = document.createElement('script');
  map.type = 'importmap';
  map.textContent = JSON.stringify({ imports: { '@coffee/': base } });
  var parent = (cur && cur.parentNode) || document.head;
  if (cur && cur.nextSibling) parent.insertBefore(map, cur.nextSibling);
  else parent.appendChild(map);

  /** Real ES modules in the tree (not classic IIFE scripts). */
  var ESM_SPECS = [
    '@coffee/COFFEE-CASH/cash-core.js',
    '@coffee/COFFEE-CASH/cash-cli.js',
    '@coffee/COFFEE-CASH/cash-context.js',
    '@coffee/COFFEE-CASH/domains/cash-flow.js',
    '@coffee/COFFEE-CASH/domains/cash-io.js',
    '@coffee/COFFEE-CASH/domains/cash-io-control.js',
    '@coffee/COFFEE-CASH/domains/cash-io-drive.js',
    '@coffee/COFFEE-POSIX/coffee-posix.js',
    '@coffee/COFFEE-COMMUNITY/COMMUNITY-SPLASH/community-coffee-title.js'
  ];

  /** Top-level coffee-*.js per COFFEE-* package except ESM-only coffee-posix (base loaded first, not repeated). */
  var CLASSIC_REST = [
    'COFFEE-AI/coffee-ai-config.js',
    'COFFEE-AI/coffee-ai.js',
    'COFFEE-ANIMATE/coffee-animate.js',
    'COFFEE-ART/coffee-art.js',
    'COFFEE-BEE/coffee-bee.js',
    'COFFEE-BLOB/coffee-blob.js',
    'COFFEE-BRAND/coffee-os-ascii.js',
    'COFFEE-BRICK/coffee-brick.js',
    'COFFEE-CADENCE/coffee-cadence.js',
    'COFFEE-CHAT/coffee-chat.js',
    'COFFEE-CODE/coffee-code.js',
    'COFFEE-COIL/coffee-coil.js',
    'COFFEE-CONNECT/coffee-connect.js',
    'COFFEE-CONTEXT/coffee-context.js',
    'COFFEE-CRM/coffee-crm.js',
    'COFFEE-CUP/coffee-cup.js',
    'COFFEE-DOT/coffee-dot.js',
    /* COFFEE-DRAW depends on coffee.scene2d — must load after COFFEE-SCENE2D */
    'COFFEE-SCENE2D/coffee-scene2d.js',
    'COFFEE-DRAW/coffee-draw.js',
    'COFFEE-DRIVE/coffee-drive.js',
    'COFFEE-FILE/coffee-file.js',
    'COFFEE-FILTER/coffee-filter.js',
    'COFFEE-FORGE/coffee-forge.js',
    'COFFEE-FORMS/coffee-forms.js',
    'COFFEE-FRAME/coffee-frame.js',
    'COFFEE-FUZZ/coffee-fuzz.js',
    'COFFEE-GIT/coffee-git.js',
    'COFFEE-GPU/coffee-gpu.js',
    'COFFEE-GRAPH/coffee-graph.js',
    'COFFEE-INSPECTOR/coffee-inspector.js',
    'COFFEE-INSTALL/coffee-install.js',
    'COFFEE-LIST/coffee-list.js',
    'COFFEE-MARKDOWN/coffee-markdown.js',
    'COFFEE-MASTO/coffee-masto.js',
    'COFFEE-MODAL/coffee-modal.js',
    'COFFEE-MONACO/coffee-monaco.js',
    'COFFEE-NEBULA/coffee-nebula.js',
    'COFFEE-NOSTR/coffee-nostr.js',
    'COFFEE-OMNI/coffee-omni.js',
    'COFFEE-PATTERN/coffee-pattern.js',
    'COFFEE-PEER/coffee-peer.js',
    'COFFEE-PIX/coffee-pix.js',
    'COFFEE-PLAY/coffee-play.js',
    'COFFEE-PLEX/coffee-plex.js',
    'COFFEE-QUE/coffee-que.js',
    'COFFEE-REQUEST/coffee-request.js',
    'COFFEE-RUSTY/coffee-rusty.js',
    'COFFEE-SCENE3D/coffee-scene3d.js',
    'COFFEE-SCREEN/coffee-screen.js',
    'COFFEE-SHADE/coffee-shade.js',
    'COFFEE-SHADOW/coffee-shadow.js',
    'COFFEE-SHELL/coffee-shell.js',
    'COFFEE-SHOT/coffee-shot.js',
    'COFFEE-SKATER/coffee-skater.js',
    'COFFEE-SLASH/coffee-slash.js',
    'COFFEE-SNAKE/coffee-snake.js',
    'COFFEE-SVG/coffee-svg.js',
    'COFFEE-SYNTH/coffee-synth.js',
    'COFFEE-TABLE/coffee-table.js',
    'COFFEE-TASK/coffee-task.js',
    'COFFEE-TERMINAL/coffee-terminal-alpha.js',
    'COFFEE-TOAST/coffee-toast.js',
    'COFFEE-TRANSPORT/coffee-transport.js',
    'COFFEE-UI/coffee-ui.js',
    'COFFEE-UI/coffee-ui-flagship.js',
    'COFFEE-WIRE/coffee-wire.js',
    'COFFEE-YAY/coffee-yay.js'
  ];

  function appendScript(url, onload, onerror) {
    var s = document.createElement('script');
    s.src = url;
    s.async = false;
    s.onload = function () {
      if (onload) onload();
    };
    s.onerror = function () {
      if (onerror) onerror(new Error('Failed to load ' + url));
    };
    document.head.appendChild(s);
  }

  function series(paths, index, done) {
    if (index >= paths.length) {
      done(null);
      return;
    }
    appendScript(
      base + paths[index],
      function () {
        series(paths, index + 1, done);
      },
      function (err) {
        console.warn('[COFFEE-CDN load-all]', err.message);
        series(paths, index + 1, done);
      }
    );
  }

  w.COFFEE_LOAD_ALL_PROMISE = new Promise(function (resolve) {
    appendScript(
      base + 'COFFEE-BASE/coffee-base.js',
      function () {
        Promise.allSettled(ESM_SPECS.map(function (spec) { return import(spec); })).then(function (results) {
          results.forEach(function (r, i) {
            if (r.status === 'rejected') {
              console.warn('[COFFEE-CDN load-all] ESM', ESM_SPECS[i], r.reason);
            }
          });
          series(CLASSIC_REST, 0, function () {
            w.dispatchEvent(new CustomEvent('coffee:cdn:ready', { detail: { base: base } }));
            resolve({ base: base, esmResults: results });
          });
        });
      },
      function () {
        console.warn('[COFFEE-CDN load-all] coffee-base.js missing; continuing anyway');
        Promise.allSettled(ESM_SPECS.map(function (spec) { return import(spec); })).then(function (results) {
          series(CLASSIC_REST, 0, function () {
            w.dispatchEvent(new CustomEvent('coffee:cdn:ready', { detail: { base: base } }));
            resolve({ base: base, esmResults: results });
          });
        });
      }
    );
  });
})();
