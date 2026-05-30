const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', exception => console.log("PAGE ERROR:", exception));
    
    let resultDialog = "";
    page.on('dialog', async dialog => {
        const msg = dialog.message();
        console.log("DIALOG OPENED:", msg);
        if(msg.includes("Transacciones registradas exitosamente")) {
            resultDialog = "SUCCESS";
        } else {
            resultDialog = "ERROR: " + msg;
        }
        await dialog.accept();
    });

    console.log("Navegando a localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log("Cambiando a pestaña Gastos...");
    await page.click('.nav-item[data-tab="expenses"]');
    
    // Test 1: Compra Insumos
    console.log("Esperando carga de categorías de inventario desde el backend...");
    try {
        await page.waitForFunction(() => document.querySelectorAll('#exp-cat-compra option').length > 1, { timeout: 20000 });
        
        // Select first valid category
        const catVal = await page.$eval('#exp-cat-compra option:nth-child(2)', el => el.value);
        await page.selectOption('#exp-cat-compra', catVal);
        
        // Wait for insumos
        await page.waitForTimeout(1000);
        const insVal = await page.$eval('#exp-insumo option:nth-child(2)', el => el.value);
        await page.selectOption('#exp-insumo', insVal);
        
        await page.fill('#exp-cantidad', '5');
        await page.fill('#exp-costo-unitario', '1000');
        await page.fill('#exp-comentarios-compra', 'Prueba E2E Automatizada');
        
        await page.click('#btn-add-expense');
        console.log("=> Compra de insumo agregada a la lista.");
    } catch(e) {
        console.log("No se pudieron cargar insumos (posiblemente la DB esta vacia o tardo mucho).", e);
    }
    
    await page.waitForTimeout(500);
    
    // Test 2: Gasto Operativo
    console.log("Cambiando a Gasto Operativo...");
    await page.click('#btn-type-expense');
    await page.selectOption('#exp-cat-gasto', 'Mantenimiento');
    await page.fill('#exp-descripcion', 'Reparación Prueba E2E');
    await page.fill('#exp-valor-gasto', '25000');
    await page.selectOption('#exp-pago-gasto', 'Transferencia');
    await page.fill('#exp-comentarios-gasto', 'Prueba automática');
    
    await page.click('#btn-add-expense');
    console.log("=> Gasto operativo agregado a la lista.");
    
    await page.waitForTimeout(500);
    
    // Submit!
    console.log("Enviando transacciones al servidor de Google...");
    await page.click('#btn-submit-expenses');
    
    console.log("Esperando respuesta del servidor...");
    for(let i=0; i<30; i++) {
        if(resultDialog !== "") break;
        await page.waitForTimeout(1000);
    }
    
    console.log("RESULTADO FINAL:", resultDialog);

    await browser.close();
})();
