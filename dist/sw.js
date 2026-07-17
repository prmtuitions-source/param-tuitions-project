const CACHE_NAME = 'param-admin-shell-v2';
const APP_SHELL_FILES = ['/', '/index.html', '/manifest.json', '/favicon.ico', '/logo.webp'];

function isLocalDevelopmentHost() {
  const hostname = String(globalThis.location?.hostname || '').toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

self.addEventListener('install', (event) => {
  if (isLocalDevelopmentHost()) {
    globalThis.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_FILES)).catch(() => null)
  );
  globalThis.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (isLocalDevelopmentHost()) {
    event.waitUntil(
      caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))).then(() => globalThis.registration.unregister()).then(() => globalThis.clients.claim())
    );
    return;
  }

  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))
    )).then(() => globalThis.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (isLocalDevelopmentHost()) {
    return;
  }

  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate';
  if (!isSameOrigin || !isNavigationRequest) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse?.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone)).catch(() => null);
        }

        return networkResponse;
      })
      .catch(() => caches.match('/index.html').then((cachedResponse) => cachedResponse || new Response('', { status: 504, statusText: 'Offline' })))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'New Activity', body: 'You have a new update.', url: '/' };

  try {
    if (event.data) data = event.data.json();
  } catch (error) {
    return;
  }

  event.waitUntil(
    globalThis.registration.showNotification(data.title || 'New Activity', {
      body: data.body || 'You have a new update.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if ('focus' in win) {
          return win.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return null;
    })
  );
});