const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runTest() {
    console.log("Sending MULTIPLE items to Google Sheets backend...");
    const testItems = [
        {
            type: 'purchase',
            fecha: '31/05/2026',
            categoria: 'Ignorado',
            insumo: 'Papa Ripio',
            unidad: 'Ignorado',
            cantidad: 5,
            costoUnit: 2000,
            costoTotal: 10000,
            pago: 'Efectivo',
            comentario: 'Compra multiple 1'
        },
        {
            type: 'purchase',
            fecha: '31/05/2026',
            categoria: 'Ignorado',
            insumo: 'Salsa Dulce',
            unidad: 'Ignorado',
            cantidad: 3,
            costoUnit: 1500,
            costoTotal: 4500,
            pago: 'Efectivo',
            comentario: 'Compra multiple 2'
        },
        {
            type: 'expense',
            fecha: '31/05/2026',
            categoria: 'Servicios',
            descripcion: 'Pago de Internet (Prueba Automatizada)',
            valor: 55000,
            pago: 'Transferencia'
        }
    ];

    const payload = {
        type: 'batch_transactions',
        items: JSON.stringify(testItems)
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await response.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

runTest();
