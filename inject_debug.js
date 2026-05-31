const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

const debugBlock = `
    if (params.type === 'test_fill') {
      const sheet = ss.getSheetByName("COMPRAS_INSUMOS");
      const lr = sheet.getLastRow();
      let debugInfo = { lr: lr };
      
      if (lr > 2) {
        const formulasR1C1 = sheet.getRange(lr - 1, 1, 1, sheet.getLastColumn()).getFormulasR1C1()[0];
        const formulasA1 = sheet.getRange(lr - 1, 1, 1, sheet.getLastColumn()).getFormulas()[0];
        debugInfo.formulasR1C1 = formulasR1C1;
        debugInfo.formulasA1 = formulasA1;
        
        try {
          // Intentar forzar la escritura manual en la última fila
          let wrote = [];
          formulasR1C1.forEach((f, i) => {
            if (f) {
              sheet.getRange(lr, i + 1).setFormulaR1C1(f);
              wrote.push({ col: i + 1, f: f });
            }
          });
          debugInfo.wrote = wrote;
        } catch (e) {
          debugInfo.error = e.toString();
        }
      }
      return ContentService.createTextOutput(JSON.stringify(debugInfo)).setMimeType(ContentService.MimeType.JSON);
    }
`;

// Insert the debug block right after `const items = JSON.parse(params.items);` wait no, insert it at the beginning of doPost
code = code.replace("function doPost(e) {", "function doPost(e) {\n  try {\n    const params = JSON.parse(e.postData.contents);\n    const ss = SpreadsheetApp.getActiveSpreadsheet();\n" + debugBlock);
// clean up the duplicate try/catch if needed, or just insert after the first SpreadsheetApp
let originalPost = `function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();`;

code = fs.readFileSync('temp_codigo.js', 'utf8');
code = code.replace(originalPost, originalPost + debugBlock);

fs.writeFileSync('temp_codigo.js', code);
fs.writeFileSync('apps-script/Código.js', code);
console.log("Injected debug block");
