/**
 * Coffee Community Edition — mini PWA service worker (COFFEE-SOURCE scope).
 *
 * Strategy (CAFE-aligned, dev-friendly):
 * - HTML, CSS, JS, MJS, JSON: **network-first**, update cache on success; cache = offline fallback.
 * - Other same-origin assets under scope: **network-first** + cache fallback (live over stale).
 * - `/api/*`: **network only** (never cache) — vault, ping, Keyman, etc.
 * - Non-GET, other origins: do not intercept.
 *
 * Bump VERSION after logic changes to drop old caches.
 */
const VERSION = '1.0.0';
const CACHE_LIVE = `coffee-ce-live-${VERSION}`;
const CACHE_SHELL = `coffee-ce-shell-${VERSION}`;

/** Directory path of this script, e.g. /COFFEE-SOURCE/ */
const CE_BASE = new URL('.', self.location.href).pathname;

function ceUrl(relativePath) {
  return new URL(relativePath.replace(/^\.\//, ''), self.location.href).href;
}

const SHELL_PRECACHE = [
  'coffee-ce-pwa-manifest.json',
  'COFFEE-COMMUNITY/COMMUNITY-SPLASH/COMMUNITY-SPLASH-SCREEN.html',
  'COFFEE-COMMUNITY/COMMUNITY-SPLASH/community-coffee-title.css',
  'COFFEE-COMMUNITY/COMMUNITY-SPLASH/community-coffee-title.js'
].map((p) => ceUrl(p));

console.log('[coffee-ce-sw]', VERSION, 'base', CE_BASE);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) =>
        Promise.allSettled(
          SHELL_PRECACHE.map((url) =>
            fetch(url)
              .then((res) => {
                if (res.ok) return cache.put(url, res);
              })
              .catch((e) => console.warn('[coffee-ce-sw] precache skip', url, e.message))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => {
            if (name.startsWith('coffee-ce-') && name !== CACHE_LIVE && name !== CACHE_SHELL) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function offlineResponse() {
  return new Response('Offline — Community Edition content not cached for this URL.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/**
 * Network-first: try live; on success refresh cache; on failure use cache.
 */
function networkFirstLive(request, cacheName) {
  return fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        const clone = networkResponse.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return networkResponse;
    })
    .catch(() => {
      return caches.match(request).then((cached) => cached || offlineResponse());
    });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // APIs must always hit the network (Coffee Server, etc.) — never cache-first.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Only handle requests for CE tree (navigations from elsewhere may still target CE URLs).
  if (!url.pathname.startsWith(CE_BASE)) {
    return;
  }

  // All CE static assets: network-first (live over cache); same cache bucket.
  event.respondWith(networkFirstLive(event.request, CACHE_LIVE));
});
