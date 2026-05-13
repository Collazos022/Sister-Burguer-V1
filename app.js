// Sister Burguer - Admin Dashboard Logic
const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

let dbData = { ventas: [], gastos: [], compras: [], inventario: [], menu: [] };
let currentPeriod = 'semana';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Sidebar Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.dashboard-view');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.style.display = 'none');
            
            item.classList.add('active');
            const targetView = document.getElementById(item.getAttribute('data-tab'));
            if(targetView) targetView.style.display = 'block';
        });
    });

    // Helper to set default form dates
    const setDefaultDates = () => {
        const tStr = new Date().toISOString().split('T')[0];
        document.getElementById('v-date').value = tStr;
        document.getElementById('g-date').value = tStr;
        document.getElementById('c-date').value = tStr;
    };

    // Init Date Picker to Today
    const dateInput = document.getElementById('analysis-date');
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;

    // Default dates in forms to today
    setDefaultDates();

    // Listen to changes
    dateInput.addEventListener('change', updateDashboard);

    // Date Navigation Arrows
    document.getElementById('btn-prev-date').addEventListener('click', () => {
        let d = new Date(dateInput.value + 'T12:00:00');
        if (currentPeriod === 'dia') d.setDate(d.getDate() - 1);
        else if (currentPeriod === 'semana') d.setDate(d.getDate() - 7);
        else if (currentPeriod === 'mes') d.setMonth(d.getMonth() - 1);
        else if (currentPeriod === 'año') d.setFullYear(d.getFullYear() - 1);
        dateInput.value = d.toISOString().split('T')[0];
        updateDashboard();
    });

    document.getElementById('btn-next-date').addEventListener('click', () => {
        let d = new Date(dateInput.value + 'T12:00:00');
        if (currentPeriod === 'dia') d.setDate(d.getDate() + 1);
        else if (currentPeriod === 'semana') d.setDate(d.getDate() + 7);
        else if (currentPeriod === 'mes') d.setMonth(d.getMonth() + 1);
        else if (currentPeriod === 'año') d.setFullYear(d.getFullYear() + 1);
        dateInput.value = d.toISOString().split('T')[0];
        updateDashboard();
    });

    // Modal Logic
    const modal = document.getElementById('entry-modal');
    const btnOpen = document.getElementById('btn-open-form');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const entryForm = document.getElementById('entry-form');

    const toggleModal = () => modal.classList.toggle('active');

    btnOpen.addEventListener('click', toggleModal);
    btnClose.addEventListener('click', toggleModal);

    // Form Toggling
    const radioVenta = document.querySelector('input[value="sale"]');
    const radioGasto = document.querySelector('input[value="expense"]');
    const radioCompra = document.querySelector('input[value="purchase"]');
    const formVenta = document.getElementById('form-venta');
    const formGasto = document.getElementById('form-gasto');
    const formCompra = document.getElementById('form-compra');

    const toggleFormType = () => {
        formVenta.style.display = 'none';
        formGasto.style.display = 'none';
        formCompra.style.display = 'none';
        setRequired(formVenta, false);
        setRequired(formGasto, false);
        setRequired(formCompra, false);

        if (radioVenta.checked) {
            formVenta.style.display = 'block';
            setRequired(formVenta, true);
        } else if (radioGasto.checked) {
            formGasto.style.display = 'block';
            setRequired(formGasto, true);
        } else if (radioCompra.checked) {
            formCompra.style.display = 'block';
            setRequired(formCompra, true);
        }
    };

    function setRequired(formSection, isRequired) {
        const inputs = formSection.querySelectorAll('input, select');
        inputs.forEach(input => input.required = isRequired);
    }

    radioVenta.addEventListener('change', toggleFormType);
    radioGasto.addEventListener('change', toggleFormType);
    radioCompra.addEventListener('change', toggleFormType);
    toggleFormType(); // Init

    // Period Filters
    const periodButtons = document.querySelectorAll('#period-filters button');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.getAttribute('data-period');
            updateDashboard();
        });
    });

    // Form Submission
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let payload = {};

        if (radioVenta.checked) {
            payload = {
                type: 'sale',
                fecha: document.getElementById('v-date').value,
                plato: document.getElementById('v-plato').value,
                cantidad: document.getElementById('v-cantidad').value,
                pago: document.getElementById('v-pago').value,
                domicilio: document.getElementById('v-domicilio').value,
                total: document.getElementById('v-total').value
            };
        } else if (radioGasto.checked) {
            payload = {
                type: 'expense',
                fecha: document.getElementById('g-date').value,
                categoria: document.getElementById('g-categoria').value,
                descripcion: document.getElementById('g-desc').value,
                valor: document.getElementById('g-valor').value,
                pago: document.getElementById('g-pago').value
            };
        } else if (radioCompra.checked) {
            payload = {
                type: 'purchase',
                fecha: document.getElementById('c-date').value,
                proveedor: document.getElementById('c-proveedor').value,
                insumo: document.getElementById('c-insumo').value,
                cantidad: document.getElementById('c-cantidad').value,
                valor: document.getElementById('c-valor').value
            };
        }

        const btnSubmit = entryForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = 'Guardando...';
        btnSubmit.disabled = true;

        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success'){
                alert('Registro guardado. Actualizando tablero...');
                toggleModal();
                entryForm.reset();
                setDefaultDates(); // Restore default dates after reset
                fetchData(); // Reload data
            } else {
                alert('Hubo un error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión.');
        })
        .finally(() => {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        });
    });

    // Main Sales/Expenses Chart Init
    const mainCtx = document.getElementById('mainChart').getContext('2d');
    window.mainChartInstance = new Chart(mainCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            datasets: [
                { label: 'Ventas', data: [], borderColor: '#E63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#E63946' },
                { label: 'Gastos', data: [], borderColor: '#1D3557', backgroundColor: 'rgba(29, 53, 87, 0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { callback: value => '$' + value.toLocaleString() } }, x: { grid: { display: false } } } }
    });

    // Load Data
    fetchData();
});

// Fetch Real Data
function fetchData() {
    document.querySelectorAll('.kpi-card .value').forEach(el => el.textContent = "Cargando...");
    
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                dbData.ventas = data.ventas || [];
                dbData.gastos = data.gastos || [];
                dbData.compras = data.compras || [];
                dbData.inventario = data.inventario || [];
                dbData.menu = data.menu || [];
                
                populateMenu();
                populateSecondaryViews();
                updateDashboard();
            } else {
                alert("Error cargando datos de la base: " + data.message);
            }
        })
        .catch(err => {
            console.error("Error fetching data:", err);
            alert("No se pudo descargar la base real. Mostrando datos locales de simulación.");
        });
}

// Populate Menu Select and auto-calculate total
function populateMenu() {
    const select = document.getElementById('v-plato');
    select.innerHTML = '<option value="">-- Selecciona un plato --</option>';
    
    dbData.menu.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.nombre;
        opt.textContent = `${item.nombre} ($${Number(item.precio).toLocaleString()})`;
        opt.dataset.precio = item.precio;
        select.appendChild(opt);
    });
    
    const vCantidad = document.getElementById('v-cantidad');
    const vDomicilio = document.getElementById('v-domicilio');
    const vTotal = document.getElementById('v-total');
    
    const recalcTotal = () => {
        const selectedOpt = select.options[select.selectedIndex];
        if (!selectedOpt || !selectedOpt.dataset.precio) return;
        
        const precio = Number(selectedOpt.dataset.precio);
        const qty = Number(vCantidad.value) || 1;
        const dom = vDomicilio.value === 'SI' ? 1000 : 0;
        
        vTotal.value = (precio * qty) + dom;
    };
    
    select.addEventListener('change', recalcTotal);
    vCantidad.addEventListener('input', recalcTotal);
    vDomicilio.addEventListener('change', recalcTotal);
}

// Populate History Tables (Ventas, Gastos, Inventario tabs)
function populateSecondaryViews() {
    // Ventas Completas
    let salesHTML = '';
    dbData.ventas.slice().reverse().forEach(v => {
        let f = v.Fecha || v['Fecha '] || v.fecha || '';
        let dateStr = f;
        if(f) {
            let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
            if(parts.length >= 3) {
                let vDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
                dateStr = vDate.toLocaleDateString();
            }
        }
        
        let plato = v['Nombre Plato Ref'] || v['Nombre Plato'] || v.Plato || v.plato || 'Venta Registrada';
        let cant = v['Cantidad Vendida'] || v.Cantidad || v.cantidad || 1;
        let metodo = v['Método Pago'] || v.Pago || v.pago || 'Efectivo';
        let dom = v.Domicilio || v.domicilio || 'NO';
        let total = Number(v['Total Venta'] || v.Total || v.total || 0);

        salesHTML += `<tr>
            <td>${dateStr}</td>
            <td style="font-weight: 500">${plato}</td>
            <td>${cant}</td>
            <td>${metodo}</td>
            <td>${dom}</td>
            <td style="color: #2A9D8F; font-weight: 600;">$${total.toLocaleString()}</td>
        </tr>`;
    });
    document.getElementById('sales-body').innerHTML = salesHTML || '<tr><td colspan="6" style="text-align:center;">No hay ventas registradas</td></tr>';

    // Gastos y Compras
    let expHTML = '';
    // Unificar gastos y compras
    let unifiedExpenses = [];
    dbData.gastos.forEach(g => unifiedExpenses.push({
        tipo: 'Gasto Operativo', fecha: g.Fecha || '', cat: g['Categoría'] || g.Categoria || '', desc: g['Descripción'] || g.Descripcion || '', val: g.Valor || 0
    }));
    dbData.compras.forEach(c => unifiedExpenses.push({
        tipo: 'Compra Insumo', fecha: c.Fecha || '', cat: c.Insumo || '', desc: c.Proveedor || '', val: c['Valor Total'] || c.Valor || 0
    }));
    // Ordenar por fecha descendente (muy básico)
    unifiedExpenses.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    unifiedExpenses.forEach(e => {
        expHTML += `<tr>
            <td><span class="badge-status" style="background: ${e.tipo === 'Gasto Operativo' ? '#f0f4f8' : '#e6f4ea'}; color: ${e.tipo === 'Gasto Operativo' ? '#1D3557' : '#2A9D8F'}">${e.tipo}</span></td>
            <td>${e.fecha}</td>
            <td>${e.cat}</td>
            <td>${e.desc}</td>
            <td style="color: #E76F51; font-weight: 600;">$${Number(e.val).toLocaleString()}</td>
        </tr>`;
    });
    document.getElementById('expenses-body').innerHTML = expHTML || '<tr><td colspan="5" style="text-align:center;">No hay gastos/compras</td></tr>';

    // Inventario
    let invHTML = '';
    dbData.inventario.forEach(i => {
        let name = i['Nombre Insumo'] || i.Nombre || '';
        if(!name) return;
        let stock = Number(i['Stock Calculado'] || i.Stock || 0);
        let status = stock > 0 ? '<span class="badge-status status-completed">Suficiente</span>' : '<span class="badge-status" style="background:#fee2e2;color:#991b1b">Reabastecer</span>';
        invHTML += `<tr>
            <td>${i['ID_Insumo'] || i.ID || ''}</td>
            <td style="font-weight: 600">${name}</td>
            <td>${i['Inventario Inicial'] || 0}</td>
            <td>${i['Cantidad Comprada'] || 0}</td>
            <td>${i['Disponible para Uso'] || 0}</td>
            <td style="font-weight: 700">${stock}</td>
            <td>${status}</td>
        </tr>`;
    });
    document.getElementById('inventory-body').innerHTML = invHTML || '<tr><td colspan="7" style="text-align:center;">Sin datos de inventario</td></tr>';
}

// Logic to filter and process data for Dashboard
function updateDashboard() {
    const selectedDateStr = document.getElementById('analysis-date').value;
    if(!selectedDateStr) return;
    
    const targetDate = new Date(selectedDateStr + 'T12:00:00');
    
    let startDate = new Date(targetDate);
    let endDate = new Date(targetDate);
    
    let labels = [];
    let salesChartData = [];
    let expensesChartData = [];

    if (currentPeriod === 'dia') {
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(targetDate.setDate(diff));
        endDate = new Date(targetDate.setDate(diff + 6));
        labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        salesChartData = Array(7).fill(0);
        expensesChartData = Array(7).fill(0);
    } else if (currentPeriod === 'semana') {
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(targetDate.setDate(diff));
        endDate = new Date(targetDate.setDate(diff + 6));
        labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        salesChartData = Array(7).fill(0);
        expensesChartData = Array(7).fill(0);
    } else if (currentPeriod === 'mes') {
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        salesChartData = Array(4).fill(0);
        expensesChartData = Array(4).fill(0);
    } else if (currentPeriod === 'año') {
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59);
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        salesChartData = Array(12).fill(0);
        expensesChartData = Array(12).fill(0);
    }

    let totalVentas = 0;
    let totalGastos = 0;
    let numVentas = 0;
    let txTableHTML = '';

    // Agrupar Ventas
    dbData.ventas.forEach(v => {
        let f = v.Fecha || v['Fecha '] || '';
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let vDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        
        let monto = Number(v['Total Venta'] || v.Total || 0);
        
        let isKPI = false;
        if (currentPeriod === 'dia') {
            isKPI = vDate.toDateString() === new Date(selectedDateStr + 'T12:00:00').toDateString();
        } else {
            isKPI = (vDate >= startDate && vDate <= endDate);
        }

        if (isKPI) {
            totalVentas += monto;
            numVentas += 1;
            txTableHTML += `<tr><td>${vDate.toLocaleDateString()}</td><td style="font-weight: 500">${v['Nombre Plato Ref'] || v.Plato || ''}</td><td><span class="dot" style="background: #E63946"></span> Venta</td><td style="color: #2A9D8F; font-weight: 700">+$${monto.toLocaleString()}</td><td><span class="badge-status status-completed">Completado</span></td></tr>`;
        }

        if (vDate >= startDate && vDate <= endDate) {
            if (currentPeriod === 'mes') {
                let weekIdx = Math.floor((vDate.getDate() - 1) / 7);
                if(weekIdx > 3) weekIdx = 3;
                salesChartData[weekIdx] += monto;
            } else if (currentPeriod === 'año') {
                salesChartData[vDate.getMonth()] += monto;
            } else {
                let dayIdx = vDate.getDay() - 1;
                if(dayIdx < 0) dayIdx = 6;
                salesChartData[dayIdx] += monto;
            }
        }
    });

    // Unificar gastos y compras para la gráfica y KPIs
    let todosLosGastos = [...dbData.gastos, ...dbData.compras];

    todosLosGastos.forEach(g => {
        let f = g.Fecha || '';
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let gDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        let monto = Number(g.Valor || g['Valor Total'] || 0);

        let isKPI = false;
        if (currentPeriod === 'dia') {
            isKPI = gDate.toDateString() === new Date(selectedDateStr + 'T12:00:00').toDateString();
        } else {
            isKPI = (gDate >= startDate && gDate <= endDate);
        }

        if (isKPI) {
            totalGastos += monto;
            let name = g['Descripción'] || g.Descripcion || g.Proveedor || g.Insumo || '';
            let tipo = g.Categoria || g['Categoría'] || 'Compra Insumo';
            txTableHTML += `<tr><td>${gDate.toLocaleDateString()}</td><td style="font-weight: 500">${name}</td><td><span class="dot" style="background: #1D3557"></span> ${tipo}</td><td style="color: #E76F51; font-weight: 700">-$${monto.toLocaleString()}</td><td><span class="badge-status status-completed">Completado</span></td></tr>`;
        }

        if (gDate >= startDate && gDate <= endDate) {
            if (currentPeriod === 'mes') {
                let weekIdx = Math.floor((gDate.getDate() - 1) / 7);
                if(weekIdx > 3) weekIdx = 3;
                expensesChartData[weekIdx] += monto;
            } else if (currentPeriod === 'año') {
                expensesChartData[gDate.getMonth()] += monto;
            } else {
                let dayIdx = gDate.getDay() - 1;
                if(dayIdx < 0) dayIdx = 6;
                expensesChartData[dayIdx] += monto;
            }
        }
    });

    // Actualizar UI
    const kpiValues = document.querySelectorAll('.kpi-card .value');
    if(kpiValues.length >= 4) {
        kpiValues[0].textContent = '$' + totalVentas.toLocaleString();
        kpiValues[1].textContent = '$' + totalGastos.toLocaleString();
        kpiValues[2].textContent = '$' + (totalVentas - totalGastos).toLocaleString();
        kpiValues[3].textContent = numVentas > 0 ? '$' + Math.round(totalVentas / numVentas).toLocaleString() : '$0';
    }

    document.getElementById('transactions-body').innerHTML = txTableHTML || '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay registros para este periodo.</td></tr>';

    // Actualizar Chart
    if (window.mainChartInstance) {
        window.mainChartInstance.data.labels = labels;
        window.mainChartInstance.data.datasets[0].data = salesChartData;
        window.mainChartInstance.data.datasets[1].data = Array(labels.length).fill(0);
        window.mainChartInstance.update();

        setTimeout(() => {
            window.mainChartInstance.data.datasets[1].data = expensesChartData;
            window.mainChartInstance.update();
        }, 100);
    }
}
