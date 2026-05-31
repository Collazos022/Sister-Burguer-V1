const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runGastosTest() {
    console.log("Iniciando prueba de 1 Gasto Operacional por cada categoría válida...");
    
    // Las 7 categorías exactas que están ahora en index.html y en la validación de Google Sheets
    const validGastos = ['Arriendo', 'Marketing', 'Otros', 'Prestamos', 'Nomina', 'Servicios', 'Mobiliario'];
    const items = [];

    // Generar 1 Gasto Operacional por cada categoría
    validGastos.forEach((cat, index) => {
        items.push({
            type: 'expense',
            fecha: '2026-05-31',
            categoria: cat,
            descripcion: "Gasto de prueba categoría: " + cat,
            valor: 10000 * (index + 1),
            pago: 'Efectivo',
            comentarios: "Comentario de prueba para " + cat
        });
    });

    const payload = {
        type: 'batch_transactions',
        items: JSON.stringify(items)
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await response.json();
        console.log("Respuesta del servidor:", data);
    } catch (e) {
        console.error("Error enviando datos:", e);
    }
}

runGastosTest();
