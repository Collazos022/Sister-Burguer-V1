const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

const correctLogic = `
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            navItems.forEach(n => n.classList.toggle('active', n === item));
            views.forEach(v => {
                if (v.id === tabId) {
                    v.style.display = (tabId === 'register') ? 'flex' : 'block';
                } else {
                    v.style.display = 'none';
                }
            });
            
            const periodFilters = document.getElementById('period-filters');
            const dateControls = document.querySelector('.date-controls');
            const posOrderWrapper = document.getElementById('pos-order-wrapper');
            const registerWrapper = document.getElementById('register-type-wrapper');
            
            if (tabId === 'pos' || tabId === 'cocina' || tabId === 'register') {
                if(periodFilters) periodFilters.style.display = 'none';
                if(dateControls) dateControls.style.display = 'none';
                
                if (tabId === 'pos') {
                    if(posOrderWrapper) posOrderWrapper.style.display = 'flex';
                    if(registerWrapper) registerWrapper.style.display = 'none';
                } else if (tabId === 'register') {
                    if(posOrderWrapper) posOrderWrapper.style.display = 'none';
                    if(registerWrapper) registerWrapper.style.display = 'flex';
                } else {
                    if(posOrderWrapper) posOrderWrapper.style.display = 'none';
                    if(registerWrapper) registerWrapper.style.display = 'none';
                }
            } else {
                if(periodFilters) periodFilters.style.display = 'flex';
                if(dateControls) dateControls.style.display = 'flex';
                if(posOrderWrapper) posOrderWrapper.style.display = 'none';
                if(registerWrapper) registerWrapper.style.display = 'none';
            }
`;

// Replace from `navItems.forEach` to the curly brace before `const titles = {`
const regex = /navItems\.forEach\(item => \{[\s\S]*?\}\s*(?=const titles = \{)/;
appjs = appjs.replace(regex, correctLogic);

fs.writeFileSync('app.js', appjs);
console.log("Fixed tab switching logic in app.js");
