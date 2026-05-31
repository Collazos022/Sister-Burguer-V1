const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function checkData() {
    try {
        console.log("Fetching backend data...");
        const response = await fetch(API_URL);
        const data = await response.json();
        
        console.log("=== INVENTARIO (Valid Insumos) ===");
        const insumos = data.inventario.slice(0, 5).map(i => i['Nombre Insumo'] || i.Nombre);
        console.log(insumos);
        
        console.log("\n=== COMPRAS (Recent rows) ===");
        const compras = data.compras.slice(-4);
        console.log(JSON.stringify(compras, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkData();
