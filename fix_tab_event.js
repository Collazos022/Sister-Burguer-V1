const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const oldLogic = "if (typeof toggleFormType === 'function') toggleFormType();";
const newLogicCompra = "if (hiddenCompra) hiddenCompra.dispatchEvent(new Event('change'));";
const newLogicGasto = "if (hiddenGasto) hiddenGasto.dispatchEvent(new Event('change'));";

appjs = appjs.replace("if (typeof toggleFormType === 'function') toggleFormType();", newLogicCompra);
appjs = appjs.replace("if (typeof toggleFormType === 'function') toggleFormType();", newLogicGasto);

fs.writeFileSync('app.js', appjs);
console.log("Fixed tab switching using Event Dispatch");
