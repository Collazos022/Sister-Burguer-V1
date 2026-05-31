const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runTest() {
    console.log("Sending test transaction to Google Sheets backend...");
    const testItems = [
        {
            type: 'purchase',
            fecha: '31/05/2026',
            categoria: 'Aderesos y Salsas',
            insumo: 'Salsa BBQ',
            unidad: 'Paquete',
            cantidad: 2,
            costoUnit: 1000,
            costoTotal: 2000,
            pago: 'Efectivo',
            comentario: 'Test automatizado'
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
