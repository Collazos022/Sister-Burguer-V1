const fs = require('fs');

let code = fs.readFileSync('temp_codigo.js', 'utf8');

// I need to replace the entire POST logic for batch_transactions to be robust.
const startIdx = code.indexOf("if (params.type === 'batch_transactions') {");
const endIdx = code.indexOf("return ContentService.createTextOutput", startIdx);

if (startIdx > -1 && endIdx > -1) {
    const newLogic = `if (params.type === 'batch_transactions') {
      const sheetGastos = ss.getSheetByName("GASTOS_OPERATIVOS");
      const sheetCompras = ss.getSheetByName("COMPRAS_INSUMOS");
      
      const items = JSON.parse(params.items);
      let gastosAppended = 0;
      let comprasAppended = 0;
      
      let startLrGastos = sheetGastos.getLastRow();
      let startLrCompras = sheetCompras.getLastRow();
      
      items.forEach(item => {
        if (item.type === 'expense') {
          sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
          gastosAppended++;
        } else if (item.type === 'purchase') {
          sheetCompras.appendRow(["", item.fecha, item.insumo, "", "", item.cantidad, item.costoUnit, item.costoTotal, item.pago, item.comentario]);
          comprasAppended++;
        }
      });
      
      SpreadsheetApp.flush(); // Force write to get accurate last row
      
      const batchFillFormulas = (sheet, startLr, numAppended) => {
          if (numAppended === 0 || startLr < 2) return;
          const endLr = sheet.getLastRow();
          const formulas = sheet.getRange(startLr, 1, 1, sheet.getLastColumn()).getFormulasR1C1()[0];
          
          for (let row = startLr + 1; row <= endLr; row++) {
              formulas.forEach((f, i) => {
                  if (f) sheet.getRange(row, i + 1).setFormulaR1C1(f);
              });
          }
      };
      
      batchFillFormulas(sheetGastos, startLrGastos, gastosAppended);
      batchFillFormulas(sheetCompras, startLrCompras, comprasAppended);
      
      `;
      
    code = code.substring(0, startIdx) + newLogic + code.substring(endIdx);
    fs.writeFileSync('temp_codigo.js', code);
    fs.writeFileSync('apps-script/Código.js', code);
    console.log("Successfully replaced batch logic with SpreadsheetApp.flush and robust formula copying!");
} else {
    console.log("Could not find block bounds");
}
