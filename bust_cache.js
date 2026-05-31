const fs = require('fs');

let sw = fs.readFileSync('sw.js', 'utf8');

// Bump cache version
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.0';");

// Bump file query strings
sw = sw.replace(/style\.css\?v=[^']+/, "style.css?v=" + Date.now());
sw = sw.replace(/app\.js\?v=[^']+/, "app.js?v=" + Date.now());

// IMPORTANT: Modify fetch strategy to Network First for HTML, CSS and JS so they never get stuck again during development!
const networkFirstStrategy = `
  // If it's a static asset, try network first during active development
  if (event.request.url.includes('.js') || event.request.url.includes('.css') || event.request.url.includes('.html') || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
`;

if (!sw.includes('network first during active development')) {
    sw = sw.replace(/event\.respondWith\(/, networkFirstStrategy + '\n  event.respondWith(');
}

fs.writeFileSync('sw.js', sw);

// Also add a cache-buster query string to index.html links to be absolutely sure
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/app\.js(\?v=[0-9]+)?/, 'app.js?v=' + Date.now());
html = html.replace(/style\.css(\?v=[0-9]+)?/, 'style.css?v=' + Date.now());
fs.writeFileSync('index.html', html);

console.log("Service Worker Cache busted and Network-First strategy applied.");
