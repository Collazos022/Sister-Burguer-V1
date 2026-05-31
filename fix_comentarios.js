const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

// The line: sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
// Should be: sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, item.comentarios || item.comentario || ""]);

code = code.replace(
    'sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);',
    'sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, item.comentarios || item.comentario || ""]);'
);

// The line: sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);
// Should be: sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentarios || item.comentario || ""]);

code = code.replace(
    'sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);',
    'sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentarios || item.comentario || ""]);'
);

fs.writeFileSync('temp_codigo.js', code);
fs.writeFileSync('apps-script/Código.js', code);
console.log("Comentarios bug fixed!");
