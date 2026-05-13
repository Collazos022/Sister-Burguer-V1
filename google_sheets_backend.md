# API de Google Sheets para Sister Burguer

Aquí está la **Versión 4** del backend, expandida para leer todas las tablas clave y permitir la escritura en Ventas, Compras de Insumos y Gastos Operativos.

Ve a tu Google Sheet, entra a **Extensiones > Apps Script**, reemplaza el código anterior por este y publícalo como **Aplicación Web** (asegurándote de generar una **Nueva Versión**).

```javascript
/**
 * Sister Burguer - API Backend v4 (Soporte Multi-Tabla)
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Función auxiliar para leer hojas dinámicamente
    const readSheet = (name, hasHeaders = true) => {
      const sheet = ss.getSheetByName(name);
      if (!sheet) return [];
      const data = sheet.getDataRange().getValues();
      if (!hasHeaders || data.length < 2) return [];
      const headers = data[0];
      return data.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          if (h) {
            // Limpiar fechas e IDs vacíos
            if (row[i] instanceof Date) {
              obj[h] = row[i].toISOString().split('T')[0];
            } else {
              obj[h] = row[i] !== "" ? row[i] : null;
            }
          }
        });
        return obj;
      }).filter(r => r[headers[0]]); // Filtrar filas vacías basados en la primera columna
    };

    // Leer Menu explícitamente para el combo
    const sheetMenu = ss.getSheetByName("MENU_PLATOS");
    let menuRows = [];
    if (sheetMenu) {
      const dataMenu = sheetMenu.getDataRange().getValues();
      menuRows = dataMenu.slice(1).map(row => ({
        id: row[0], nombre: row[1], precio: row[3] ? row[3].toString().replace(/[^0-9.-]+/g,"") : 0
      })).filter(r => r.id && r.nombre);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      ventas: readSheet("VENTAS_DIARIAS"), 
      compras: readSheet("COMPRAS_INSUMOS"),
      gastos: readSheet("GASTOS_OPERATIVOS"),
      inventario: readSheet("ALERTA_INVENTARIO"),
      flujo: readSheet("FLUJO_CAJA"),
      menu: menuRows
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Función auxiliar para copiar fórmulas de la fila anterior
    const fillFormulas = (sheet) => {
      const lr = sheet.getLastRow();
      if (lr > 2) {
        const formulas = sheet.getRange(lr - 1, 1, 1, sheet.getLastColumn()).getFormulasR1C1()[0];
        formulas.forEach((f, i) => {
          if (f) sheet.getRange(lr, i + 1).setFormulaR1C1(f);
        });
      }
    };
    
    if (params.type === 'sale') {
      const sheet = ss.getSheetByName("VENTAS_DIARIAS");
      sheet.appendRow([
        "", params.fecha, params.plato, "", params.cantidad, params.pago, params.domicilio, "", "", params.domicilio === "SI" ? "1000" : "0", params.total
      ]);
      fillFormulas(sheet);
      
    } else if (params.type === 'expense') {
      const sheet = ss.getSheetByName("GASTOS_OPERATIVOS");
      sheet.appendRow([
        "", params.fecha, params.categoria, params.descripcion, params.valor, params.pago, "1"
      ]);
      fillFormulas(sheet);

    } else if (params.type === 'purchase') {
      const sheet = ss.getSheetByName("COMPRAS_INSUMOS");
      if (!sheet) throw new Error("Hoja COMPRAS_INSUMOS no encontrada");
      sheet.appendRow([
        "", params.fecha, params.proveedor || "", params.insumo, params.cantidad || 1, params.valor
      ]);
      fillFormulas(sheet);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Registro guardado y fórmulas copiadas" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    });
}
```
