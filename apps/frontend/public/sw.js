// Service Worker for PWA
const CACHE_NAME = "sportbuddy-v5"; // Increased version to clear old cache
const urlsToCache = ["/manifest.json", "/icon-144x144.png"];

// Install service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version v5");
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching initial resources");
      return cache.addAll(urlsToCache);
    })
  );
});

// Network-first strategy for all requests (always fresh content)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for API calls
  if (url.pathname.startsWith("/api/")) {
    return event.respondWith(fetch(request));
  }

  // Network-first for everything - always try to get fresh content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only if network fails (offline mode)
        return caches.match(request);
      })
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version v5");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log("[SW] Deleting old caches:", cacheNames.filter(c => !cacheWhitelist.includes(c)));
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("[SW] Deleting cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log("[SW] Taking control of all clients");
      return clients.claim(); // Take control immediately
    })
  );
});

// Push Notifications
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-144x144.png",
      badge: "/icon-144x144.png",
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // Check if the app is currently focused
          const isAppFocused = windowClients.some((client) => client.focused);

          if (isAppFocused) {
            // App is open and focused, suppress system notification
            // The user will see the in-app notification instead
            console.log("App is focused, suppressing push notification");
            return;
          }

          return self.registration.showNotification(data.title, options);
        })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
