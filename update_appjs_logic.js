const fs = require('fs');

const appjsPath = 'app.js';
let appjs = fs.readFileSync(appjsPath, 'utf8');

// 1. Add expenseCart to the top
if (!appjs.includes('let expenseCart = [];')) {
    appjs = appjs.replace('let currentPeriod = \'dia\';', "let currentPeriod = 'dia';\nlet expenseCart = [];");
}

// 2. Replace the entryForm submit listener
const submitStartStr = "entryForm.addEventListener('submit', (e) => {";
const submitStartIndex = appjs.indexOf(submitStartStr);
const submitEndStr = "        fetchData();\n    });";
const submitEndIndex = appjs.indexOf(submitEndStr, submitStartIndex);

if (submitStartIndex > -1 && submitEndIndex > -1) {
    const newSubmitLogic = `entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let item = {};
        
        if (radioVenta.checked) {
            // NOT USED IN NEW WORKFLOW
            return;
        } else if (radioGasto.checked) {
            const cat = document.getElementById('exp-cat-gasto').value;
            const desc = document.getElementById('exp-descripcion').value;
            const valor = parseFloat(document.getElementById('exp-valor-gasto').value);
            const pago = document.getElementById('exp-pago-gasto').value;
            
            if(!cat || !desc || !valor) {
                alert("Completa todos los campos obligatorios.");
                return;
            }
            
            item = {
                type: 'expense',
                fecha: document.getElementById('exp-fecha-gasto').value,
                categoria: cat,
                descripcion: desc,
                valor: valor,
                pago: pago,
                comentario: document.getElementById('exp-comentarios-gasto').value || '',
                displayTitle: \`Gasto: \${cat}\`,
                displayDesc: \`\${desc} | Valor: $\${valor.toLocaleString('es-CO')} (\${pago})\`
            };
        } else if (radioCompra.checked) {
            const cat = document.getElementById('exp-cat-compra').value;
            const insumo = document.getElementById('exp-insumo').value;
            const qty = parseFloat(document.getElementById('exp-cantidad').value);
            const price = parseFloat(document.getElementById('exp-costo-unitario').value);
            const pago = document.getElementById('exp-pago-compra').value;
            const comentarios = document.getElementById('exp-comentarios-compra').value || '';
            const provName = comentarios.includes('-') ? comentarios : 'COMPRA';

            if(!cat || !insumo || !qty || !price) {
                alert("Completa todos los campos obligatorios.");
                return;
            }
            
            item = {
                type: 'purchase',
                fecha: document.getElementById('exp-fecha-compra').value,
                proveedor: provName,
                insumo: insumo,
                cantidad: qty,
                valor: price, // Costo Unitario
                costo_total: qty * price,
                pago: pago,
                comentario: comentarios,
                displayTitle: \`Compra: \${insumo}\`,
                displayDesc: \`Cant: \${qty} | Total: $\${(qty * price).toLocaleString('es-CO')} (\${pago})\`
            };
        }
        
        expenseCart.push(item);
        renderExpenseCart();
        
        // Reset specific fields
        document.getElementById('exp-cantidad').value = '';
        document.getElementById('exp-costo-unitario').value = '';
        document.getElementById('exp-costo-total').value = '';
        document.getElementById('exp-descripcion').value = '';
        document.getElementById('exp-valor-gasto').value = '';
        document.getElementById('exp-comentarios-compra').value = '';
        document.getElementById('exp-comentarios-gasto').value = '';
    });
`;
    appjs = appjs.substring(0, submitStartIndex) + newSubmitLogic + appjs.substring(submitEndIndex + submitEndStr.length);
}

// 3. Add populateExpenseDropdowns to loadDashboardData
const lddIndex = appjs.indexOf('function loadDashboardData() {');
if (lddIndex > -1) {
    const renderTableIndex = appjs.indexOf('renderInventoryTable();', lddIndex);
    if (renderTableIndex > -1) {
        appjs = appjs.substring(0, renderTableIndex) + "renderInventoryTable();\n    populateExpenseDropdowns();\n" + appjs.substring(renderTableIndex + 'renderInventoryTable();'.length);
    }
}

// 4. Append new functions
const newFunctions = `
function renderExpenseCart() {
    const list = document.getElementById('expense-cart-list');
    const totalEl = document.getElementById('expense-cart-total');
    if(!list) return;
    
    if(expenseCart.length === 0) {
        list.innerHTML = '<div class="empty-text-state" style="font-size: 0.8rem;">La lista está vacía</div>';
        totalEl.textContent = '$0';
        return;
    }
    
    let html = '';
    let grandTotal = 0;
    
    expenseCart.forEach((item, index) => {
        const itemTotal = item.type === 'purchase' ? item.costo_total : item.valor;
        grandTotal += itemTotal;
        
        html += \`
            <li class="cart-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-color); padding: 5px 0;">
                <div class="cart-item-details" style="display:flex; flex-direction:column;">
                    <span class="cart-item-name" style="font-weight:bold; font-size:0.9rem;">\${item.displayTitle}</span>
                    <span class="cart-item-note" style="font-size:0.8rem; color:var(--text-light);">\${item.displayDesc}</span>
                </div>
                <div class="cart-item-actions" style="display:flex; align-items:center; gap:10px;">
                    <span class="cart-item-price" style="font-weight:bold; color:var(--primary);">$ \${itemTotal.toLocaleString('es-CO')}</span>
                    <button type="button" class="btn-icon danger" onclick="removeExpenseFromCart(\${index})" style="background:transparent; border:none; color:var(--danger); cursor:pointer;">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </li>
        \`;
    });
    
    list.innerHTML = html;
    totalEl.textContent = \`$\${grandTotal.toLocaleString('es-CO')}\`;
    lucide.createIcons();
}

function removeExpenseFromCart(index) {
    expenseCart.splice(index, 1);
    renderExpenseCart();
}

function populateExpenseDropdowns() {
    if (!dbData || !dbData.inventario) return;
    
    const catSelect = document.getElementById('exp-cat-compra');
    const insumoSelect = document.getElementById('exp-insumo');
    const unitInput = document.getElementById('exp-unidades');
    
    if (!catSelect || !insumoSelect || !unitInput) return;
    
    const today = new Date().toISOString().split('T')[0];
    const fechaC = document.getElementById('exp-fecha-compra');
    const fechaG = document.getElementById('exp-fecha-gasto');
    if(fechaC && !fechaC.value) fechaC.value = today;
    if(fechaG && !fechaG.value) fechaG.value = today;

    const categories = [...new Set(dbData.inventario.map(i => i['Categoría'] || i.Categoria || 'Otros'))];
    
    let catHtml = '<option value="">Seleccione...</option>';
    categories.sort().forEach(c => {
        catHtml += \`<option value="\${c}">\${c}</option>\`;
    });
    catSelect.innerHTML = catHtml;
    
    catSelect.addEventListener('change', () => {
        const selCat = catSelect.value;
        if (!selCat) {
            insumoSelect.innerHTML = '<option value="">Seleccione Categoría primero</option>';
            unitInput.value = '';
            return;
        }
        
        const insumos = dbData.inventario.filter(i => (i['Categoría'] || i.Categoria || 'Otros') === selCat);
        let insumoHtml = '<option value="">Seleccione Insumo...</option>';
        insumos.sort((a,b) => {
            const nameA = a['Nombre Insumo'] || a.Nombre || '';
            const nameB = b['Nombre Insumo'] || b.Nombre || '';
            return nameA.localeCompare(nameB);
        }).forEach(i => {
            const name = i['Nombre Insumo'] || i.Nombre || 'Desconocido';
            insumoHtml += \`<option value="\${name}">\${name}</option>\`;
        });
        insumoSelect.innerHTML = insumoHtml;
    });
    
    insumoSelect.addEventListener('change', () => {
        const selInsumo = insumoSelect.value;
        const info = dbData.inventario.find(i => (i['Nombre Insumo'] || i.Nombre) === selInsumo);
        if (info) {
            unitInput.value = info['Unidad Base'] || info.Unidad || '';
        } else {
            unitInput.value = '';
        }
    });

    const qtyInput = document.getElementById('exp-cantidad');
    const priceInput = document.getElementById('exp-costo-unitario');
    const totalInput = document.getElementById('exp-costo-total');
    
    const updateTotal = () => {
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        totalInput.value = (qty * price).toFixed(2);
    };
    qtyInput.addEventListener('input', updateTotal);
    priceInput.addEventListener('input', updateTotal);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-submit-expenses').addEventListener('click', async () => {
        if(expenseCart.length === 0) {
            alert("La lista está vacía.");
            return;
        }
        
        const btn = document.getElementById('btn-submit-expenses');
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader" class="icon-small spinner"></i> Registrando...';
        btn.disabled = true;
        
        try {
            const payload = {
                type: 'batch_transactions',
                items: JSON.stringify(expenseCart)
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            const data = await response.json();
            
            if(data.status === 'success') {
                alert("Transacciones registradas exitosamente!");
                expenseCart = [];
                renderExpenseCart();
                document.getElementById('btn-close-modal').click();
                fetchData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        } finally {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
            lucide.createIcons();
        }
    });
});
`;

appjs += newFunctions;
fs.writeFileSync(appjsPath, appjs);
console.log("Updated app.js logic successfully.");
