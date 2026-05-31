const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

const renderStartStr = "function renderExpenseCart() {";
const renderStartIdx = appjs.indexOf(renderStartStr);

if(renderStartIdx !== -1) {
    const nextFuncIdx = appjs.indexOf("function removeExpenseFromCart(index) {", renderStartIdx);
    if(nextFuncIdx !== -1) {
        const newRenderLogic = `
function renderExpenseCart() {
    const list = document.getElementById('expense-cart-list');
    const totalEl = document.getElementById('expense-cart-total');
    if(!list) return;
    
    if(expenseCart.length === 0) {
        list.innerHTML = '<div class="empty-text-state" style="font-size: 0.8rem;">Sin registros listados</div>';
        if(totalEl) totalEl.textContent = '$0';
        return;
    }
    
    list.innerHTML = '';
    let grandTotal = 0;
    
    expenseCart.forEach((item, index) => {
        let title = item.type === 'gasto' ? \`\${item.categoria} - \${item.descripcion}\` : \`\${item.categoria} - \${item.insumo} (\${item.cantidad} \${item.unidad})\`;
        let price = item.type === 'gasto' ? item.valor : item.costoTotal;
        grandTotal += price;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = \`
            <div class="cart-item-details">
                <span class="cart-item-name">\${title}</span>
                <span class="cart-item-notes" style="color: var(--primary);">\${item.type === 'gasto' ? 'Gasto Operativo' : 'Compra de Insumo'}</span>
            </div>
            <div class="cart-item-price">$\${price.toLocaleString('es-CO')}</div>
            <button type="button" class="btn-remove" onclick="removeExpenseFromCart(\${index})"><i data-lucide="x"></i></button>
        \`;
        list.appendChild(li);
    });
    
    if(totalEl) totalEl.textContent = \`$\${grandTotal.toLocaleString('es-CO')}\`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}
        `;
        appjs = appjs.substring(0, renderStartIdx) + newRenderLogic.trim() + '\n\n' + appjs.substring(nextFuncIdx);
        fs.writeFileSync('app.js', appjs);
        console.log("Successfully replaced renderExpenseCart function.");
    }
}
