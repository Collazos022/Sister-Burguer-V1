const fs = require('fs');
let appjs = fs.readFileSync('app.js', 'utf8');

// 1. Remove modal variables and logic
appjs = appjs.replace("const modal = document.getElementById('entry-modal');\n", "");
appjs = appjs.replace("const btnOpen = document.getElementById('btn-open-form');\n", "");
appjs = appjs.replace("const btnClose = document.getElementById('btn-close-modal');\n", "");
appjs = appjs.replace("const btnCancel = document.getElementById('btn-cancel');\n", "");

appjs = appjs.replace("const toggleModal = () => modal.classList.toggle('active');\n", "");
appjs = appjs.replace("btnOpen.addEventListener('click', toggleModal);\n", "");
appjs = appjs.replace("btnClose.addEventListener('click', toggleModal);\n", "");
appjs = appjs.replace("btnCancel.addEventListener('click', toggleModal);\n", "");

// 2. Fix the toggleFormType logic (remove references to formVenta which no longer exists in the register view)
const toggleLogic = `    const toggleFormType = () => {
        if(formVenta) formVenta.style.display = 'none';
        if(formGasto) formGasto.style.display = 'none';
        if(formCompra) formCompra.style.display = 'none';

        if(formVenta) setRequired(formVenta, false);
        if(formGasto) setRequired(formGasto, false);
        if(formCompra) setRequired(formCompra, false);

        if (radioVenta && radioVenta.checked) {
            if(formVenta) {
                formVenta.style.display = 'block';
                setRequired(formVenta, true);
            }
        } else if (radioGasto && radioGasto.checked) {
            if(formGasto) {
                formGasto.style.display = 'block';
                setRequired(formGasto, true);
            }
        } else if (radioCompra && radioCompra.checked) {
            if(formCompra) {
                formCompra.style.display = 'block';
                setRequired(formCompra, true);
            }
        }
    };`;

const newToggleLogic = `    const toggleFormType = () => {
        if(formGasto) formGasto.style.display = 'none';
        if(formCompra) formCompra.style.display = 'none';

        if(formGasto) setRequired(formGasto, false);
        if(formCompra) setRequired(formCompra, false);

        if (radioGasto && radioGasto.checked) {
            if(formGasto) {
                formGasto.style.display = 'block';
                setRequired(formGasto, true);
            }
        } else if (radioCompra && radioCompra.checked) {
            if(formCompra) {
                formCompra.style.display = 'block';
                setRequired(formCompra, true);
            }
        }
    };`;

appjs = appjs.replace(toggleLogic, newToggleLogic);

// 3. Update the submit button for expenses to remove the modal toggle if it exists there
appjs = appjs.replace("document.getElementById('btn-cancel').click();", "");

fs.writeFileSync('app.js', appjs);
console.log("app.js updated for fullscreen view");
