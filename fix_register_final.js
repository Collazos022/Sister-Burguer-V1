const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Rename the sidebar button
html = html.replace('<span class="nav-text">Registrar</span>', '<span class="nav-text">Registrar Gastos</span>');

// 2. Remove the "Registrar Compra / Gasto" h2 header
html = html.replace(/<h2>Registrar Compra \/ Gasto<\/h2>/g, '');

// 3. Fix scroll and padding in `#register`
// Find the <section ... id="register"> and restore it to standard dashboard view style without `height:100%; overflow:hidden;`
html = html.replace(/<section class="dashboard-view" id="register"[^>]*>/, '<section class="dashboard-view" id="register" style="display: none;">');
// Fix pos-container in register to have standard padding and scrolling layout
html = html.replace(/<div class="pos-container"[^>]*>/, '<div class="pos-container" style="display: flex; gap: 20px; flex-wrap: wrap; padding: 20px;">');
// Make sure pos-cart has reasonable padding and max-width if needed
html = html.replace(/<div class="pos-cart pos-cart-box form-scrollable"[^>]*>/, '<div class="pos-cart pos-cart-box form-scrollable" style="flex: 1 1 500px; padding: 20px;">');

fs.writeFileSync('index.html', html);


let appjs = fs.readFileSync('app.js', 'utf8');

// 4. Inject the event listeners for the header tabs. We'll just put them at the very end of app.js!
const tabLogic = `
// --- Injected Register Tabs Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const btnTabPurchase = document.getElementById('btn-tab-purchase');
    const btnTabExpense = document.getElementById('btn-tab-expense');
    const hiddenCompra = document.getElementById('radio-compra-hidden');
    const hiddenGasto = document.getElementById('radio-gasto-hidden');
    const mainTitle = document.getElementById('main-title');
    
    if (btnTabPurchase && btnTabExpense) {
        btnTabPurchase.addEventListener('click', (e) => {
            e.preventDefault();
            btnTabPurchase.classList.add('active');
            btnTabExpense.classList.remove('active');
            if(hiddenCompra) hiddenCompra.checked = true;
            if(hiddenGasto) hiddenGasto.checked = false;
            if(mainTitle) mainTitle.textContent = 'Registrar Compras';
            if (typeof toggleFormType === 'function') toggleFormType();
        });
        btnTabExpense.addEventListener('click', (e) => {
            e.preventDefault();
            btnTabExpense.classList.add('active');
            btnTabPurchase.classList.remove('active');
            if(hiddenGasto) hiddenGasto.checked = true;
            if(hiddenCompra) hiddenCompra.checked = false;
            if(mainTitle) mainTitle.textContent = 'Registrar Gastos';
            if (typeof toggleFormType === 'function') toggleFormType();
        });
    }
});
`;

if (!appjs.includes("btnTabPurchase")) {
    appjs += "\n" + tabLogic;
}

// 5. Change the default title when tab is opened
// Wait, my previous multi_replace replaced the title map. Let's make sure 'register' is 'Registrar Gastos'
appjs = appjs.replace(/'register': 'Registrar Compras'/, "'register': 'Registrar Gastos'");

fs.writeFileSync('app.js', appjs);

// 6. Update CSS to handle the layout better on mobile and desktop
let css = fs.readFileSync('style.css', 'utf8');
const newCSS = `
/* Overrides for Register full-page layout */
#register {
    padding: 20px;
    box-sizing: border-box;
}
#register .pos-container {
    padding: 0 !important;
}
`;
if (!css.includes('Overrides for Register full-page layout')) {
    css += newCSS;
    fs.writeFileSync('style.css', css);
}

console.log("Fixes applied.");
