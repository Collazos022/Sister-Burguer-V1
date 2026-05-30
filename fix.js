const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Fix the broken renderCart_local template literal and event listeners
const brokenRenderEnd = `                    <div class="qty-controls">
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="minus"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="plus"></i></button>
    // Expose global for the specific load logic`;

const fixedRenderEnd = `                    <div class="qty-controls">
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="minus"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="plus"></i></button>
                    </div>
                </div>
            \`;
        });
        if (cartContainer) cartContainer.innerHTML = html;
        if (posTotalPrice) posTotalPrice.textContent = '$' + total.toLocaleString();
        lucide.createIcons();
        
        document.querySelectorAll('.btn-qty-minus').forEach(btn => {
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
        });
        
        updatePOSButtons();
    }

    // Expose global for the specific load logic`;

code = code.replace(brokenRenderEnd, fixedRenderEnd);

// 2. Fix 'updatePOSButtons' logic to hide "Atrás" and rename "Entregar" to "Cobrado"
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

code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('app.js', code);
console.log('Fixed app.js successfully!');
