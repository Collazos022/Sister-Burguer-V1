const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

// Update the purchase appendRow logic to skip formula columns
const searchStr = `sheetCompras.appendRow(["", item.fecha, item.categoria, item.insumo, item.cantidad, item.costo_unitario, item.costo_total, item.pago, item.comentarios]);`;
const replaceStr = `sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync('temp_codigo.js', code);
    fs.writeFileSync('apps-script/Código.js', code);
    console.log("Updated both temp_codigo.js and apps-script/Código.js");
} else {
    console.error("Could not find the target string in temp_codigo.js");
}
