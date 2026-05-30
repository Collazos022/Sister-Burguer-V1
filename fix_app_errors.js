const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(
    'populateSecondaryViews(startDate, endDate);\n}',
    'populateSecondaryViews(startDate, endDate);\n    populateExpenseDropdowns();\n}'
);

appjs = appjs.replace(
    'if (radioVenta.checked) {',
    'if (radioVenta && radioVenta.checked) {'
);

appjs = appjs.replace(
    '} else if (radioGasto.checked) {',
    '} else if (radioGasto && radioGasto.checked) {'
);

appjs = appjs.replace(
    '} else if (radioCompra.checked) {',
    '} else if (radioCompra && radioCompra.checked) {'
);

// We must also fix the radio references in index.html, they use input[value="expense"] instead of id.
// In app.js: const radioGasto = document.querySelector('input[value="expense"]');
// BUT in index.html, my modal radio buttons are:
// <input type="radio" name="entry-type" value="expense">
// <input type="radio" name="entry-type" value="purchase" checked>
// These will be found successfully by querySelector!

fs.writeFileSync('app.js', appjs);
console.log("Fixed app.js errors");
