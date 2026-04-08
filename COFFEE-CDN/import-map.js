/**
 * Coffee Source — single-file browser import map.
 *
 * Put this in <head> BEFORE any <script type="module">:
 *
 *   <script src="import-map.js" data-coffee-cdn="https://cdn.jsdelivr.net/gh/OWNER/REPO@BRANCH/"></script>
 *   <script type="module">
 *     import { initCash } from '@coffee/COFFEE-CASH/cash-core.js';
 *   </script>
 *
 * Or assign the root (must end with /) before the tag:
 *   <script>window.COFFEE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/OWNER/REPO@main/';</script>
 *   <script src="import-map.js"></script>
 *
 * Default: jsDelivr against Coffee-Computer/COFFEE-SOURCE @ main. Change the fallback below if you fork.
 *
 * To load the whole in-repo browser stack with ONE tag (import map + base + ESM + classic coffee-*.js roots), use **load-all.js** instead.
 */
(function () {
  var cur = document.currentScript;
  var w = typeof window !== 'undefined' ? window : {};
  var base =
    (cur && cur.getAttribute('data-coffee-cdn')) ||
    w.COFFEE_CDN_BASE ||
    'https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/';

  base = String(base).trim();
  if (base.slice(-1) !== '/') {
    base += '/';
  }

  var el = document.createElement('script');
  el.type = 'importmap';
  el.textContent = JSON.stringify({
    imports: {
      '@coffee/': base
    }
  });

  var parent = (cur && cur.parentNode) || document.head;
  if (cur && cur.nextSibling) {
    parent.insertBefore(el, cur.nextSibling);
  } else {
    parent.appendChild(el);
  }
})();
