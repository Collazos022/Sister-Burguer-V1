const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log("Clicking register tab...");
    await page.click('a[data-tab="register"]');
    await page.waitForTimeout(1000);
    
    const isVisible = await page.evaluate(() => {
        const el = document.getElementById('btn-tab-purchase');
        if (!el) return 'NOT FOUND';
        return window.getComputedStyle(el).display !== 'none' && el.offsetWidth > 0;
    });
    
    console.log("Is #btn-tab-purchase visible? ", isVisible);
    
    await browser.close();
})();
