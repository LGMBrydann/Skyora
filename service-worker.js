const CACHE_NAME = "skyora-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./skyora-icon.png",
  "./skyora-noti.mp3"
];

/* =========================
   INSTALL
========================= */

self.addEventListener(
  "install",
  function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(
        function (cache) {
          return cache.addAll(APP_FILES);
        }
      )
    );

    self.skipWaiting();
  }
);

/* =========================
   ACTIVATE
========================= */

self.addEventListener(
  "activate",
  function (event) {
    event.waitUntil(
      caches.keys().then(
        function (cacheNames) {
          return Promise.all(
            cacheNames
              .filter(function (name) {
                return name !== CACHE_NAME;
              })
              .map(function (name) {
                return caches.delete(name);
              })
          );
        }
      )
    );

    self.clients.claim();
  }
);

/* =========================
   FETCH
========================= */

self.addEventListener(
  "fetch",
  function (event) {
    const request = event.request;

    if (request.method !== "GET") {
      return;
    }

    event.respondWith(
      fetch(request)
        .then(function (response) {
          const clone = response.clone();

          caches.open(CACHE_NAME).then(
            function (cache) {
              cache.put(request, clone);
            }
          );

          return response;
        })
        .catch(function () {
          return caches.match(request);
        })
    );
  }
);
