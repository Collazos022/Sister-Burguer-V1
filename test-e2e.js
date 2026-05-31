const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runE2ETest() {
    console.log("Simulando carga útil EXACTA de la interfaz (End-to-End Test)...");
    
    // Esta es la estructura literal que genera app.js cuando se da clic en "Registrar Todo"
    const items = [
        // Simulando 2 Gastos Operativos agregados desde la interfaz
        {
            type: 'expense',
            categoria: 'Servicios',
            descripcion: 'Pago de Internet E2E',
            valor: 85000,
            fecha: '2026-05-31',
            pago: 'Transferencia',
            comentarios: 'Este es el comentario general de la UI'
        },
        {
            type: 'expense',
            categoria: 'Nomina',
            descripcion: 'Pago quincena E2E',
            valor: 50000,
            fecha: '2026-05-31',
            pago: 'Transferencia',
            comentarios: 'Este es el comentario general de la UI'
        },
        // Simulando 2 Compras de Insumos agregados desde la interfaz
        {
            type: 'purchase',
            categoria: 'Aderesos y Salsas',
            insumo: 'Salsa BBQ',
            unidad: 'Kilogramo (Kg)',
            cantidad: 2,
            costoUnit: 3500,
            costoTotal: 7000,
            fecha: '2026-05-31',
            pago: 'Transferencia',
            comentarios: 'Este es el comentario general de la UI'
        },
        {
            type: 'purchase',
            categoria: 'Aderesos y Salsas',
            insumo: 'Maíz Dulce',
            unidad: 'Kilogramo (Kg)',
            cantidad: 3,
            costoUnit: 4000,
            costoTotal: 12000,
            fecha: '2026-05-31',
            pago: 'Transferencia',
            comentarios: 'Este es el comentario general de la UI'
        }
    ];

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

runE2ETest();
