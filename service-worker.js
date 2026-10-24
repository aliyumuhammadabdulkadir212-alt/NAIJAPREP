const CACHE_NAME = 'naija-scholar-v4';
const APP_FILES = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest', './data/jamb.json', './data/faculties.json', './data/units.json', './data/library.json',
  './data/jamb/english.json', './data/jamb/mathematics.json', './data/jamb/biology.json', './data/jamb/chemistry.json', './data/jamb/physics.json',
  './data/jamb/government.json', './data/jamb/economics.json', './data/jamb/literature-in-english.json', './data/jamb/crk.json', './data/jamb/irk.json',
  './data/jamb/geography.json', './data/jamb/commerce.json', './data/jamb/accounting.json', './data/jamb/agricultural-science.json', './data/jamb/further-mathematics.json',
  './data/questions/CSC_101.json', './data/questions/CSC_201.json', './data/questions/ACC_101.json', './data/questions/ACC_201.json', './data/questions/GST_101.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('./index.html'))));
});
