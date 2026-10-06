const CACHE = "rugby-cut-v10"; // v10: burnt-calories log (additive fields only)
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./profiles.js",
  "./form-guides.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/exercises/modes.json",
  "./images/exercises/SOURCES.md",
  "./images/exercises/chest-press-sf.png",
  "./images/exercises/chest-press-thumb.png",
  "./images/exercises/crunch-sf.png",
  "./images/exercises/crunch-thumb.png",
  "./images/exercises/face-pulls-sf.png",
  "./images/exercises/face-pulls-thumb.png",
  "./images/exercises/farmer-carry-sf.png",
  "./images/exercises/farmer-carry-thumb.png",
  "./images/exercises/fin-bike-rower-sf.png",
  "./images/exercises/fin-bike-rower-thumb.png",
  "./images/exercises/fin-circuit-sf.png",
  "./images/exercises/fin-circuit-thumb.png",
  "./images/exercises/fin-incline-ski-sf.png",
  "./images/exercises/fin-incline-ski-thumb.png",
  "./images/exercises/hack-squat-sf.png",
  "./images/exercises/hack-squat-thumb.png",
  "./images/exercises/hip-thrust-sf.png",
  "./images/exercises/hip-thrust-thumb.png",
  "./images/exercises/knee-raise-sf.png",
  "./images/exercises/knee-raise-thumb.png",
  "./images/exercises/lat-pulldown-sf.png",
  "./images/exercises/lat-pulldown-thumb.png",
  "./images/exercises/leg-curl-sf.png",
  "./images/exercises/leg-curl-thumb.png",
  "./images/exercises/leg-extension-sf.png",
  "./images/exercises/leg-extension-thumb.png",
  "./images/exercises/leg-press-sf.png",
  "./images/exercises/leg-press-thumb.png",
  "./images/exercises/lunges-sf.png",
  "./images/exercises/lunges-thumb.png",
  "./images/exercises/pec-deck-sf.png",
  "./images/exercises/pec-deck-thumb.png",
  "./images/exercises/pull-through-rdl-sf.png",
  "./images/exercises/pull-through-rdl-thumb.png",
  "./images/exercises/pushdown-curl-sf.png",
  "./images/exercises/pushdown-curl-thumb.png",
  "./images/exercises/seated-row-sf.png",
  "./images/exercises/seated-row-thumb.png",
  "./images/exercises/shoulder-press-sf.png",
  "./images/exercises/shoulder-press-thumb.png",
  "./images/exercises/single-arm-row-sf.png",
  "./images/exercises/single-arm-row-thumb.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      // Ignore ?v= cache-bust when looking up precached shell assets
      try {
        const u = new URL(req.url);
        if (u.search) {
          return caches.match(u.pathname).then((c2) => {
            if (c2) return c2;
            return networkPut(req);
          });
        }
      } catch (_) {}
      return networkPut(req);
    })
  );
});

function networkPut(req) {
  return fetch(req).then((res) => {
    const copy = res.clone();
    if (res.ok && new URL(req.url).origin === self.location.origin) {
      caches.open(CACHE).then((cache) => cache.put(req, copy));
    }
    return res;
  }).catch(() => caches.match("./index.html"));
}

