const fs = require('fs');

// --- 1. Fix index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Find the #register section
const registerStart = html.indexOf('<section class="dashboard-view" id="register"');
const registerEnd = html.indexOf('</section>', registerStart) + '</section>'.length;

const newRegisterHTML = `
<section class="dashboard-view" id="register" style="display: none;">
    <div class="pos-container">
        <div class="pos-cart pos-cart-box form-scrollable" style="flex: 1 1 100%; max-width: 100%; padding: 20px; box-sizing: border-box;">
            
            <!-- FECHA GLOBAL -->
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="font-weight: bold; color: var(--text-main);">Fecha de Registro</label>
                <input type="date" id="global-fecha" class="pos-input" required>
            </div>

            <!-- LISTA DE AGREGADOS -->
            <div class="pos-header pos-header-row" style="margin-bottom: 10px;">
                <h3>Registros Agregados</h3>
            </div>
            <ul id="expense-cart-list" class="cart-items cart-items-container" style="max-height: 250px; overflow-y: auto; padding: 0; margin: 0; list-style: none;">
                <div class="empty-text-state">Sin registros listados</div>
            </ul>
            <div class="pos-totals" style="padding: 10px 0;">
                <div class="totals-row total" style="font-size: 1rem; border: none; padding: 0;">
                    <span style="color: var(--text-light);">Subtotal Lista</span>
                    <span id="expense-cart-total" style="color: var(--primary);">$0</span>
                </div>
            </div>
            
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

            <!-- GLOBAL FIELDS -->
            <div class="form-group">
                <label>Método de Pago General</label>
                <select id="global-pago" class="pos-select">
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
            </div>
            <div class="form-group">
                <label>Comentario General (Opcional)</label>
                <input type="text" id="global-comentario" class="pos-input" placeholder="Aplica para todos los registros del lote">
            </div>

            <div class="pos-totals" style="margin-top: 20px;">
                <button type="button" class="btn-primary" id="btn-submit-expenses" style="width: 100%; margin-top: 15px; background: var(--success); font-size: 1.1rem; padding: 15px;"><i data-lucide="save"></i> Registrar Todo</button>
            </div>
        </div>
    </div>
</section>
`;

html = html.substring(0, registerStart) + newRegisterHTML.trim() + html.substring(registerEnd);
fs.writeFileSync('index.html', html);


// --- 2. Fix app.js ---
let appjs = fs.readFileSync('app.js', 'utf8');

// A. Replace the entryForm.addEventListener('submit') logic to stop fetching fecha/pago/comentarios
const oldSubmitRegex = /entryForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?expenseCart\.push\(item\);[\s\S]*?renderExpenseCart\(\);\s*\}\);/;

const newSubmitLogic = `
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let item = {};
        
        if (radioVenta && radioVenta.checked) {
            return;
        } else if (radioGasto && radioGasto.checked) {
            const cat = document.getElementById('exp-cat-gasto').value;
            const desc = document.getElementById('exp-descripcion').value;
            const valor = parseFloat(document.getElementById('exp-valor-gasto').value);
            
            if(!cat || !desc || isNaN(valor)) {
                alert("Completa todos los campos obligatorios del gasto.");
                return;
            }

            item = {
                type: 'gasto',
                categoria: cat,
                descripcion: desc,
                valor: valor
            };
        } else if (radioCompra && radioCompra.checked) {
            const cat = document.getElementById('exp-cat-compra').value;
            const insumo = document.getElementById('exp-insumo').value;
            const unidad = document.getElementById('exp-unidades').value;
            const cantidad = parseFloat(document.getElementById('exp-cantidad').value);
            const costoUnit = parseFloat(document.getElementById('exp-costo-unitario').value);
            const costoTotal = parseFloat(document.getElementById('exp-costo-total').value);

            if(!cat || !insumo || isNaN(cantidad) || isNaN(costoTotal)) {
                alert("Completa todos los campos obligatorios de la compra.");
                return;
            }

            item = {
                type: 'compra',
                categoria: cat,
                insumo: insumo,
                unidad: unidad,
                cantidad: cantidad,
                costoUnit: costoUnit,
                costoTotal: costoTotal
            };
        }
        
        expenseCart.push(item);
        
        // Limpiar form
        if (radioGasto && radioGasto.checked) {
            document.getElementById('exp-descripcion').value = '';
            document.getElementById('exp-valor-gasto').value = '';
        } else {
            document.getElementById('exp-cantidad').value = '';
            document.getElementById('exp-costo-unitario').value = '';
            document.getElementById('exp-costo-total').value = '';
        }
        
        renderExpenseCart();
    });
`;

appjs = appjs.replace(oldSubmitRegex, newSubmitLogic.trim());


// B. Replace the renderExpenseCart logic to not show undefined fecha/pago
const oldRenderRegex = /const renderExpenseCart = \(\) => \{[\s\S]*?cartList\.innerHTML \+= html;[\s\S]*?\}\);[\s\S]*?\};/;

const newRenderLogic = `
    const renderExpenseCart = () => {
        const cartList = document.getElementById('expense-cart-list');
        const cartTotal = document.getElementById('expense-cart-total');
        if(!cartList) return;
        
        cartList.innerHTML = '';
        let total = 0;
        
        if (expenseCart.length === 0) {
            cartList.innerHTML = '<div class="empty-text-state">Sin registros listados</div>';
            if(cartTotal) cartTotal.textContent = '$0';
            return;
        }
        
        expenseCart.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            
            let title = item.type === 'gasto' ? \`\${item.categoria} - \${item.descripcion}\` : \`\${item.categoria} - \${item.insumo} (\${item.cantidad} \${item.unidad})\`;
            let price = item.type === 'gasto' ? item.valor : item.costoTotal;
            total += price;
            
            li.innerHTML = \`
                <div class="cart-item-details">
                    <span class="cart-item-name">\${title}</span>
                    <span class="cart-item-notes" style="color: var(--primary);">\${item.type === 'gasto' ? 'Gasto Operativo' : 'Compra de Insumo'}</span>
                </div>
                <div class="cart-item-price">\$\${price.toLocaleString('es-CO')}</div>
                <button type="button" class="btn-remove" onclick="removeExpenseItem(\${index})"><i data-lucide="x"></i></button>
            \`;
            cartList.appendChild(li);
        });
        
        if(cartTotal) cartTotal.textContent = \`\$\${total.toLocaleString('es-CO')}\`;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    };
`;
appjs = appjs.replace(oldRenderRegex, newRenderLogic.trim());


// C. Replace the btn-submit-expenses listener to apply global fields
const oldSubmitBtnRegex = /document\.getElementById\('btn-submit-expenses'\)\.addEventListener\('click', async \(\) => \{[\s\S]*?items: JSON\.stringify\(expenseCart\)[\s\S]*?const response = await fetch\(API_URL/m;

const newSubmitBtnLogic = `
    document.getElementById('btn-submit-expenses').addEventListener('click', async () => {
        if(expenseCart.length === 0) {
            alert("La lista de registros está vacía.");
            return;
        }
        
        const globalFecha = document.getElementById('global-fecha').value;
        const globalPago = document.getElementById('global-pago').value;
        const globalComentario = document.getElementById('global-comentario').value || '';
        
        if (!globalFecha) {
            alert("Por favor selecciona una Fecha de Registro.");
            return;
        }

        // Apply global fields to all items in expenseCart
        const finalCart = expenseCart.map(item => {
            return {
                ...item,
                fecha: globalFecha,
                pago: globalPago,
                comentarios: globalComentario
            };
        });

        const btn = document.getElementById('btn-submit-expenses');
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader" class="icon-small spinner"></i> Registrando...';
        btn.disabled = true;
        
        try {
            const payload = {
                type: 'batch_transactions',
                items: JSON.stringify(finalCart)
            };
            
            const response = await fetch(API_URL
`;

appjs = appjs.replace(oldSubmitBtnRegex, newSubmitBtnLogic.trim());

// We must ensure global fecha defaults to today on load
const setDefaultDateRegex = /const toggleFormType = \(\) => \{/;
const newDefaultDate = `
    const globalFechaInput = document.getElementById('global-fecha');
    if (globalFechaInput && !globalFechaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        globalFechaInput.value = today;
    }
    const toggleFormType = () => {
`;
appjs = appjs.replace(setDefaultDateRegex, newDefaultDate.trim());

fs.writeFileSync('app.js', appjs);


// D. Bump SW cache to apply immediately
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'sb-admin-cache-v[^']+';/, "const CACHE_NAME = 'sb-admin-cache-v3.0.2';");
sw = sw.replace(/style\.css\?v=[^']+/, "style.css?v=" + Date.now());
sw = sw.replace(/app\.js\?v=[^']+/, "app.js?v=" + Date.now());
fs.writeFileSync('sw.js', sw);

// Bump index html cache string
html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/app\.js(\?v=[0-9]+)?/, 'app.js?v=' + Date.now());
html = html.replace(/style\.css(\?v=[0-9]+)?/, 'style.css?v=' + Date.now());
fs.writeFileSync('index.html', html);

console.log("Restructured Register view and made fields global.");
