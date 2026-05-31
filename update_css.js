const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const newCSS = `
/* Responsive styling for Register view */
@media (max-width: 768px) {
    #register .pos-container {
        flex-direction: column !important;
        height: auto !important;
        overflow-y: visible !important;
    }
    #register .form-scrollable {
        flex: none !important;
        height: auto !important;
        overflow: visible !important;
    }
    #register .pos-cart {
        height: auto !important;
        max-height: none !important;
    }
}
`;

if (!css.includes('Responsive styling for Register view')) {
    css += newCSS;
    fs.writeFileSync('style.css', css);
    console.log("Added mobile responsive CSS for register view");
} else {
    console.log("CSS already added");
}
