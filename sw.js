// Network-first, so the App Hub always gets the newest viewer while online and the cached one offline.
// Cross-origin requests (the stream from the PC) and any URL with a query are left to the network: the
// stream must never be cached, and the Hub's "?v=" cache-bust must reach the network.
const CACHE = 'screen-share-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.search) return;
  e.respondWith(fetch(r).then(res => {
    const c = res.clone();
    caches.open(CACHE).then(x => x.put(r, c)).catch(() => {});
    return res;
  }).catch(() => caches.match(r)));
});
