const CACHE_NAME = "btc-signal-v4";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // index.html всегда берем из сети,
  // чтобы старая версия приложения не кэшировалась
  if (
    url.origin === location.origin &&
    (
      event.request.mode === "navigate" ||
      url.pathname.endsWith("/index.html")
    )
  ) {
    event.respondWith(
      fetch(event.request, {
        cache: "no-store"
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Остальные файлы — сеть, при ошибке кэш
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
        }

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
