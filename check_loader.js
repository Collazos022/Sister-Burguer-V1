const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', exception => console.log("PAGE ERROR:", exception));
    
    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(5000);
    
    const isHidden = await page.evaluate(() => {
        const loader = document.getElementById('global-loader');
        return loader ? loader.classList.contains('hidden') : 'not found';
    });
    
    console.log("Is loader hidden? ", isHidden);
    
    await browser.close();
})();
