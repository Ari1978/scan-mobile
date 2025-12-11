self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("ariel-scan-v1").then((cache) => {
      return cache.addAll([
        "/",                   // raíz del sitio
        "/index.html",
        "/styles.css",
        "/app.js",
        "/pdf.js",
        "/share.js",
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
