/**
 * Sister Burguer - API Backend v7 (POS y Cocina Integrados)
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
      return data.slice(1).map((row, rowIndex) => {
        let obj = { _rowIndex: rowIndex + 2 }; // Guardar la fila real para futuras actualizaciones
        headers.forEach((h, i) => {
          if (h) {
            if (row[i] instanceof Date) {
              obj[h] = row[i].toISOString().split('T')[0];
            } else {
              obj[h] = row[i] !== "" ? row[i] : null;
            }
          }
        });
        return obj;
      }).filter(r => r[headers[0]]); // Filtrar filas vacías
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
      pedidos: readSheet("PEDIDOS_ACTIVOS"), // NUEVA TABLA
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
    
    // -------------------------------------------------------------
    // REGISTRO SIMPLE (Formularios Antiguos)
    // -------------------------------------------------------------
    if (params.type === 'batch_transactions') {
      const sheetGastos = ss.getSheetByName("GASTOS_OPERATIVOS");
      const sheetCompras = ss.getSheetByName("COMPRAS_INSUMOS");
      
      const items = JSON.parse(params.items);
      let updatedGastos = false;
      let updatedCompras = false;
      
      items.forEach(item => {
        if (item.type === 'expense') {
          // ["", Fecha, Categoría, Descripción, Valor, Método Pago, "1"]
          sheetGastos.appendRow(["", item.fecha, item.categoria, item.descripcion, item.valor, item.pago, "1"]);
          updatedGastos = true;
        } else if (item.type === 'purchase') {
          // ["", Fecha, Categoría, Insumo, Cantidad, Costo Unitario, Costo Total, Método Pago, Comentarios]
          sheetCompras.appendRow(["", item.fecha, item.categoria, item.insumo, item.cantidad, item.costo_unitario, item.costo_total, item.pago, item.comentarios]);
          updatedCompras = true;
        }
      });
      
      if (updatedGastos) fillFormulas(sheetGastos);
      if (updatedCompras) fillFormulas(sheetCompras);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // NUEVO SISTEMA DE POS (PEDIDOS ACTIVOS)
    // -------------------------------------------------------------
    const sheetPedidos = ss.getSheetByName("PEDIDOS_ACTIVOS");
    if (!sheetPedidos) throw new Error("La pestaña PEDIDOS_ACTIVOS no existe.");

    if (params.type === 'order') {
      // 1. Crear un nuevo pedido en cola
      sheetPedidos.appendRow([
        params.id_pedido, 
        params.fecha, 
        params.destino, 
        params.nombre_cliente || "", 
        params.metodo_pago, 
        "pendiente", 
        params.total, 
        params.detalle_json
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (params.type === 'update_order') {
      // 2. Cocina marca el pedido como PREPARADO
      const data = sheetPedidos.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id_pedido) { // Columna 1 = ID_Pedido
          sheetPedidos.getRange(i + 1, 6).setValue("preparado"); // Columna 6 = Estado
          return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      throw new Error("Pedido no encontrado.");
    }
    
    else if (params.type === 'update_order_full') {
      // 2b. Mesera modifica el pedido (ej. añade más cosas)
      const data = sheetPedidos.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id_pedido) { // Columna 1 = ID_Pedido
          sheetPedidos.getRange(i + 1, 5).setValue(params.total); // Total
          sheetPedidos.getRange(i + 1, 6).setValue("pendiente"); // Vuelve a pendiente
          sheetPedidos.getRange(i + 1, 8).setValue(params.detalle_json); // JSON nuevo
          return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      throw new Error("Pedido no encontrado.");
    }
    
    else if (params.type === 'complete_order') {
      // 3. Mesera marca el pedido como ENTREGADO
      const data = sheetPedidos.getDataRange().getValues();
      let pedidoJson = null;
      let pedidoRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == params.id_pedido) {
          pedidoRow = i + 1;
          pedidoJson = data[i][7]; // Columna 8 = Detalle_JSON
          break;
        }
      }

      if (!pedidoJson) throw new Error("Pedido no encontrado o sin detalles.");

      // A) Trasladar cada ítem a VENTAS_DIARIAS
      const sheetVentas = ss.getSheetByName("VENTAS_DIARIAS");
      if (!sheetVentas) throw new Error("La pestaña VENTAS_DIARIAS no existe.");

      const detalles = JSON.parse(pedidoJson);
      
      detalles.forEach(item => {
        // Estructura de VENTAS_DIARIAS: [A:"", B:Fecha, C:Plato, D:"", E:Cantidad, F:Pago, G:Domicilio, H:"", I:"", J:Valor_Dom, K:Total]
        let domValue = "0";
        let esDomicilio = "NO";
        if (params.destino.toUpperCase().includes("DOMICILIO")) {
            esDomicilio = "SI";
            domValue = "1000"; // Puedes ajustar el cobro del domicilio aquí
        }

        sheetVentas.appendRow([
          "", 
          params.fecha, 
          item.plato, 
          "", 
          item.cantidad, 
          params.metodo_pago, 
          esDomicilio, 
          "", 
          "", 
          domValue, 
          item.total
        ]);
        fillFormulas(sheetVentas);
      });

      // B) Eliminar la fila temporal de PEDIDOS_ACTIVOS para no acumular basura
      sheetPedidos.deleteRow(pedidoRow);

      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error("Tipo de acción no reconocida.");
      
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