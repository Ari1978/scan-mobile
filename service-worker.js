// ============================================================
//   SERVICE WORKER PRO — ARIEL SCAN (VERSIÓN FINAL)
//   Cache estático + actualización + fallback seguro
// ============================================================

// Cambia este número cada vez que actualices tu app
const CACHE_VERSION = "v6";
const CACHE_NAME = `ariel-scan-${CACHE_VERSION}`;

// Archivos principales
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/pdf.js",
  "/share.js",
  "/filtros.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ============================================================
//   INSTALL — PRE-CACHE
// ============================================================
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando…");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cacheando archivos…");
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => {
        console.error("[SW] Error cacheando:", err);
      })
  );

  self.skipWaiting();
});

// ============================================================
//   ACTIVATE — LIMPIAR CACHE VIEJO
// ============================================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado. Limpiando caches viejos…");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Borrando cache viejo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ============================================================
//   FETCH — CACHE FIRST + NETWORK FALLBACK
// ============================================================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignorar extensiones o requests internos
  if (req.url.includes("chrome-extension")) return;

  event.respondWith(
    caches.match(req).then((cachedRes) => {
      // Si existe en caché → devolverlo
      if (cachedRes) return cachedRes;

      // Si no → buscar en red
      return fetch(req)
        .then((networkRes) => {
          // Guardamos en caché la nueva respuesta si es válida
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkRes.clone());
            });
          }
          return networkRes;
        })
        .catch(() => {
          // Fallback opcional cuando no hay internet
          // return caches.match("/offline.html");
        });
    })
  );
});

// ============================================================
//   MENSAJE PARA FORZAR ACTUALIZACIÓN
// ============================================================
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
