/**
 * Instant Placement - PWA Service Worker
 * Version: 1.0.0
 */

const STATIC_CACHE = "ip-static-v1";
const RUNTIME_CACHE = "ip-runtime-v1";
const IMAGES_CACHE = "ip-images-v1";

const PRECACHE_ASSETS = [
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
  "/favicon.ico",
  "/icon.png",
];

const MAX_IMAGE_ENTRIES = 60;
const MAX_IMAGE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── Install: Precache app shell & assets (DO NOT skipWaiting automatically) ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// ── Activate: Clean up old versions of caches ──
self.addEventListener("activate", (event) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE, IMAGES_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Message: Wait for explicit SKIP_WAITING message from PwaManager ──
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Helper: Trim image cache to max entries and age
async function trimImageCache() {
  try {
    const cache = await caches.open(IMAGES_CACHE);
    const keys = await cache.keys();
    if (keys.length > MAX_IMAGE_ENTRIES) {
      // Remove oldest entries over the limit
      const excess = keys.slice(0, keys.length - MAX_IMAGE_ENTRIES);
      await Promise.all(excess.map((req) => cache.delete(req)));
    }
  } catch (err) {
    // Ignore cache trimming errors in background
  }
}

// ── Fetch: Routing & Caching Strategies ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass all non-GET requests immediately
  if (request.method !== "GET") {
    return;
  }

  // 2. Bypass API calls and WebSocket/Socket.io traffic
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/") ||
    url.pathname.includes("/socket.io")
  ) {
    return;
  }

  // 3. Bypass any request carrying an Authorization header
  if (request.headers.get("authorization")) {
    return;
  }

  // 4. Authenticated / Dynamic routes: Network-Only with offline.html fallback
  const isAuthRoute =
    url.pathname.startsWith("/employer") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/candidate") ||
    url.pathname.startsWith("/dashboard");

  if (isAuthRoute) {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // 5. HTML Page Navigation: NetworkFirst with 3-second timeout -> offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), 3000)
          );
          const networkResponse = await Promise.race([
            fetch(request),
            timeoutPromise,
          ]);

          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        } catch (err) {
          // Network failed or timed out: try runtime cache, else fallback to offline.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match("/offline.html");
          return offlineFallback || Response.error();
        }
      })()
    );
    return;
  }

  // 6. Static Next.js Bundles, Fonts, Icons: CacheFirst
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 7. Images: StaleWhileRevalidate with entry limiting
  const isImage =
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i) ||
    url.hostname.includes("images.unsplash.com") ||
    url.hostname.includes("apna.co") ||
    url.hostname.includes("workindia.in");

  if (isImage) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(IMAGES_CACHE).then((cache) => {
                cache.put(request, copy);
                trimImageCache();
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with runtime cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
