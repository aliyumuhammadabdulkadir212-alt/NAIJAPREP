/* ============================================================
   Naija Scholar — service-worker.js
   Offline-first PWA service worker.

   Strategy summary:
   • Static assets  → Cache-first (fast loads, offline support)
   • data/*.json    → Network-first  (fresh content when online)
   • Navigation     → Cache-first with offline fallback to index.html
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   Cache configuration
   Bump CACHE_NAME version when deploying breaking asset changes.
   ------------------------------------------------------------ */
const CACHE_NAME = 'naija-scholar-v1';

/** Files to pre-cache on service worker install */
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './service-worker.js',
  './manifest.json',
  /* Common data files — add more as needed */
  './data/subjects.json',
  './data/topics.json',
  './data/questions.json',
  './data/library.json',
];

/** URL patterns that should use Network-first strategy */
const NETWORK_FIRST_PATTERNS = [
  /\/data\/.*\.json$/,   /* All files under /data/ */
];

/* ============================================================
   INSTALL — pre-cache all static assets
   ============================================================ */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Naija Scholar service worker…');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching core assets');
        /*
         * addAll() is atomic — if any URL fails, the whole
         * install fails. Use individual add() calls if some
         * assets are optional.
         */
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Pre-cache complete');
        /*
         * skipWaiting() activates this SW immediately rather
         * than waiting for existing tabs to close.
         */
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Pre-cache failed:', err);
      })
  );
});

/* ============================================================
   ACTIVATE — clean up old caches, claim all clients
   ============================================================ */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating…');

  event.waitUntil(
    Promise.all([
      /* Remove any caches that are NOT the current CACHE_NAME */
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((oldCache) => {
              console.log('[SW] Deleting old cache:', oldCache);
              return caches.delete(oldCache);
            })
        );
      }),

      /*
       * clients.claim() makes this SW the active worker for
       * all open tabs immediately, without a page reload.
       */
      self.clients.claim(),
    ])
  );
});

/* ============================================================
   FETCH — intercept all network requests
   ============================================================ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Only handle same-origin requests */
  if (url.origin !== self.location.origin) return;

  /* --- Navigation requests (HTML pages) --- */
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  /* --- Network-first: data/*.json files --- */
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  /* --- Cache-first: all other assets (CSS, JS, images, etc.) --- */
  event.respondWith(cacheFirst(request));
});

/* ============================================================
   STRATEGY: Cache-first
   Serve from cache; fall back to network and update cache.
   ============================================================ */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    /* Optionally refresh cache in the background (stale-while-revalidate) */
    refreshCache(cache, request);
    return cached;
  }

  /* Not in cache — fetch from network and store */
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Cache-first fetch failed for:', request.url, err);
    /* Return a generic offline response for non-navigation requests */
    return new Response('Offline — resource unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/* ============================================================
   STRATEGY: Network-first
   Try network; fall back to cache when offline.
   Used for data/*.json to ensure fresh question data.
   ============================================================ */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      /* Update cache with fresh data */
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network-first offline, serving cache for:', request.url);
    const cached = await cache.match(request);
    if (cached) return cached;

    /* No cache either — return empty JSON so the app can handle gracefully */
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/* ============================================================
   STRATEGY: Navigation (HTML) request handler
   Cache-first, with offline fallback to index.html.
   ============================================================ */
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    /* Try network first for navigations so users get fresh HTML */
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    /* Offline — serve cached page or fallback to index.html */
    const cached =
      (await cache.match(request)) ||
      (await cache.match('./index.html')) ||
      (await cache.match('/'));

    if (cached) return cached;

    /* Last resort offline page */
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Naija Scholar — Offline</title>
<style>
  body { font-family: system-ui, sans-serif; text-align: center; padding: 48px 16px;
         background: #f7f5ef; color: #1d2a24; }
  h1   { color: #1f6b4a; }
  p    { max-width: 360px; margin: 16px auto; line-height: 1.6; }
</style>
</head>
<body>
  <h1>📚 You're offline</h1>
  <p>It looks like you're not connected to the internet.
     Open the app once while online and your study materials
     will be available offline automatically.</p>
</body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/* ============================================================
   HELPER: Background cache refresh (stale-while-revalidate)
   Silently updates cached asset without blocking the response.
   ============================================================ */
function refreshCache(cache, request) {
  fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response);
    })
    .catch(() => {
      /* Silently ignore background refresh failures */
    });
}

/* ============================================================
   MESSAGE HANDLER
   Allows the app to send commands to the service worker,
   e.g. { type: 'SKIP_WAITING' } or { type: 'CLEAR_CACHE' }.
   ============================================================ */
self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        console.log('[SW] Cache cleared on request');
      });
      break;

    default:
      console.log('[SW] Unknown message type:', event.data.type);
  }
});
