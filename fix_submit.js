const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

appjs = appjs.replace(/const radioVenta = document\.querySelector\('input\[value="sale"\]'\);[\r\n]*/, "const radioVenta = document.querySelector('input[value=\"sale\"]');\n");
appjs = appjs.replace(/radioVenta\.addEventListener\('change', toggleFormType\);[\r\n]*/, "if(radioVenta) radioVenta.addEventListener('change', toggleFormType);\n");
appjs = appjs.replace(/radioGasto\.addEventListener\('change', toggleFormType\);[\r\n]*/, "if(radioGasto) radioGasto.addEventListener('change', toggleFormType);\n");
appjs = appjs.replace(/radioCompra\.addEventListener\('change', toggleFormType\);[\r\n]*/, "if(radioCompra) radioCompra.addEventListener('change', toggleFormType);\n");

// ALSO remove duplicate modal from index.html!
let html = fs.readFileSync('index.html', 'utf8');
const modalOverlayIndex = html.indexOf('<div class="modal-overlay" id="entry-modal">');
if (modalOverlayIndex > -1) {
    const endBody = html.indexOf('</body>');
    html = html.substring(0, modalOverlayIndex) + html.substring(html.indexOf('<script src="app.js"></script>'));
    fs.writeFileSync('index.html', html);
    console.log("Removed old modal completely from index.html");
}

fs.writeFileSync('app.js', appjs);
console.log("Fixed radio listeners");
