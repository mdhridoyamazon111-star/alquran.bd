// Al Quran App — Service Worker
// Bumping the CACHE version will invalidate old caches on next visit.
const CACHE = "alquran-v49";

// App shell files that make the app work offline (the UI itself).
// Only list assets that exist in the repo. Icons are not pre-cached here
// because missing files would break offline caching of the HTML shell.
const APP_SHELL = [
  "./",
  "./index.html",
  "./reader.html",
  "./manifest.webmanifest"
];

// Install: pre-cache each app shell file individually so a single 404
// (e.g., a missing icon) does not abort the whole cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Quran API calls (alquran.cloud): network-first, fall back to cache when offline.
// - Page navigations (reader.html, root, etc.): network-first, then cache, then offline page.
// - Everything else (app shell, fonts): cache-first, fall back to network.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isApi = url.hostname.includes("alquran.cloud");
  const isPage = req.mode === 'navigate' || req.destination === 'document';

  // Quran API: cache-first so switching surahs is instant after first load.
  if (isApi) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Page navigations: always try network first so we never serve a stale/broken HTML.
  if (isPage) {
    event.respondWith(
      fetch(req, { cache: 'reload' })
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          return caches.match(req)
            .then((r) => r || caches.match('./reader.html'))
            .then((r) => r || caches.match('./index.html'))
            .then((r) => r || caches.match('./'))
            .then((r) => r || new Response('<h1>Offline</h1><p>Please check your connection and try again.</p>', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }));
        })
    );
    return;
  }

  // Other assets: cache-first, then network.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (url.origin === location.origin || url.hostname.includes("gstatic") || url.hostname.includes("googleapis"))) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        });
    })
  );
});
