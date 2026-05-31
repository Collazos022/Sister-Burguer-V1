const fs = require('fs');

// Fix index.html
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix flex basis that causes horizontal overflow
html = html.replace(/<div class="pos-cart pos-cart-box form-scrollable" style="flex: 1 1 500px; padding: 20px;">/g, '<div class="pos-cart pos-cart-box form-scrollable" style="flex: 1 1 100%; max-width: 100%; padding: 20px; box-sizing: border-box;">');

// 2. Remove any remaining <h2>Registrar Compra / Gasto</h2> just in case (the user explicitly said it's still there)
html = html.replace(/<h2[^>]*>Registrar Compra \/ Gasto<\/h2>/g, '');

fs.writeFileSync('index.html', html);

// Fix app.js
let appjs = fs.readFileSync('app.js', 'utf8');

// 3. Change display: flex to display: block for register view to fix scroll issues
appjs = appjs.replace(/v\.style\.display = \(tabId === 'register'\) \? 'flex' : 'block';/g, "v.style.display = 'block';");

fs.writeFileSync('app.js', appjs);

// Fix style.css
let css = fs.readFileSync('style.css', 'utf8');

const additionalCSS = `
/* Fix for horizontal scroll and layout on mobile register view */
#register {
    display: block !important;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto; /* Ensure it scrolls */
}
#register .pos-container {
    display: block !important; /* Stack vertically */
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
}
#register .form-scrollable {
    width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
    box-sizing: border-box;
}
`;

if (!css.includes('Fix for horizontal scroll and layout on mobile register view')) {
    css += additionalCSS;
    fs.writeFileSync('style.css', css);
}

console.log("Fixed horizontal overflow and layout for scrolling.");
