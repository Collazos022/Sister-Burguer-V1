const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', exception => console.log("PAGE ERROR:", exception));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for fetch to complete
    await page.waitForTimeout(5000);
    
    const dbData = await page.evaluate(() => window.dbData);
    console.log("dbData keys:", Object.keys(dbData));
    console.log("inventario length:", dbData.inventario ? dbData.inventario.length : 'undefined');
    
    const options = await page.evaluate(() => {
        const select = document.getElementById('exp-cat-compra');
        return select ? select.innerHTML : 'Not found';
    });
    console.log("Select options HTML:", options);

    await browser.close();
})();
