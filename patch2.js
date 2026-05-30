const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add getLocalDateStr helper
if (!code.includes('const getLocalDateStr')) {
    code = code.replace("let currentPeriod = 'dia';", "let currentPeriod = 'dia';\n\nconst getLocalDateStr = (d = new Date()) => {\n    const offset = d.getTimezoneOffset();\n    const dLocal = new Date(d.getTime() - (offset*60*1000));\n    return dLocal.toISOString().split('T')[0];\n};");
}

// 2. Replace new Date().toISOString().split('T')[0] -> getLocalDateStr()
code = code.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateStr()');

// 3. Replace d.toISOString().split('T')[0] -> getLocalDateStr(d)
code = code.replace(/d\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateStr(d)');

// 4. In fetchData, extract p.Fecha
code = code.replace(
    /estado: p\.Estado \|\| 'pendiente',/g,
    "estado: p.Estado || 'pendiente',\n                            fecha: p.Fecha || p['Fecha '] || getLocalDateStr(),"
);

// 5. In complete_order, send original date
code = code.replace(
    /fecha: getLocalDateStr\(\),([\s\S]*?)destino: pedido\.destino,/g,
    "fecha: pedido.fecha || getLocalDateStr(),$1destino: pedido.destino,"
);

// 6. In resetPOS
const oldReset = `function resetPOS() {
    posActiveOrderId = null;
    posCart = [];
    const posNombre = document.getElementById('pos-nombre');
    if(posNombre) posNombre.value = '';
    renderCart();
    updatePOSButtons();
}`;

const newReset = `function resetPOS() {
    posActiveOrderId = null;
    posCart = [];
    const posDestino = document.getElementById('pos-destino');
    if(posDestino) posDestino.value = '';
    const posNombre = document.getElementById('pos-nombre');
    if(posNombre) posNombre.value = '';
    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();
    if(typeof renderCart === 'function') renderCart();
    updatePOSButtons();
}`;
code = code.replace(oldReset, newReset);

// 7. Add updateAvailableDestinations function
if (!code.includes('function updateAvailableDestinations()')) {
    const fn = `\nfunction updateAvailableDestinations() {
    const select = document.getElementById('pos-destino');
    if (!select) return;
    const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado').map(p => p.destino);
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return;
        let currentEditingDestino = '';
        if (posActiveOrderId) {
            const p = pedidosActivos.find(x => x.id === posActiveOrderId);
            if (p) currentEditingDestino = p.destino;
        }
        if (ocupadas.includes(opt.value) && opt.value !== currentEditingDestino) {
            opt.disabled = true;
            opt.style.display = 'none';
        } else {
            opt.disabled = false;
            opt.style.display = '';
        }
    });
}\n`;
    code += fn;
}

// Hook updateAvailableDestinations into renderOrderBar
if (code.includes('function renderOrderBar() {')) {
    code = code.replace(
        'function renderOrderBar() {',
        'function renderOrderBar() {\n    if(typeof updateAvailableDestinations === "function") updateAvailableDestinations();'
    );
}

// Hook into editOrder
if (code.includes('posActiveOrderId = id;')) {
    code = code.replace(
        'posActiveOrderId = id;',
        'posActiveOrderId = id;\n    if(typeof updateAvailableDestinations === "function") updateAvailableDestinations();'
    );
}

// 8. Replace renderCart_local html loop for +/- buttons
const oldCartHtml = `<button class="btn-remove-item cart-btn-remove" data-index="\${index}"><i data-lucide="trash-2"></i></button>`;
const newCartHtml = `<div class="qty-controls">
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="minus"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="plus"></i></button>
                    </div>`;
code = code.replace(oldCartHtml, newCartHtml);

// Remove old btn-remove-item logic
const oldRemoveEvent = `document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                posCart.splice(idx, 1);
                renderCart_local();
            });
        });`;
const newRemoveEvent = `document.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                const itm = posCart[idx];
                itm.cantidad--;
                if (itm.cantidad <= 0) {
                    posCart.splice(idx, 1);
                }
                renderCart_local();
                if(typeof updatePOSButtons === 'function') updatePOSButtons();
            });
        });
        document.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                const itm = posCart[idx];
                itm.cantidad++;
                renderCart_local();
                if(typeof updatePOSButtons === 'function') updatePOSButtons();
            });
        });`;
code = code.replace(oldRemoveEvent, newRemoveEvent);

// 9. Fix 'updatePOSButtons' logic to hide "Atrás" and rename "Entregar" to "Cobrado"
const oldUpdate = `if (estado === 'preparado') {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'block'; btnEntregar.disabled = false; }
        } else {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'none'; }
        }`;

const newUpdate = `if (estado === 'preparado') {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { 
                btnEntregar.style.display = 'block'; 
                btnEntregar.disabled = false; 
                btnEntregar.textContent = 'Cobrado'; 
            }
            if (btnLimpiar) { btnLimpiar.style.display = 'none'; }
        } else {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'none'; }
            if (btnLimpiar) { btnLimpiar.style.display = 'block'; }
        }`;
code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('app.js', code);
console.log('Patch 2 applied successfully!');
