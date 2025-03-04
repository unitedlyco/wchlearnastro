// Service worker for caching WordPress GraphQL responses
self.addEventListener('fetch', (event) => {
  // Only cache GraphQL requests
  if (event.request.url.includes('/graphql')) {
    event.respondWith(
      caches.open('wordpress-graphql-cache').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((newResponse) => {
            cache.put(event.request, newResponse.clone());
            return newResponse;
          });
        });
      })
    );
  }
}); 