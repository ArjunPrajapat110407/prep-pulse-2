const CACHE_NAME = 'preppulse-v7';
const URLS_TO_CACHE = [
  './',
  './index.html'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var network = fetch(e.request).then(function(resp) {
          if (resp && resp.status === 200 && e.request.url.startsWith(self.location.origin)) {
            cache.put(e.request, resp.clone());
          }
          return resp;
        }).catch(function() { return cached; });
        return cached || network;
      });
    })
  );
});

self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : { title: 'Prep Pulse', body: 'Study time! ⚡' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'preppulse2026',
      renotify: true,
      requireInteraction: false
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(self.location.origin + self.location.pathname.replace('sw.js', '')));
});
