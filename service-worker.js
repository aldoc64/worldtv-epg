const CACHE_NAME = 'worldtv-epg-cache-v1'; // Versione della cache per worldtv-epg
const BASE_PATH = '/worldtv-epg/'; // Definisci la base path del tuo repository worldtv-epg

const urlsToCache = [
  BASE_PATH, // La root del tuo repository
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest', // AGGIORNATO QUI
  BASE_PATH + 'service-worker.js',
  // Assicurati che queste icone esistano nella root del tuo repository worldtv-epg
  BASE_PATH + 'icon-192x192.png', 
  BASE_PATH + 'icon-512x512.png'
  // Rimuovi qui eventuali URL di CDN esterne che causano errori di caching
];


self.addEventListener('install', event => {
  console.log('Service Worker di WorldTV EPG: Evento Installazione');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker di WorldTV EPG: Cache aperta, aggiungo URL');
        return Promise.allSettled(
          urlsToCache.map(url => {
            console.log(`Attempting to cache: ${url}`);
            return cache.add(url);
          })
        ).then(results => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Service Worker di WorldTV EPG: Fallimento caching per ${urlsToCache[index]}:`, result.reason);
            } else {
              console.log(`Service Worker di WorldTV EPG: Caching riuscito per ${urlsToCache[index]}`);
            }
          });
          const failed = results.some(result => result.status === 'rejected');
          if (failed) {
            return Promise.reject(new Error('Alcuni URL non sono stati cachati. Controlla gli errori sopra.'));
          }
        });
      })
      .catch(error => {
        console.error('Service Worker di WorldTV EPG: Errore grave durante l\'installazione:', error);
        throw error;
      })
  );
});

//self.addEventListener('fetch', event => {
//  //// Aggiunta ----
//  if (event.request.url.endsWith('manifest.webmanifest')) {
//  return; // “bypass” completo
//  }
//  //// Fine aggiunta ----

//  // Aggiunta 16:34 31/07/2025
//  //
//  //if (event.request.url.includes('app.webmanifest')) {
//  //console.log('[Service Worker] Bypass del manifest');
//  //event.respondWith(fetch(event.request));
//  //return;
//  //}
//  //
//  // Fine Aggiunta 16:34 31/07/2025
  
//  event.respondWith(
//    caches.match(event.request)
//      .then(response => response || fetch(event.request))
//  );
//});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker di WorldTV EPG: Evento Attivazione');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker di WorldTV EPG: Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
