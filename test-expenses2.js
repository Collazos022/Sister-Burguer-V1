const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', exception => console.log("PAGE ERROR:", exception));
    
    let fetchFinished = false;
    page.on('dialog', async dialog => {
        console.log("DIALOG OPENED:", dialog.message());
        fetchFinished = true;
        await dialog.accept();
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.click('.nav-item[data-tab="expenses"]');
    
    // Switch to Gasto Operativo
    await page.click('#btn-type-expense');
    await page.fill('#exp-descripcion', 'Gasto de prueba');
    await page.fill('#exp-valor-gasto', '50000');
    
    await page.click('#btn-add-expense');
    
    const btnSubmit = await page.$('#btn-submit-expenses');
    await btnSubmit.click();
    
    console.log("Waiting for fetch to finish...");
    // Wait until fetchFinished is true or timeout after 15s
    for(let i=0; i<15; i++) {
        if(fetchFinished) break;
        await page.waitForTimeout(1000);
    }

    await browser.close();
})();
