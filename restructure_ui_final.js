const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

const registerStart = html.indexOf('<section class="dashboard-view" id="register"');
const registerEnd = html.indexOf('</section>', registerStart) + '</section>'.length;

const newRegisterHTML = `
<section class="dashboard-view" id="register" style="display: none;">
    <div class="pos-container">
        <div class="pos-cart pos-cart-box form-scrollable" style="flex: 1 1 100%; max-width: 100%; padding: 20px; box-sizing: border-box;">
            
            <!-- FECHA GLOBAL -->
            <div class="pos-header pos-header-row" style="flex-direction: column; align-items: stretch; gap: 0.5rem; margin-bottom: 1rem;">
                <label style="display:block; color: var(--text-light); font-size: 0.9rem; font-weight: 500;">Fecha del Registro:</label>
                <input type="date" id="global-fecha" class="pos-input" style="width: 100%;" required>
            </div>

            <div class="cart-separator" style="border-top: 2px dashed var(--border-light); margin: 15px 0;"></div>

            <!-- LISTA DE AGREGADOS -->
            <ul id="expense-cart-list" class="cart-items cart-items-container" style="max-height: 250px; overflow-y: auto; padding: 0; margin: 0; list-style: none;">
                <div class="empty-text-state">Sin registros listados</div>
            </ul>
            
            <div class="cart-separator" style="border-top: 2px dashed var(--border-light); margin: 20px 0;"></div>

            <!-- FORMULARIO PARA AGREGAR -->
            <form id="entry-form">
                <div style="display:none;">
                    <input type="radio" id="radio-compra-hidden" name="entry-type" value="purchase">
                    <input type="radio" id="radio-gasto-hidden" name="entry-type" value="expense" checked>
                </div>

                <div class="form-body" id="form-gasto" style="display: none;">
                    <div class="form-group"><label>Categoría</label>
                        <select id="exp-cat-gasto" class="pos-select">
                            <option value="Administración">Administración</option>
                            <option value="Servicios Públicos">Servicios Públicos</option>
                            <option value="Nómina">Nómina</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Descripción</label><input type="text" id="exp-descripcion" class="pos-input"></div>
                    <div class="form-group"><label>Valor ($)</label><input type="number" id="exp-valor-gasto" class="pos-input"></div>
                </div>

                <div class="form-body" id="form-compra" style="display: block;">
                    <div class="form-group"><label>Categoría</label><select id="exp-cat-compra" class="pos-select"><option value="">Cargando...</option></select></div>
                    <div class="form-group"><label>Insumo</label><select id="exp-insumo" class="pos-select"><option value="">Seleccione Categoría primero</option></select></div>
                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex:1"><label>Unidades</label><input type="text" id="exp-unidades" class="pos-input" readonly disabled style="background: var(--bg-body);"></div>
                        <div class="form-group" style="flex:1"><label>Cantidad</label><input type="number" id="exp-cantidad" class="pos-input" step="0.01"></div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex:1"><label>Costo Unit. ($)</label><input type="number" id="exp-costo-unitario" class="pos-input"></div>
                        <div class="form-group" style="flex:1"><label>Costo Total ($)</label><input type="number" id="exp-costo-total" class="pos-input" readonly disabled style="font-weight:bold; color:var(--primary); background: var(--bg-body);"></div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                    <button type="submit" class="btn-primary" id="btn-add-expense" style="padding: 10px 20px; font-size: 0.9rem; border-radius: 8px;"><i data-lucide="plus"></i> Agregar</button>
                </div>
            </form>

            <div class="cart-separator" style="border-top: 1px solid var(--border-light); margin: 20px 0;"></div>

            <!-- TOTAL, METODO PAGO, COMENTARIO -->
            <div class="pos-totals" style="padding-bottom: 15px;">
                <div class="totals-row total" style="margin-bottom: 20px;">
                    <span>Total</span>
                    <span id="expense-cart-total">$0</span>
                </div>

                <div class="form-group">
                    <label>Método de Pago General</label>
                    <div class="pos-payment radio-group" style="margin-top: 5px;">
                        <label class="radio-label"><input type="radio" name="global-pago" value="Efectivo" checked> Efectivo</label>
                        <label class="radio-label"><input type="radio" name="global-pago" value="Transferencia"> Transferencia</label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Comentario General (Opcional)</label>
                    <input type="text" id="global-comentario" class="pos-input" placeholder="Aplica para todos los registros del lote">
                </div>

                <button type="button" class="btn-primary" id="btn-submit-expenses" style="width: 100%; margin-top: 15px; background: var(--success); font-size: 1.1rem; padding: 15px;"><i data-lucide="save"></i> Registrar Todo</button>
            </div>
        </div>
    </div>
</section>
`;

html = html.substring(0, registerStart) + newRegisterHTML.trim() + html.substring(registerEnd);
fs.writeFileSync('index.html', html);


// --- 2. Modify app.js ---
let appjs = fs.readFileSync('app.js', 'utf8');

// Replace renderExpenseCart to use trash icon and clean layout
const renderStartIdx = appjs.indexOf("function renderExpenseCart() {");
const nextFuncIdx = appjs.indexOf("function removeExpenseFromCart(index) {", renderStartIdx);

if(renderStartIdx !== -1 && nextFuncIdx !== -1) {
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
        let title = item.type === 'gasto' ? \`\${item.descripcion}\` : \`\${item.insumo}\`;
        let desc = item.type === 'gasto' ? item.categoria : \`\${item.cantidad} \${item.unidad}\`;
        let price = item.type === 'gasto' ? item.valor : item.costoTotal;
        grandTotal += price;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = \`
            <div class="cart-item-details">
                <span class="cart-item-name">\${title}</span>
                <span class="cart-item-notes">\${desc}</span>
            </div>
            <div class="cart-item-price">$\${price.toLocaleString('es-CO')}</div>
            <button type="button" class="btn-remove" onclick="removeExpenseFromCart(\${index})"><i data-lucide="trash-2"></i></button>
        \`;
        list.appendChild(li);
    });
    
    if(totalEl) totalEl.textContent = \`$\${grandTotal.toLocaleString('es-CO')}\`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}
`;
    appjs = appjs.substring(0, renderStartIdx) + newRenderLogic.trim() + '\n\n' + appjs.substring(nextFuncIdx);
}

// Replace global payment extraction in submit listener
appjs = appjs.replace(/const globalPago = document\.getElementById\('global-pago'\)\.value;/g, "const globalPago = document.querySelector('input[name=\"global-pago\"]:checked') ? document.querySelector('input[name=\"global-pago\"]:checked').value : 'Efectivo';");

fs.writeFileSync('app.js', appjs);

// --- 3. Bump Cache ---
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.3';");
sw = sw.replace(/index\.html\?v=[^']+/, "index.html?v=" + Date.now());
fs.writeFileSync('sw.js', sw);

console.log("Restructured layout applied.");
