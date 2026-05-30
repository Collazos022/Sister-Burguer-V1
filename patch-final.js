const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8').replace(/\r\n/g, '\n');

function replaceExact(findStr, replaceStr) {
    if (code.includes(findStr)) {
        code = code.replace(findStr, replaceStr);
    } else {
        console.error("COULD NOT FIND:\n", findStr);
    }
}

// 1. Date Helper
replaceExact("let currentPeriod = 'dia';", "let currentPeriod = 'dia';\n\nconst getLocalDateStr = (d = new Date()) => {\n    const offset = d.getTimezoneOffset();\n    const dLocal = new Date(d.getTime() - (offset*60*1000));\n    return dLocal.toISOString().split('T')[0];\n};");
code = code.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateStr()');
code = code.replace(/d\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateStr(d)');

// 2. Fetch Data and Complete Order
replaceExact(
    "estado: p.Estado || 'pendiente',",
    "estado: p.Estado || 'pendiente',\n                            fecha: p.Fecha || p['Fecha '] || getLocalDateStr(),"
);

replaceExact(
    "fecha: getLocalDateStr(),",
    "fecha: pedido.fecha || getLocalDateStr(),"
);

// 3. Reset POS
replaceExact(
`function resetPOS() {
    posActiveOrderId = null;
    posCart = [];
    const posNombre = document.getElementById('pos-nombre');
    if(posNombre) posNombre.value = '';
    renderCart();
    updatePOSButtons();
}`,
`function resetPOS() {
    posActiveOrderId = null;
    posCart = [];
    const posDestino = document.getElementById('pos-destino');
    if(posDestino) { posDestino.value = ''; posDestino.selectedIndex = 0; }
    const posNombre = document.getElementById('pos-nombre');
    if(posNombre) posNombre.value = '';
    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();
    if(typeof renderCart === 'function') renderCart();
    updatePOSButtons();
}`
);

// 4. Update Available Destinations
const fnDest = `\nfunction updateAvailableDestinations() {
    const select = document.getElementById('pos-destino');
    if (!select) return;
    const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado' && p.destino).map(p => p.destino.trim().toLowerCase());
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return;
        let currentEditingDestino = '';
        if (posActiveOrderId) {
            const p = pedidosActivos.find(x => x.id === posActiveOrderId);
            if (p) currentEditingDestino = p.destino;
        }
        if (ocupadas.includes(opt.value.trim().toLowerCase()) && opt.value.trim().toLowerCase() !== currentEditingDestino.trim().toLowerCase()) {
            opt.disabled = true;
            opt.style.display = 'none';
        } else {
            opt.disabled = false;
            opt.style.display = '';
        }
    });
}\n`;
code += fnDest;

replaceExact(
    "function renderOrderBar() {",
    "function renderOrderBar() {\n    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();"
);

replaceExact(
    "posActiveOrderId = id;",
    "posActiveOrderId = id;\n    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();"
);

// 5. Cart Button HTML
replaceExact(
    `<button class="btn-remove-item cart-btn-remove" data-index="\${index}"><i data-lucide="trash-2"></i></button>`,
    `<div class="qty-controls">
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="minus"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="plus"></i></button>
                    </div>`
);

// 6. Cart Event Listeners
const oldRemove = `        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                posCart.splice(idx, 1);
                renderCart_local();
            });
        });`;
        
const newQtyEvents = `        document.querySelectorAll('.btn-qty-minus').forEach(btn => {
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

replaceExact(oldRemove, newQtyEvents);

// 7. POS Buttons Logic
const oldUpdate = `        if (estado === 'preparado') {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'block'; btnEntregar.disabled = false; }
        } else {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'none'; }
        }`;

const newUpdate = `        if (estado === 'preparado') {
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

replaceExact(oldUpdate, newUpdate);

fs.writeFileSync('app.js', code);
console.log('FINAL PATCH APPLIED.');
