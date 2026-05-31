const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

// Move fillFormulas to inside the loop
const searchOld = `      if (updatedGastos) fillFormulas(sheetGastos);
      if (updatedCompras) fillFormulas(sheetCompras);`;
      
const searchLoop = `        if (item.type === 'expense') {
          // ["", Fecha, Categoría, Descripción, Valor, Método Pago, "1"]
          sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
          updatedGastos = true;
        } else if (item.type === 'purchase') {
          // A: ID_Compra, B: Fecha, C: Insumo, D: Categoría(formula), E: Unidades(formula), F: Cantidad, G: Costo Unitario, H: Costo Total, I: Método Pago, J: Comentarios
          sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);
          updatedCompras = true;
        }`;

const replaceLoop = `        if (item.type === 'expense') {
          // ["", Fecha, Categoría, Descripción, Valor, Método Pago, "1"]
          sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
          fillFormulas(sheetGastos);
        } else if (item.type === 'purchase') {
          // A: ID_Compra, B: Fecha, C: Insumo, D: Categoría(formula), E: Unidades(formula), F: Cantidad, G: Costo Unitario, H: Costo Total, I: Método Pago, J: Comentarios
          sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);
          fillFormulas(sheetCompras);
        }`;

code = code.replace(searchOld, "");
code = code.replace(searchLoop, replaceLoop);

fs.writeFileSync('temp_codigo.js', code);
fs.writeFileSync('apps-script/Código.js', code);
console.log("Fixed fillFormulas logic for batch_transactions");
