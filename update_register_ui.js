const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let appjs = fs.readFileSync('app.js', 'utf8');

// 1. In index.html, we need to add a wrapper for the tabs in the header, or just use the form-tabs where the pos-order-wrapper is.
// Actually, it's easier to put the tabs inside the header when the user is on the 'register' view.
// Or, we can just style the tabs at the top of the `#register` section.
// Let's look at what is inside `<div class="header-controls">`
// Let's add a `register-order-wrapper` next to `pos-order-wrapper`
const registerWrapper = `
                        <div class="pos-order-wrapper" id="register-type-wrapper" style="display: none;">
                            <div class="pos-order-bar" id="register-type-bar">
                                <button class="order-pill active" id="btn-tab-purchase">Compras Insumos</button>
                                <button class="order-pill" id="btn-tab-expense">Gastos de Operación</button>
                            </div>
                        </div>`;
                        
if (!html.includes('register-type-wrapper')) {
    html = html.replace('</div>\n                </div>\n            </header>', registerWrapper + '\n                    </div>\n                </div>\n            </header>');
}

// 2. Remove the old form-tabs from the `#register` view and add overflow scroll properly.
const oldTabsRegex = /<div class="form-tabs"[\s\S]*?<\/div>/;
html = html.replace(oldTabsRegex, '');

// Also make sure the pos-container allows scrolling on the left panel.
// In the left panel: `<div class="pos-cart pos-cart-box" style="flex: 1.5; padding: 20px; overflow-y: auto;">`
// I already set `overflow-y: auto`, but maybe the parent `#register` needs to be `display: flex; flex-direction: column; height: 100%`?
// Let's adjust the `#register` style in index.html to match POS exactly.
html = html.replace('<section class="dashboard-view" id="register" style="display: none;">', '<section class="dashboard-view" id="register" style="display: none; height: 100%; overflow: hidden;">');
html = html.replace('<div class="pos-container">', '<div class="pos-container" style="height: 100%; display: flex; gap: 20px;">');
html = html.replace('<div class="pos-cart pos-cart-box" style="flex: 1.5; padding: 20px; overflow-y: auto;">', '<div class="pos-cart pos-cart-box form-scrollable" style="flex: 1.5; padding: 20px; overflow-y: auto; display: flex; flex-direction: column;">');

// Ensure that we have Radio inputs still in the DOM but hidden, so `app.js` doesn't break, OR just change app.js
// Let's just add the hidden radios back to the register view so `app.js` logic for `radioCompra.checked` keeps working!
const hiddenRadios = `<div style="display:none;"><input type="radio" id="radio-compra-hidden" name="entry-type" value="purchase" checked><input type="radio" id="radio-gasto-hidden" name="entry-type" value="expense"></div>`;
html = html.replace('<form id="entry-form">', '<form id="entry-form">\n' + hiddenRadios);

fs.writeFileSync('index.html', html);


// 3. Update app.js to switch titles and handle the new tabs
// In app.js, find the title switching logic.
const tabMappingRegex = /const titleMap = \{[\s\S]*?\};/;
const newTabMapping = `const titleMap = {
        'dashboard': 'Resumen Financiero',
        'pos': 'Punto de Venta',
        'cocina': 'Órdenes Activas',
        'sales': 'Historial de Ventas',
        'expenses': 'Historial de Gastos',
        'inventory': 'Control de Inventario',
        'register': 'Registrar Compras'
    };`;
appjs = appjs.replace(tabMappingRegex, newTabMapping);

// Add logic to show/hide the `register-type-wrapper` header.
// Inside `navItems.forEach(...)` we have `document.getElementById('pos-order-wrapper').style.display = ...`
const posWrapperLogic = "document.getElementById('pos-order-wrapper').style.display = tabName === 'pos' ? 'flex' : 'none';";
const registerWrapperLogic = "document.getElementById('pos-order-wrapper').style.display = tabName === 'pos' ? 'flex' : 'none';\n            const regWrap = document.getElementById('register-type-wrapper');\n            if(regWrap) regWrap.style.display = tabName === 'register' ? 'flex' : 'none';\n            document.getElementById('period-filters').style.display = (tabName === 'pos' || tabName === 'cocina' || tabName === 'register') ? 'none' : 'flex';\n            document.querySelector('.date-controls').style.display = (tabName === 'pos' || tabName === 'cocina' || tabName === 'register') ? 'none' : 'flex';";

if (!appjs.includes("register-type-wrapper")) {
    appjs = appjs.replace(posWrapperLogic, registerWrapperLogic);
}

// Add event listeners for the new register tabs
const tabLogic = `
    const btnTabPurchase = document.getElementById('btn-tab-purchase');
    const btnTabExpense = document.getElementById('btn-tab-expense');
    const hiddenCompra = document.getElementById('radio-compra-hidden');
    const hiddenGasto = document.getElementById('radio-gasto-hidden');
    
    if (btnTabPurchase && btnTabExpense) {
        btnTabPurchase.addEventListener('click', () => {
            btnTabPurchase.classList.add('active');
            btnTabExpense.classList.remove('active');
            hiddenCompra.checked = true;
            hiddenGasto.checked = false;
            document.getElementById('main-title').textContent = 'Registrar Compras';
            toggleFormType();
        });
        btnTabExpense.addEventListener('click', () => {
            btnTabExpense.classList.add('active');
            btnTabPurchase.classList.remove('active');
            hiddenGasto.checked = true;
            hiddenCompra.checked = false;
            document.getElementById('main-title').textContent = 'Registrar Gastos';
            toggleFormType();
        });
    }
`;

if (!appjs.includes("btnTabPurchase")) {
    appjs = appjs.replace('// Global setup', tabLogic + '\n// Global setup');
}

fs.writeFileSync('app.js', appjs);
console.log("Updated index.html and app.js for new Register header and scroll.");
