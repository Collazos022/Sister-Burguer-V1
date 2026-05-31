const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    console.log("Navegando a localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Switch to Register view
    console.log("Navegando a la vista Registrar...");
    await page.click('a[data-tab="register"]');
    await page.waitForTimeout(1000);
    
    console.log("Esperando carga de categorías de inventario desde el backend...");
    await page.waitForFunction(() => {
        const select = document.querySelector('#exp-cat-compra');
        return select && select.options.length > 1;
    }, { timeout: 15000 });
    
    // 1. Agregar Compra de Insumo
    await page.check('input[value="purchase"]');
    await page.selectOption('#exp-cat-compra', { index: 1 });
    await page.waitForTimeout(500);
    await page.selectOption('#exp-insumo', { index: 1 });
    await page.waitForTimeout(500);
    
    await page.fill('#exp-cantidad', '5');
    await page.fill('#exp-costo-unitario', '1200');
    await page.fill('#exp-comentarios-compra', 'Proveedor XYZ');
    
    // Using evaluate for the add button to bypass any viewport issues
    await page.evaluate(() => document.getElementById('btn-add-expense').click());
    console.log("=> Compra de insumo agregada a la lista.");
    await page.waitForTimeout(500);
    
    // 2. Agregar Gasto Operativo
    console.log("Cambiando a Gasto Operativo...");
    await page.check('input[value="expense"]');
    await page.waitForTimeout(500);
    
    await page.selectOption('#exp-cat-gasto', 'Servicios Públicos');
    await page.fill('#exp-descripcion', 'Recibo de Luz');
    await page.fill('#exp-valor-gasto', '85000');
    await page.fill('#exp-comentarios-gasto', 'Mes de Mayo');
    
    await page.evaluate(() => document.getElementById('btn-add-expense').click());
    console.log("=> Gasto operativo agregado a la lista.");
    await page.waitForTimeout(500);
    
    // Setup dialog listener to capture the final success alert
    let resultDialog = "";
    page.on('dialog', async dialog => {
        resultDialog = dialog.message();
        console.log("DIALOG OPENED:", resultDialog);
        await dialog.accept();
    });
    
    // Submit!
    console.log("Enviando transacciones al servidor de Google desde el modal...");
    await page.evaluate(() => document.getElementById('btn-submit-expenses').click());
    
    console.log("Esperando respuesta del servidor...");
    for(let i=0; i<30; i++) {
        if(resultDialog !== "") break;
        await page.waitForTimeout(1000);
    }
    
    if (resultDialog.includes("exitosamente")) {
        console.log("RESULTADO FINAL: SUCCESS");
        process.exit(0);
    } else {
        console.log("RESULTADO FINAL: FAILED ->", resultDialog);
        process.exit(1);
    }
})();
