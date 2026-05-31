const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));
    
    console.log("Navegando a localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log("Navegando a la vista Registrar...");
    await page.click('a[data-tab="register"]');
    await page.waitForTimeout(1000);
    
    console.log("Esperando carga de categorías de inventario desde el backend...");
    await page.waitForFunction(() => {
        const select = document.querySelector('#exp-cat-compra');
        return select && select.options.length > 1;
    }, { timeout: 15000 });
    
    // 1. Agregar Compra de Insumo (Click on header tab)
    await page.click('#btn-tab-purchase');
    await page.selectOption('#exp-cat-compra', { index: 1 });
    await page.waitForTimeout(500);
    await page.selectOption('#exp-insumo', { index: 1 });
    await page.waitForTimeout(500);
    
    await page.fill('#exp-cantidad', '5');
    await page.fill('#exp-costo-unitario', '1200');
    await page.fill('#exp-comentarios-compra', 'Proveedor XYZ');
    
    await page.evaluate(() => document.getElementById('btn-add-expense').click());
    console.log("=> Compra de insumo agregada a la lista.");
    await page.waitForTimeout(500);
    
    // 2. Agregar Gasto Operativo (Click on header tab)
    console.log("Cambiando a Gasto Operativo...");
    await page.click('#btn-tab-expense');
    await page.waitForTimeout(500);
    
    await page.selectOption('#exp-cat-gasto', 'Servicios Públicos');
    await page.fill('#exp-descripcion', 'Recibo de Luz');
    await page.fill('#exp-valor-gasto', '85000');
    await page.fill('#exp-comentarios-gasto', 'Mes de Mayo');
    
    await page.evaluate(() => document.getElementById('btn-add-expense').click());
    console.log("=> Gasto operativo agregado a la lista.");
    await page.waitForTimeout(500);
    
    let resultDialog = "";
    page.on('dialog', async dialog => {
        resultDialog = dialog.message();
        console.log("DIALOG OPENED:", resultDialog);
        await dialog.accept();
    });
    
    console.log("Enviando transacciones al servidor de Google...");
    await page.evaluate(() => document.getElementById('btn-submit-expenses').click());
    
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
