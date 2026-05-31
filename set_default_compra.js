const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<button class="order-pill" id="btn-tab-purchase">Compra Insumo</button>', '<button class="order-pill active" id="btn-tab-purchase">Compra Insumo</button>');
html = html.replace('<button class="order-pill active" id="btn-tab-expense">Gasto Operativo</button>', '<button class="order-pill" id="btn-tab-expense">Gasto Operativo</button>');

// Make sure radio buttons match
html = html.replace('<input type="radio" id="radio-gasto-hidden" name="type" value="expense" checked>', '<input type="radio" id="radio-gasto-hidden" name="type" value="expense">');
html = html.replace('<input type="radio" id="radio-compra-hidden" name="type" value="purchase">', '<input type="radio" id="radio-compra-hidden" name="type" value="purchase" checked>');

fs.writeFileSync('index.html', html);

// 2. Update app.js
let appjs = fs.readFileSync('app.js', 'utf8');
const searchStr = `        btnTabExpense.addEventListener('click', (e) => {`;
const injectStr = `        // Force purchase as default on load
        setTimeout(() => btnTabPurchase.click(), 50);
        
        btnTabExpense.addEventListener('click', (e) => {`;

if(appjs.includes(searchStr) && !appjs.includes('setTimeout(() => btnTabPurchase.click(), 50);')) {
    appjs = appjs.replace(searchStr, injectStr);
    fs.writeFileSync('app.js', appjs);
}

console.log("Set default tab to Compra Insumo.");
