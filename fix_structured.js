const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

const searchBlock = `      const batchFillFormulas = (sheet, startLr, numAppended) => {
          if (numAppended === 0 || startLr < 2) return;
          const endLr = sheet.getLastRow();
          const formulas = sheet.getRange(startLr, 1, 1, sheet.getLastColumn()).getFormulasR1C1()[0];
          
          for (let row = startLr + 1; row <= endLr; row++) {
              formulas.forEach((f, i) => {
                  if (f) sheet.getRange(row, i + 1).setFormulaR1C1(f);
              });
          }
      };`;

const newBlock = `      const batchFillFormulas = (sheet, startLr, numAppended) => {
          if (numAppended === 0 || startLr < 2) return;
          
          // Usamos getFormulas() para detectar qué columnas tienen fórmula
          const formulas = sheet.getRange(startLr, 1, 1, sheet.getLastColumn()).getFormulas()[0];
          
          formulas.forEach((f, i) => {
              if (f) {
                  // Copiar usando copyTo preserva las Tablas (Structured References) y actualiza filas relativas
                  const sourceCell = sheet.getRange(startLr, i + 1);
                  const destRange = sheet.getRange(startLr + 1, i + 1, numAppended, 1);
                  sourceCell.copyTo(destRange, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
              }
          });
      };`;

if (code.includes(searchBlock)) {
    code = code.replace(searchBlock, newBlock);
    fs.writeFileSync('temp_codigo.js', code);
    fs.writeFileSync('apps-script/Código.js', code);
    console.log("Replaced with copyTo formula method!");
} else {
    console.log("Could not find the batchFillFormulas block!");
}
