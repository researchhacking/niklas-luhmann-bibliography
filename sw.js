self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/niklas-luhmann-bibliography/',
        '/niklas-luhmann-bibliography/index.html',
        '/niklas-luhmann-bibliography/scripts/app.js',
        '/niklas-luhmann-bibliography/scripts/form.js',
        '/niklas-luhmann-bibliography/css/styles.css',
        '/niklas-luhmann-bibliography/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open('v1').then(cache => {
      return cache.match(e.request).then(res => {
        return res || fetch(e.request).then(res => {
          cache.put(e.request, res.clone());
          return res;
        });
      });
    })
  );
});