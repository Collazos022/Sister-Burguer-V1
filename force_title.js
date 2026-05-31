const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(/'register': 'Registrar Gastos'/g, "'register': 'Registro de Gastos'");
appjs = appjs.replace(/'register': 'Registrar Compras'/g, "'register': 'Registro de Gastos'");

fs.writeFileSync('app.js', appjs);
console.log("Title force updated");
