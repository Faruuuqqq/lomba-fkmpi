const CACHE_NAME = 'mitra-ai-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/project',
  '/login',
  '/register'
];

const CACHE_VERSION = 'v1.0.0';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  
  // Pre-cache critical pages
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache.map(url => new Request(url))))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Check if the request is for a cacheable resource
  const shouldCache = urlsToCache.some((cacheUrl) => url.pathname.startsWith(cacheUrl));

  if (shouldCache) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => cache.match(request))
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              // Cache the new response
              if (fetchResponse.ok) {
                cache.put(request, fetchResponse.clone());
              }
              return fetchResponse;
            });
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered');
  
  event.waitUntil(
    self.registration.sync.getTags()
      .then((tags) => {
        return Promise.all(
          tags.map((tag) => self.registration.sync.register({
            tag: tag,
            data: { action: 'syncData', timestamp: Date.now() }
          }))
        );
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = event.data.json();
  
  if (options.type === 'notification') {
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: '/icons/icon-96x96.png',
      badge: '/icons/badge.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || []
    });
  }
});

// Cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    caches.open(CACHE_NAME).then((cache) => {
      return cache.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => cache.delete(key))
        );
      });
    });
  }
});