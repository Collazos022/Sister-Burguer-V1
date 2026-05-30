const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Fix Event Listeners using regex to ignore exact spaces
const btnRemoveRegex = /document\.querySelectorAll\('\.btn-remove-item'\)\.forEach\([^]*?\}\);/g;
const correctEvents = `document.querySelectorAll('.btn-qty-minus').forEach(btn => {
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

code = code.replace(btnRemoveRegex, correctEvents);

// 2. Fix resetPOS to use selectedIndex = 0 for absolute certainty
const resetPosRegex = /const posDestino = document\.getElementById\('pos-destino'\);\s*if\(posDestino\) posDestino\.value = '';/g;
const betterResetDestino = `const posDestino = document.getElementById('pos-destino');
        if(posDestino) { posDestino.value = ''; posDestino.selectedIndex = 0; }`;
code = code.replace(resetPosRegex, betterResetDestino);


// 3. Fix updateAvailableDestinations to handle case insensitivity and trim
const updateDestRegex = /const ocupadas = pedidosActivos\.filter\(p => p\.estado !== 'entregado'\)\.map\(p => p\.destino\);/g;
const betterOcupadas = `const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado' && p.destino).map(p => p.destino.trim().toLowerCase());`;
code = code.replace(updateDestRegex, betterOcupadas);

const optCheckRegex = /if \(ocupadas\.includes\(opt\.value\) && opt\.value !== currentEditingDestino\)/g;
const betterOptCheck = `if (ocupadas.includes(opt.value.trim().toLowerCase()) && opt.value.trim().toLowerCase() !== currentEditingDestino.trim().toLowerCase())`;
code = code.replace(optCheckRegex, betterOptCheck);

fs.writeFileSync('app.js', code);
console.log('Patch 3 applied successfully');
