const CACHE_NAME = 'seed-cosmic-reboot-v11';
const ASSETS = [
  './',
  './index.html',
  './install.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './manifest-release.json',
  './manifest-demo.json',
  './icon-192.png',
  './icon-512.png'
];

let swReminderTimerId = null;

function buildSwNotificationOptions(data) {
  const rawOpts = data && data.options && typeof data.options === 'object' ? data.options : {};
  const body =
    (data && typeof data.body === 'string' && data.body.trim()) ||
    (typeof rawOpts.body === 'string' && rawOpts.body.trim()) ||
    'Tahan tombol Hold 3s to Commit Today selama 3 detik untuk mengunci komitmen harianmu (+25 XP).';
  const tag =
    (data && typeof data.tag === 'string' && data.tag.trim()) ||
    (typeof rawOpts.tag === 'string' && rawOpts.tag.trim()) ||
    'seed-daily-commit-reminder';
  const targetUrl =
    (data && typeof data.url === 'string' && data.url.trim()) ||
    (rawOpts.data && typeof rawOpts.data.url === 'string' && rawOpts.data.url.trim()) ||
    './index.html';

  return {
    ...rawOpts,
    body,
    icon: rawOpts.icon || './icon-192.png',
    badge: rawOpts.badge || './icon-192.png',
    tag,
    renotify: true,
    data: {
      ...(rawOpts.data && typeof rawOpts.data === 'object' ? rawOpts.data : {}),
      url: targetUrl
    }
  };
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
      // Force any open PWA windows on old cached versions to navigate/reload to fresh UI
      const windowClients = await self.clients.matchAll({ type: 'window' });
      for (const client of windowClients) {
        if (client && typeof client.navigate === 'function') {
          try {
            await client.navigate(client.url);
          } catch (e) {}
        }
      }
    })()
  );
});

// Handle Daily Commit Reminder notifications & background timer sync from client
self.addEventListener('message', (event) => {
  const data = event && event.data ? event.data : null;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SHOW_COMMIT_NOTIFICATION') {
    const title = data.title || 'SEED • Waktunya Commit Hari Ini!';
    const options = buildSwNotificationOptions(data);
    if (self.registration && typeof self.registration.showNotification === 'function') {
      const showPromise = self.registration.showNotification(title, options).catch(() => {});
      if (typeof event.waitUntil === 'function') {
        event.waitUntil(showPromise);
      }
    }
    return;
  }

  if (data.type === 'SYNC_DAILY_REMINDER') {
    if (swReminderTimerId) {
      clearTimeout(swReminderTimerId);
      swReminderTimerId = null;
    }
    if (data.enabled && !data.isCommittedToday && Number.isFinite(data.delayMs) && data.delayMs > 0 && data.delayMs <= 90000000) {
      const title = data.title || 'SEED • Waktunya Commit Hari Ini!';
      const options = buildSwNotificationOptions(data);
      swReminderTimerId = setTimeout(() => {
        swReminderTimerId = null;
        if (self.registration && typeof self.registration.showNotification === 'function') {
          self.registration.showNotification(title, options).catch(() => {});
        }
        if (self.clients && typeof self.clients.matchAll === 'function') {
          self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
              for (const client of windowClients) {
                if (client && typeof client.postMessage === 'function') {
                  try {
                    client.postMessage({
                      type: 'DAILY_REMINDER_FIRED',
                      reminderTime: data.reminderTime || null
                    });
                  } catch (e) {}
                }
              }
            })
            .catch(() => {});
        }
      }, data.delayMs);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  if (event && event.notification && typeof event.notification.close === 'function') {
    event.notification.close();
  }
  const clickPromise = (async () => {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if (client && 'focus' in client) {
        try {
          await client.focus();
          if (typeof client.postMessage === 'function') {
            client.postMessage({ type: 'COMMIT_NOTIFICATION_CLICKED' });
          }
          return;
        } catch (e) {}
      }
    }
    if (self.clients && typeof self.clients.openWindow === 'function') {
      await self.clients.openWindow('./index.html');
    }
  })();
  if (event && typeof event.waitUntil === 'function') {
    event.waitUntil(clickPromise);
  }
});

// Network-First strategy so installed PWA always receives live UI updates immediately, with offline cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkRes;
      })
      .catch(async () => {
        const directMatch = await caches.match(event.request);
        if (directMatch) return directMatch;

        try {
          const url = new URL(event.request.url);
          const cleanPath = url.pathname.replace(/\/+$/, '') || '/';
          if (cleanPath === '/install' || cleanPath === '/boost' || cleanPath === '/download' || cleanPath === '/install.html') {
            const installCached = await caches.match('./install.html', { ignoreSearch: true });
            if (installCached) return installCached;
          }
          if (cleanPath === '/' || cleanPath === '/index.html' || cleanPath === '/release' || cleanPath === '/rilis' || cleanPath === '/demo') {
            const indexCached = await caches.match('./index.html', { ignoreSearch: true });
            if (indexCached) return indexCached;
          }
        } catch (err) {
          // Ignore URL parse errors
        }

        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});


