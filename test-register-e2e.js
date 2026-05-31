const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('dialog', async dialog => {
        console.log("ALERT:", dialog.message());
        await dialog.accept();
    });

    try {
        console.log("Navegando a localhost:3000...");
        await page.goto('http://localhost:3000');
        
        await page.evaluate(() => {
            document.querySelectorAll('.dashboard-view').forEach(v => v.style.display = 'none');
            const reg = document.getElementById('register');
            if(reg) reg.style.display = 'block';
        });
        
        console.log("Navegando a la vista Registrar...");
        
        await page.waitForSelector('#exp-cat-compra', { state: 'attached' });
        
        await page.fill('#global-fecha', '2026-05-30');
        
        await page.evaluate(() => {
            document.getElementById('btn-tab-purchase').click();
        });
        
        await page.waitForTimeout(500);
        
        await page.evaluate(() => {
            const selectCat = document.getElementById('exp-cat-compra');
            selectCat.innerHTML = '<option value="Carnes">Carnes</option>';
            const selectIns = document.getElementById('exp-insumo');
            selectIns.innerHTML = '<option value="Carne Res 150g">Carne Res 150g</option>';
            document.getElementById('exp-unidades').value = 'kg';
        });

        await page.selectOption('#exp-cat-compra', 'Carnes');
        await page.selectOption('#exp-insumo', 'Carne Res 150g');
        await page.fill('#exp-cantidad', '10');
        await page.fill('#exp-costo-unitario', '15000');
        
        await page.evaluate(() => {
            document.getElementById('exp-costo-total').value = 150000;
        });

        await page.click('#btn-add-expense');
        console.log("=> Intentó agregar compra");
        
        await page.evaluate(() => {
            document.getElementById('btn-tab-expense').click();
        });
        await page.waitForTimeout(500);

        await page.selectOption('#exp-cat-gasto', 'Servicios Públicos');
        await page.fill('#exp-descripcion', 'Pago de Luz Mayo');
        await page.fill('#exp-valor-gasto', '125000');
        
        await page.click('#btn-add-expense');
        console.log("=> Intentó agregar gasto");

        await page.selectOption('#global-pago', 'Transferencia');
        await page.fill('#global-comentario', 'Gastos semanales');
        
        await page.route('**/*', async route => {
            if (route.request().url().includes('script.google.com')) {
                const postData = route.request().postData();
                console.log("POST PAYLOAD:", postData);
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: 'success' })
                });
            } else {
                await route.continue();
            }
        });
        
        await page.click('#btn-submit-expenses');
        await page.waitForTimeout(1000);
        console.log("SUCCESS");

    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
