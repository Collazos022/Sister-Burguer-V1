const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

// 1. Fix the payload types (purchase, expense) in submit logic
appjs = appjs.replace(/type: 'gasto',/g, "type: 'expense',");
appjs = appjs.replace(/type: 'compra',/g, "type: 'purchase',");

// 2. Fix the render logic: use cart-item-row, and fix the text formatting
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
        if (item.type === 'expense') {
            title = item.descripcion;
            desc = item.categoria;
        } else {
            let unitAbrev = item.unidad || '';
            // If the unit has parentheses, extract the abbreviation (e.g. "Kg", "und")
            const match = unitAbrev.match(/\\(([^)]+)\\)/);
            if (match) {
                unitAbrev = match[1];
                // If the extracted part is just a number (e.g. "200" from "Paquete (200)"), use the main word instead
                if (!isNaN(unitAbrev)) {
                    unitAbrev = item.unidad.split(' ')[0];
                }
            }
            
            // Clean up the insumo name if it already has the unit appended at the end
            let insumoClean = item.insumo || '';
            if (insumoClean.includes(' (')) {
                insumoClean = insumoClean.split(' (')[0].trim();
            }
            
            title = \`\${insumoClean} - \${item.cantidad} \${unitAbrev}\`;
            desc = ''; 
        }
        
        let price = item.type === 'expense' ? item.valor : item.costoTotal;
        grandTotal += price;
        
        const li = document.createElement('li');
        li.className = 'cart-item-row'; // THIS WAS THE BUG: was cart-item instead of cart-item-row
        
        li.innerHTML = \`
            <div class="cart-item-details" style="flex: 1;">
                <span class="cart-item-name" style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">\${title}</span>
                \${desc ? \`<span class="cart-item-notes" style="font-size: 0.8rem; color: var(--text-light);">\${desc}</span>\` : ''}
            </div>
            <div class="cart-item-price" style="font-weight: bold; margin-right: 10px;">$\${price.toLocaleString('es-CO')}</div>
            <button type="button" class="cart-btn-remove" onclick="removeExpenseFromCart(\${index})" style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 5px; display: flex; align-items: center;"><i data-lucide="trash-2"></i></button>
        \`;
        list.appendChild(li);
    });
    
    if(totalEl) totalEl.textContent = \`$\${grandTotal.toLocaleString('es-CO')}\`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}
`;
    appjs = appjs.substring(0, renderStartIdx) + newRenderLogic.trim() + '\n\n' + appjs.substring(nextFuncIdx);
}

// 3. Fix the "Unidades" field input population logic
const expUnidadesStart = appjs.indexOf("let unitAbrev = selectedInsumoData.unidad;");
if(expUnidadesStart !== -1) {
    const expUnidadesEnd = appjs.indexOf("document.getElementById('exp-unidades').value = unitAbrev;", expUnidadesStart) + "document.getElementById('exp-unidades').value = unitAbrev;".length;
    
    const newExpUnidadesLogic = `
    let unitAbrev = selectedInsumoData.unidad;
    if (unitAbrev) {
        const match = unitAbrev.match(/\\(([^)]+)\\)/);
        if (match) {
            unitAbrev = match[1];
            if (!isNaN(unitAbrev)) {
                unitAbrev = selectedInsumoData.unidad.split(' ')[0];
            }
        }
    }
    document.getElementById('exp-unidades').value = unitAbrev;
    `;
    appjs = appjs.substring(0, expUnidadesStart) + newExpUnidadesLogic.trim() + appjs.substring(expUnidadesEnd);
}

fs.writeFileSync('app.js', appjs);


// --- Bump Cache ---
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.5';");
sw = sw.replace(/app\.js\?v=[^']+/, "app.js?v=" + Date.now());
fs.writeFileSync('sw.js', sw);

console.log("Fixed payload bugs and cart-item layout bug.");
