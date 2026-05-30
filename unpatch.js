const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    "estado: (p.Estado || 'pendiente').toString().trim().toLowerCase(),",
    "estado: p.Estado || 'pendiente',"
);

code = code.replace(
    "const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado' && p.destino).map(p => p.destino.trim().toLowerCase());",
    "const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado' && p.destino).map(p => p.destino);"
);

code = code.replace(
    "if (ocupadas.includes(opt.value.trim().toLowerCase()) && opt.value.trim().toLowerCase() !== currentEditingDestino.trim().toLowerCase()) {",
    "if (ocupadas.includes(opt.value) && opt.value !== currentEditingDestino) {"
);

fs.writeFileSync('app.js', code);
console.log('Filtros purificadores eliminados!');
