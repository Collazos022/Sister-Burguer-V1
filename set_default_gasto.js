const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Swap active class on header pills
html = html.replace('<button class="order-pill active" id="btn-tab-purchase">', '<button class="order-pill" id="btn-tab-purchase">');
html = html.replace('<button class="order-pill" id="btn-tab-expense">', '<button class="order-pill active" id="btn-tab-expense">');

// Swap checked attribute on hidden radios
html = html.replace('<input type="radio" id="radio-compra-hidden" name="entry-type" value="purchase" checked>', '<input type="radio" id="radio-compra-hidden" name="entry-type" value="purchase">');
html = html.replace('<input type="radio" id="radio-gasto-hidden" name="entry-type" value="expense">', '<input type="radio" id="radio-gasto-hidden" name="entry-type" value="expense" checked>');

fs.writeFileSync('index.html', html);
console.log("Defaults swapped to Gastos");
