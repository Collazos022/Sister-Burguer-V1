const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function runCleanStressTest() {
    console.log("Iniciando prueba de 8 Insumos y 8 Gastos Operacionales (Valores Reales)...");
    
    const validInsumos = ['Maíz Dulce', 'Papa Ripio', 'Salsa BBQ', 'Salsa Dulce'];
    const validGastos = ['Administración', 'Servicios Públicos', 'Nómina', 'Mantenimiento', 'Marketing', 'Otros'];
    const validPagos = ['Efectivo', 'Transferencia'];
    
    const items = [];

    // Generar 8 Compras de Insumos
    for (let i = 1; i <= 8; i++) {
        items.push({
            type: 'purchase',
            fecha: '2026-05-31',
            categoria: 'Ignorado', // Se calcula con fórmula
            insumo: validInsumos[i % validInsumos.length],
            unidad: 'Ignorado', // Se calcula con fórmula
            cantidad: i,
            costoUnit: 1000 * i,
            costoTotal: i * (1000 * i),
            pago: validPagos[i % validPagos.length],
            comentario: "Prueba Limpia " + i
        });
    }

    // Generar 8 Gastos Operacionales
    for (let i = 1; i <= 8; i++) {
        items.push({
            type: 'expense',
            fecha: '2026-05-31',
            categoria: validGastos[i % validGastos.length],
            descripcion: "Gasto de prueba real " + i,
            valor: 15000 * i,
            pago: validPagos[i % validPagos.length]
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

runCleanStressTest();
