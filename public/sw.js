const CACHE_NAME = 'hafla-v3';
const STATIC_ASSETS = [
  '/',
  '/events',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.log('Cache install failed:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  return self.clients.claim();
});

// Fetch event - network-first for API/navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes and auth - always go to network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  // For navigation requests (HTML pages): network first, fallback to cache
  if (request.mode === 'navigate') {
    // Use pathname-only URL for cache key so query params don't create separate entries.
    // This ensures /events/[id]?transaction_code=X falls back to cached /events/[id]
    // instead of the homepage when the network fails (e.g. during payment widget redirects).
    const cacheUrl = url.origin + url.pathname;
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(cacheUrl, clone));
          return response;
        })
        .catch(() => caches.match(cacheUrl).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // For static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2?)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
