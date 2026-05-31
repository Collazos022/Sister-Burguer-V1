const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runStressTest() {
    console.log("Iniciando prueba de estrés: 8 Insumos y 8 Gastos Operacionales...");
    
    const validInsumos = ['Caja Menor', 'Maíz Dulce', 'Papa Ripio', 'Salsa BBQ', 'Salsa Dulce'];
    const validGastos = ['Servicios', 'Nómina', 'Arriendo', 'Mantenimiento', 'Otros'];
    const items = [];

    // Generar 8 Compras de Insumos
    for (let i = 1; i <= 8; i++) {
        items.push({
            type: 'purchase',
            fecha: '31/05/2026',
            categoria: 'Ignorado', // Se calcula con fórmula
            insumo: validInsumos[i % validInsumos.length],
            unidad: 'Ignorado', // Se calcula con fórmula
            cantidad: i * 2,
            costoUnit: 1000 * i,
            costoTotal: (i * 2) * (1000 * i),
            pago: i % 2 === 0 ? 'Efectivo' : 'Nequi',
            comentario: "Prueba de estres Insumo " + i
        });
    }

    // Generar 8 Gastos Operacionales
    for (let i = 1; i <= 8; i++) {
        items.push({
            type: 'expense',
            fecha: '31/05/2026',
            categoria: validGastos[i % validGastos.length],
            descripcion: "Gasto masivo de prueba " + i,
            valor: 15000 * i,
            pago: i % 2 === 0 ? 'Efectivo' : 'Bancolombia'
        });
    }

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

runStressTest();
