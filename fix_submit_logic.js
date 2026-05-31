const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const startTag = "entryForm.addEventListener('submit', (e) => {";
const endTag = "renderExpenseCart();\r\n    });"; // Look at the end of the submit block

const startIdx = appjs.indexOf(startTag);
const endStr = "renderExpenseCart();\n    });";
let endIdx = appjs.indexOf(endStr, startIdx);
if (endIdx === -1) {
    endIdx = appjs.indexOf("renderExpenseCart();\r\n    });", startIdx);
}
if (endIdx === -1) {
    endIdx = appjs.indexOf("renderExpenseCart();", startIdx);
    if(endIdx !== -1) {
        endIdx = appjs.indexOf("});", endIdx) + 3;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
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
    
    appjs = appjs.substring(0, startIdx) + newSubmitLogic.trim() + appjs.substring(endIdx);
    fs.writeFileSync('app.js', appjs);
    console.log("Successfully replaced entryForm submit logic.");
} else {
    console.log("Could not find start or end index for entryForm.");
}
