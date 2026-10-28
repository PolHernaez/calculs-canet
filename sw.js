// Service worker — Càlculs Canet (web/PWA). Fitxers propis primer de la memòria (funciona sense connexió).
// El nom de la memòria porta la versió (el posa deploy_web.py): cada versió nova s'instal·la sola.
const CACHE = "canet-3.1-4433fcab";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./icon-maskable.png",
  "./favicon-32.png",
  "./vendor/firebase/12.19.0/firebase-app.js",
  "./vendor/firebase/12.19.0/firebase-auth.js",
  "./vendor/firebase/12.19.0/firebase-firestore.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  // Només els fitxers propis. Firebase (googleapis) va directe: si li tornéssim index.html en fallar, es confondria.
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const page = req.mode === "navigate";   // /i?c=CODI i qualsevol pàgina: és la mateixa app
  e.respondWith(
    caches.match(page ? "./index.html" : req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
