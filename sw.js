// キャッシュ内容を変えたら CACHE_NAME を必ず更新すること（バージョンを上げないと利用者に更新が届かない）
var CACHE_NAME = "yasai-techo-v44";
var FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./illust-empty-growing.png",
  "./illust-empty-search.png",
  "./illust-empty-yakuzen.png",
  "./illust-season-spring.png",
  "./illust-season-summer.png",
  "./illust-season-autumn.png",
  "./illust-season-winter.png",
  "./illust-season-spring-night.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var isFont = FONT_HOSTS.indexOf(new URL(event.request.url).host) !== -1;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request).then(function (response) {
        var ok = response && (
          (response.status === 200 && response.type === "basic") ||
          (isFont && (response.ok || response.type === "opaque"))
        );
        if (ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function () {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
      return cached || networkFetch;
    })
  );
});
