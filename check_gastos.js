const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

async function checkGastos() {
    try {
        console.log("Fetching backend data...");
        const response = await fetch(API_URL);
        const data = await response.json();
        
        console.log("\n=== GASTOS OPERATIVOS (Últimos 7) ===");
        const gastos = data.gastos.slice(-7);
        console.log(JSON.stringify(gastos, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkGastos();
