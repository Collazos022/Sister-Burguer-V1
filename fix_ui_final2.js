const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Change Tab Titles
html = html.replace('<button class="order-pill" id="btn-tab-purchase">Compras Insumos</button>', '<button class="order-pill" id="btn-tab-purchase">Compra Insumo</button>');
html = html.replace('<button class="order-pill active" id="btn-tab-expense">Gastos de Operación</button>', '<button class="order-pill active" id="btn-tab-expense">Gasto Operativo</button>');

// Also check if they are the other way around in current HTML
html = html.replace('Compras Insumos', 'Compra Insumo');
html = html.replace('Gastos de Operación', 'Gasto Operativo');

fs.writeFileSync('index.html', html);


// --- 2. Modify app.js ---
let appjs = fs.readFileSync('app.js', 'utf8');

const renderStartIdx = appjs.indexOf("function renderExpenseCart() {");
const nextFuncIdx = appjs.indexOf("function removeExpenseFromCart(index) {", renderStartIdx);

if (renderStartIdx !== -1 && nextFuncIdx !== -1) {
    const newRenderLogic = `
function renderExpenseCart() {
    const list = document.getElementById('expense-cart-list');
    const totalEl = document.getElementById('expense-cart-total');
    if(!list) return;
    
    if(expenseCart.length === 0) {
        list.innerHTML = '<div class="empty-text-state">Sin registros listados</div>';
        if(totalEl) totalEl.textContent = '$0';
        return;
    }
    
    list.innerHTML = '';
    let grandTotal = 0;
    
    expenseCart.forEach((item, index) => {
        let title, desc;
        if (item.type === 'gasto') {
            title = item.descripcion;
            desc = item.categoria;
        } else {
            let unitAbrev = item.unidad;
            if (item.unidad) {
                const match = item.unidad.match(/\\(([^)]+)\\)/);
                if (match) unitAbrev = match[1];
            }
            // Clean up the insumo name to remove the unit if it's there
            let insumoClean = item.insumo;
            if (insumoClean.includes('(')) {
                insumoClean = insumoClean.split(/\\s*\\d+\\s*[A-Za-z]+.*\\(/)[0].trim();
            }
            
            title = \`\${item.cantidad} \${unitAbrev} - \${item.insumo}\`;
            desc = ''; 
        }
        
        let price = item.type === 'gasto' ? item.valor : item.costoTotal;
        grandTotal += price;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        
        // Use cart-btn-remove to ensure it gets the transparent background and purple/red color
        // And ensure layout is flex with cart-item-details taking up space
        li.innerHTML = \`
            <div class="cart-item-details" style="flex: 1;">
                <span class="cart-item-name" style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">\${title}</span>
                \${desc ? \`<span class="cart-item-notes" style="font-size: 0.8rem; color: var(--text-light);">\${desc}</span>\` : ''}
            </div>
            <div class="cart-item-price" style="font-weight: bold; margin-right: 10px;">$\${price.toLocaleString('es-CO')}</div>
            <button type="button" class="cart-btn-remove" onclick="removeExpenseFromCart(\${index})" style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 5px;"><i data-lucide="trash-2"></i></button>
        \`;
        list.appendChild(li);
    });
    
    if(totalEl) totalEl.textContent = \`$\${grandTotal.toLocaleString('es-CO')}\`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}
`;
    appjs = appjs.substring(0, renderStartIdx) + newRenderLogic.trim() + '\n\n' + appjs.substring(nextFuncIdx);
}

// Modify the population of the Unidades field to only show abbreviation
const expUnidadesRegex = /document\.getElementById\('exp-unidades'\)\.value = selectedInsumoData\.unidad;/;
const newExpUnidadesLogic = `
    let unitAbrev = selectedInsumoData.unidad;
    if (unitAbrev) {
        const match = unitAbrev.match(/\\(([^)]+)\\)/);
        if (match) unitAbrev = match[1];
    }
    document.getElementById('exp-unidades').value = unitAbrev;
`;
appjs = appjs.replace(expUnidadesRegex, newExpUnidadesLogic.trim());

fs.writeFileSync('app.js', appjs);


// --- 3. Bump Cache ---
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.4';");
sw = sw.replace(/index\.html\?v=[^']+/, "index.html?v=" + Date.now());
sw = sw.replace(/app\.js\?v=[^']+/, "app.js?v=" + Date.now());
fs.writeFileSync('sw.js', sw);

console.log("Applied final UI fixes for tabs and cart items.");
