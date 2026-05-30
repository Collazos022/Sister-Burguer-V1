const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Remove the giant padding block
const mobileScrollHack = `/* Fix for mobile scroll cutoff in POS */
@media (max-width: 768px) {
    .main-container {
        padding-bottom: 120px;
    }
    .pos-footer-box {
        margin-bottom: 80px;
    }
}`;
css = css.replace(mobileScrollHack, '');

// Update pos-cart-box
css = css.replace(
`.pos-cart-box {
    background: var(--bg-card); border-radius: 12px; padding: 15px; border: 1px solid var(--border-input);
}`,
`.pos-container { display: flex; flex-direction: column; height: 100%; max-height: calc(100vh - 140px); overflow: hidden; }
.pos-cart-box {
    background: var(--bg-card); border-radius: 12px; padding: 15px; border: 1px solid var(--border-input);
    flex: 1; overflow-y: auto; display: flex; flex-direction: column;
}`
);

css = css.replace(
`.cart-items-container {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;
}`,
`.cart-items-container {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;
    flex: 1; overflow-y: auto; padding-right: 5px;
}`
);

// Add pos-footer-box shrink prevention
if (!css.includes('.pos-footer-box { flex-shrink: 0; }')) {
    css += `\n.pos-footer-box { flex-shrink: 0; }\n`;
}

// Ensure .dashboard-view isn't letting content leak
if (!css.includes('.dashboard-view { height: 100%; }')) {
    css += `\n.dashboard-view { height: 100%; }\n`;
}

fs.writeFileSync('style.css', css);
console.log('Fixed style.css');
