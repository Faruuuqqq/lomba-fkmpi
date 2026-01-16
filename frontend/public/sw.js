// Service Worker DISABLED for demo stability
// PWA features removed to prevent caching issues during presentations

self.addEventListener('install', (event) => {
  console.log('Service Worker: PWA disabled for demo');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Clearing all caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// No fetch interception - always get fresh content
self.addEventListener('fetch', (event) => {
  // Do nothing - let all requests go through normally
  return;
});