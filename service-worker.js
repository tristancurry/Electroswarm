let CACHE_NAME = 'electroswarm-cache-test02t';
let urlsToCache = [
	'index.html',
	'manifest.json',
	'css/styles.css',
	'scripts/swHandling.js',
	'scripts/main.js',
	'scripts/interface.js',
	'scripts/physics.js',
	'images/r_000.svg',
	'images/a_001.svg',
	'images/a_002.svg',
	'images/a_005.svg',
	'images/a_010.svg',
	'images/a_020.svg',
	'images/a_050.svg',
	'images/a_100.svg',
	'images/r_001.svg',
	'images/r_002.svg',
	'images/r_005.svg',
	'images/r_010.svg',
	'images/r_020.svg',
	'images/r_050.svg',
	'images/r_100.svg',
	'images/c_000.svg',
	'images/c_002.svg',
	'images/c_005.svg',
	'images/c_010.svg',
	'images/c_050.svg',
	'images/c_100.svg',
	'images/c_01k.svg',
	'images/c_10k.svg'
	
	
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames){
			return Promise.all(
				cacheNames.filter(function(cacheName){
					return cacheName.startsWith('electroswarm-') && cacheName != CACHE_NAME;
				}).map(function(cacheName){
					return caches.delete(cacheName);
				})
			)
		})
	);

	
});

self.addEventListener('message', function(event){
	if(event.data.action == 'skipWaiting'){
		self.skipWaiting();
	}
});

