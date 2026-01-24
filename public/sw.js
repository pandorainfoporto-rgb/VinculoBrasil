/**
 * Service Worker - Vinculo PWA
 * Gerencia cache e funcionamento offline
 */

const CACHE_NAME = 'vinculo-v1';
const STATIC_CACHE = 'vinculo-static-v1';
const DYNAMIC_CACHE = 'vinculo-dynamic-v1';

// Recursos estaticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Instalacao do service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos estaticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao cachear:', error);
      })
  );
});

// Ativacao do service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Estrategia de fetch: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisicoes nao-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisicoes de extensoes do Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Ignorar requisicoes para APIs externas (exceto ViaCEP)
  if (url.origin !== location.origin && !url.hostname.includes('viacep')) {
    return;
  }

  // Estrategia para assets estaticos (JS, CSS, imagens)
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia para paginas HTML e API
  event.respondWith(networkFirst(request));
});

// Cache First: Primeiro busca no cache, depois na rede
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Atualiza o cache em background
    fetchAndCache(request);
    return cachedResponse;
  }

  return fetchAndCache(request);
}

// Network First: Primeiro busca na rede, depois no cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache apenas respostas validas
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Rede falhou, buscando no cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Pagina offline fallback
    if (request.destination === 'document') {
      return caches.match('/');
    }

    throw error;
  }
}

// Buscar e cachear
async function fetchAndCache(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Erro ao buscar:', request.url, error);
    throw error;
  }
}

// Evento de mensagem para comunicacao com a pagina
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Push notifications (para uso futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || 'Nova notificacao do Vinculo',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Vinculo', options)
  );
});

// Clique em notificacao
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Procura uma janela ja aberta
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Abre nova janela
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service Worker carregado');
