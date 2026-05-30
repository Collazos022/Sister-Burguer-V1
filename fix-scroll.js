const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldEnd = `    posCart = JSON.parse(JSON.stringify(pedido.items)); // Deep copy
    renderCart();
    updatePOSButtons();
    renderOrderBar(); // Trigger UI update for the active pill
}`;

const newEnd = `    posCart = JSON.parse(JSON.stringify(pedido.items)); // Deep copy
    if(typeof renderCart === 'function') renderCart();
    updatePOSButtons();
    renderOrderBar(); // Trigger UI update for the active pill
    
    setTimeout(() => {
        const activePill = document.querySelector('.order-pill.active');
        if (activePill) activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        const posView = document.querySelector('.main-container');
        if (posView) posView.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
}`;

if (code.includes('renderOrderBar(); // Trigger UI update for the active pill\n}')) {
    code = code.replace(oldEnd, newEnd);
    fs.writeFileSync('app.js', code);
    console.log("editOrder scroll logic added successfully!");
} else {
    console.log("Could not find editOrder end");
}
