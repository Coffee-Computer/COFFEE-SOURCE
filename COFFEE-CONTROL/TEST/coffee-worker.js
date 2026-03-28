/**
 * Coffee Worker — Progressive caching for Coffee Control
 * Register via: coffee.serviceWorker.register('./coffee-worker.js')
 *
 * Strategy:
 * - Network-first for HTML, JS, JSON, CSS (fresh content, cache fallback when offline)
 * - Cache-first for other assets (images, fonts, etc.)
 * - Same-origin only
 */

const VERSION = '1.0.0';
const CACHE_NAME = `coffee-worker-${VERSION}`;

const NETWORK_FIRST_EXTS = ['html', 'htm', 'js', 'json', 'css'];

function isNetworkFirst(url) {
  const path = url.pathname || '';
  const ext = (path.split('.').pop() || '').toLowerCase();
  return NETWORK_FIRST_EXTS.includes(ext) || path.endsWith('/');
}

function offlineResponse() {
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => cached || offlineResponse())
    );
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => offlineResponse());
  });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith('coffee-worker-') && n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirst(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
