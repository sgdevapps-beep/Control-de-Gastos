// Service worker: permite que la app funcione sin internet.
// Si cambias algún archivo, sube el número de versión para que los móviles se actualicen.
const VERSION = 'gastos-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero intenta internet (así ves siempre la última versión); si no hay, usa lo guardado.
self.addEventListener('fetch', e => {
  const peticion = e.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== location.origin) return;
  e.respondWith(
    fetch(peticion)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(peticion, copia));
        return r;
      })
      .catch(() => caches.match(peticion).then(r => r || caches.match('index.html')))
  );
});
