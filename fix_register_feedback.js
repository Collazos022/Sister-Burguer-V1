const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
// Force remove any leftover h2 just in case
html = html.replace(/<h2[^>]*>Registrar Compra \/ Gasto<\/h2>/g, '');
fs.writeFileSync('index.html', html);

let appjs = fs.readFileSync('app.js', 'utf8');
// Fix title to always be "Registro de Gastos" when on register tab, and never change to "Registrar Compras"
appjs = appjs.replace(/'register': 'Registrar Gastos'/, "'register': 'Registro de Gastos'");
appjs = appjs.replace(/if\(mainTitle\) mainTitle.textContent = 'Registrar Compras';/g, "");
appjs = appjs.replace(/if\(mainTitle\) mainTitle.textContent = 'Registrar Gastos';/g, "");
fs.writeFileSync('app.js', appjs);

let css = fs.readFileSync('style.css', 'utf8');
// Ensure register header tabs scroll horizontally on small screens, and set active color to yellow per user request
const newCSS2 = `
/* Register Header optimizations */
#register-type-wrapper {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Hide scrollbar for cleaner look */
}
#register-type-wrapper::-webkit-scrollbar {
    display: none;
}
#register-type-bar .order-pill.active {
    background: #FFD700 !important; /* Yellow */
    color: #000 !important;
    border-color: #FFD700 !important;
}
`;
if (!css.includes('#register-type-wrapper {')) {
    css += newCSS2;
    fs.writeFileSync('style.css', css);
}

console.log("Applied title fixes and yellow active state for pills.");
