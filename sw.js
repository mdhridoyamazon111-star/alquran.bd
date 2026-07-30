// Al Quran App — Service Worker
// Bumping the CACHE version will invalidate old caches on next visit.
const CACHE = "alquran-v100";

// PERSISTENT data cache for downloaded Quran (API) responses.
// This name is NEVER version-bumped, so bumping CACHE (the app shell) will
// NOT wipe surahs the user already downloaded for offline use.
const DATA_CACHE = "alquran-data";

// App shell files that make the app work offline (the UI itself).
// Only list assets that exist in the repo. Icons are not pre-cached here
// because missing files would break offline caching of the HTML shell.
const APP_SHELL = [
  "./",                // Cloudflare Pages rewrites / to reader.html
  "./reader.html",     // cache the real HTML directly (redirect-free copy)
  "./manifest.webmanifest",
  "./images/Sura.jpg", // surah-name banner shown on every surah page
  "./images/banner.jpg"
];
const API_LIST = "https://api.alquran.cloud/v1/surah";

// Install: pre-cache each app shell file individually so a single 404
// (e.g., a missing icon) does not abort the whole cache. Also prime the
// surah list API so the home grid works offline immediately after install.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) =>
        Promise.allSettled([
          ...APP_SHELL.map((url) => cache.add(url)),
          // Prime the surah list into the persistent data cache.
          fetch(API_LIST)
            .then((res) => {
              if (res && res.status === 200) {
                const copy = res.clone();
                caches.open(DATA_CACHE).then((dc) => dc.put(API_LIST, copy));
              }
            })
            .catch(() => {})
        ])
      )
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old app-shell caches, but ALWAYS keep the persistent
// data cache so downloaded surahs survive every version bump.
self.addEventListener("activate", (event) => {
  const keep = [CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Return the cached app shell as a clean (non-redirected) HTML response.
// Tries several cache keys so it works regardless of how the page was cached.
async function serveOfflineShell() {
  const cache = await caches.open(CACHE);
  const candidates = ["./reader.html", "./", "/", "/reader.html"];
  for (const key of candidates) {
    const hit = await cache.match(key);
    if (hit) {
      // Rebuild the response so a redirected/opaque flag can't break navigation.
      const body = await hit.blob();
      return new Response(body, {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
  }
  return new Response(
    "<h1>অফলাইন</h1><p>একবার ইন্টারনেট সংযোগ দিয়ে অ্যাপটি খুলুন, তারপর অফলাইনে কাজ করবে।</p>",
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// Fetch strategy:
// - Quran API calls (alquran.cloud): cache-first, fall back to network.
// - Page navigations (reader.html, root, etc.): network-first, then cached shell.
// - Everything else (app shell, fonts): cache-first, fall back to network.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isApi = url.hostname.includes("alquran.cloud");
  const isPage = req.mode === 'navigate' || req.destination === 'document';

  // Quran API: cache-first so switching surahs is instant after first load.
  // Responses go into the PERSISTENT data cache (survives version bumps).
  // caches.match() searches every cache, so it also finds page-downloaded data.
  if (isApi) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Page navigations: network-first, then fall back to the cached app shell.
  // IMPORTANT: a *redirected* response cannot be returned to a navigation
  // request (the browser rejects it -> ERR_FAILED). So when serving from
  // cache offline we rebuild a clean, non-redirected Response.
  if (isPage) {
    event.respondWith(
      Promise.race([
        fetch(req, { cache: 'reload' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('network timeout')), 2500))
      ])
        .then((res) => {
          if (res && res.status === 200) {
            // Cache a clean copy keyed to the reusable shell URLs.
            const copy = res.clone();
            caches.open(CACHE).then((cache) => {
              cache.put("./reader.html", copy.clone());
              cache.put("./", copy);
            });
          }
          return res;
        })
        .catch(() => serveOfflineShell())
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
