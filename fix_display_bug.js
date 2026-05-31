const fs = require('fs');

// Fix style.css
let css = fs.readFileSync('style.css', 'utf8');

// Remove the !important from #register display that broke the tabs
css = css.replace(/#register \{\s*display: block !important;/g, '#register {\n    /* display: block !important; REMOVED to allow JS to hide it */');

fs.writeFileSync('style.css', css);

// Bump SW cache again to apply immediately
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.1';");
sw = sw.replace(/style\.css\?v=[^']+/, "style.css?v=" + Date.now());
fs.writeFileSync('sw.js', sw);

// Bump index html cache string
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/style\.css(\?v=[0-9]+)?/, 'style.css?v=' + Date.now());
fs.writeFileSync('index.html', html);

console.log("Removed !important from display and bumped cache.");
