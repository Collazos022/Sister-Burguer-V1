const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('.qty-controls')) {
    css += `\n
/* Quality Controls Styles */
.qty-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--bg-main);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--border-input);
}
.qty-controls button {
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: filter 0.2s;
}
.qty-controls button:hover {
    filter: brightness(1.2);
}
.qty-controls button i {
    width: 16px;
    height: 16px;
}
.qty-display {
    font-weight: 700;
    font-size: 0.95rem;
    min-width: 20px;
    text-align: center;
    color: var(--text-main);
}
`;
    fs.writeFileSync('style.css', css);
    console.log('style.css updated successfully!');
} else {
    console.log('style.css already has .qty-controls');
}
