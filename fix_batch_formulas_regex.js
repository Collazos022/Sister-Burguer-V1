const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

const startIdx = code.indexOf('items.forEach(item => {');
const endIdx = code.indexOf('});', startIdx) + 3;

if (startIdx > -1 && endIdx > -1) {
    const newLoop = `items.forEach(item => {
        if (item.type === 'expense') {
          sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
          fillFormulas(sheetGastos);
        } else if (item.type === 'purchase') {
          sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);
          fillFormulas(sheetCompras);
        }
      });`;
      
    code = code.substring(0, startIdx) + newLoop + code.substring(endIdx);
    fs.writeFileSync('temp_codigo.js', code);
    fs.writeFileSync('apps-script/Código.js', code);
    console.log("Successfully replaced the loop to include fillFormulas!");
} else {
    console.error("Could not find loop bounds!");
}
