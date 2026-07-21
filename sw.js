// Al Quran App — Service Worker
// Bumping the CACHE version will invalidate old caches on next visit.
const CACHE = "alquran-v11";

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
// - Everything else (app shell, fonts): cache-first, fall back to network.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isApi = url.hostname.includes("alquran.cloud");

  if (isApi) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache successful same-origin and font responses for offline use.
          if (res && res.status === 200 && (url.origin === location.origin || url.hostname.includes("gstatic") || url.hostname.includes("googleapis"))) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Offline fallback: serve cached reader page when network fails.
          if (req.mode === 'navigate' || req.destination === 'document') {
            return caches.match('./reader.html')
              .then((r) => r || caches.match('./index.html'))
              .then((r) => r || caches.match('./'))
              .then((r) => r || new Response('<h1>Offline</h1><p>Please check your connection and try again.</p>', {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              }));
          }
        });
    })
  );
});
