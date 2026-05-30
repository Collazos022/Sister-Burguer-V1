const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

const regex = /entryForm\.addEventListener\('submit',\s*\(e\)\s*=>\s*\{[\s\S]*?fetchData\(\);\s*\n\s*\}\);/;

const newLogic = `entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let item = {};
        
        if (radioVenta && radioVenta.checked) {
            // NOT USED IN NEW WORKFLOW
            return;
        } else if (radioGasto && radioGasto.checked) {
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
        } else if (radioCompra && radioCompra.checked) {
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
    });`;

if (regex.test(appjs)) {
    appjs = appjs.replace(regex, newLogic);
    fs.writeFileSync('app.js', appjs);
    console.log("Submit listener successfully replaced!");
} else {
    console.log("Could not find submit listener to replace!");
}
