const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

function replaceExact(findStr, replaceStr) {
    if (code.includes(findStr)) {
        code = code.replace(findStr, replaceStr);
    } else {
        console.error("COULD NOT FIND:\n", findStr.substring(0, 50));
    }
}

// 1. Fix resetPOS to re-render the order bar so the active pill is cleared
replaceExact(
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
    if(typeof renderOrderBar === 'function') renderOrderBar();
    updatePOSButtons();
}`
);

// 2. Change the plus/minus buttons to chevron up/down and stack them
replaceExact(
`<div class="qty-controls">
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="minus"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="plus"></i></button>
                    </div>`,
`<div class="qty-controls">
                        <button class="btn-qty-plus" data-index="\${index}"><i data-lucide="chevron-up"></i></button>
                        <span class="qty-display">\${item.cantidad}</span>
                        <button class="btn-qty-minus" data-index="\${index}"><i data-lucide="chevron-down"></i></button>
                    </div>`
);

// 3. Update editOrder to scroll the pill and the page into view
const oldEditOrderEnd = `posPlato.value = '';
    renderCart_local();
    updatePOSButtons();
    renderOrderBar();
}`;

const newEditOrderEnd = `posPlato.value = '';
    renderCart_local();
    updatePOSButtons();
    renderOrderBar();
    
    setTimeout(() => {
        const activePill = document.querySelector('.order-pill.active');
        if (activePill) activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
}`;
replaceExact(oldEditOrderEnd, newEditOrderEnd);

fs.writeFileSync('app.js', code);
console.log('app.js updated successfully!');
