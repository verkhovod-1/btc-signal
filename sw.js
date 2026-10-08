const CACHE = "btc-signal-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./manifest.webmanifest",
        "./icon.svg"
      ])
    )
  );
});

self.addEventListener("fetch", event => {
  if (new URL(event.request.url).origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
  }
});
