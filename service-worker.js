self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("ariel-scan-v1").then((cache) => {
      return cache.addAll([
        "index.html",
        "styles.css",
        "app.js",
        "pdf.js",
        "share.js",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
