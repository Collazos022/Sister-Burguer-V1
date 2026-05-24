const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

let dbData = { ventas: [], gastos: [], compras: [], inventario: [], menu: [] };
let currentPeriod = 'dia';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado exitosamente.'))
      .catch(err => console.error('Error registrando SW:', err));
  });
}

let sortState = {
    sales: { col: 'recaudado', dir: 'desc' },
    expenses: { col: 'val', dir: 'desc' },
    inventory: { col: 'stock', dir: 'asc' }
};

function sortDataArray(array, tableId) {
    const state = sortState[tableId];
    return array.sort((a, b) => {
        let valA = a[state.col];
        let valB = b[state.col];
        if (typeof valA === 'string' && typeof valB === 'string') {
            return state.dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return state.dir === 'asc' ? valA - valB : valB - valA;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const dateInput = document.getElementById('analysis-date');
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const views = document.querySelectorAll('.dashboard-view');
    const modal = document.getElementById('entry-modal');
    const entryForm = document.getElementById('entry-form');
    const btnOpen = document.getElementById('btn-open-form');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');

    const setDefaultDates = () => {
        const tStr = new Date().toISOString().split('T')[0];
        ['v-date', 'g-date', 'c-date'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = tStr;
        });
    };

    lucide.createIcons();
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            navItems.forEach(n => n.classList.toggle('active', n === item));
            views.forEach(v => v.style.display = v.id === tabId ? 'block' : 'none');
            
            const titles = {
                'dashboard': 'Resumen Financiero',
                'sales': 'Historial de Ventas',
                'expenses': 'Gastos y Compras',
                'inventory': 'Alerta de Inventario'
            };
            mainTitle.textContent = titles[tabId] || 'Panel Administrativo';
        });
    });

    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
    ['v-date', 'g-date', 'c-date'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = todayStr;
    });

    dateInput.addEventListener('change', updateDashboard);
    
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

    const toggleModal = () => modal.classList.toggle('active');

    btnOpen.addEventListener('click', toggleModal);
    btnClose.addEventListener('click', toggleModal);
    btnCancel.addEventListener('click', toggleModal);

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
    toggleFormType();
    
    const periodButtons = document.querySelectorAll('#period-filters button');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.getAttribute('data-period');
            updateDashboard();
        });
    });

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
                setDefaultDates();
                fetchData();
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

    const mainCtx = document.getElementById('mainChart').getContext('2d');
    window.mainChartInstance = new Chart(mainCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            datasets: [
                { label: 'Ventas', data: [], borderColor: '#FF0080', backgroundColor: 'rgba(255, 0, 128, 0.1)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#FF0080' },
                { label: 'Gastos', data: [], borderColor: '#FFD60A', backgroundColor: 'rgba(255, 214, 10, 0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#FFD60A' }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false } 
            }, 
            scales: { 
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                    ticks: { 
                        color: '#A0A0A0',
                        callback: function(value) {
                            if (value >= 1000000) return '$' + (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
                            if (value >= 1000) return '$' + (value / 1000).toFixed(0) + ' K';
                            return '$' + value;
                        }
                    } 
                }, 
                x: { 
                    grid: { display: false },
                    ticks: { color: '#A0A0A0' }
                } 
            } 
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    window.pieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#FF0080', '#FFD60A', '#00D1FF', '#39FF14', '#9D4EDD', '#FF9100'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    align: 'center',
                    labels: { 
                        color: '#E0E0E0', 
                        padding: 20, 
                        boxWidth: 14,
                        boxHeight: 14,
                        font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" } 
                    }
                }
            }
        }
    });

    fetchData();
});

const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const categoryColorsMap = {
    'Mobiliario': '--cat-mobiliario',
    'Arriendo': '--cat-arriendo',
    'Servicios': '--cat-servicios',
    'Nomina': '--cat-nomina',
    'Prestamos': '--cat-prestamos',
    'Marketing': '--cat-marketing',
    'Aderezos y Salsas': '--cat-aderezos',
    'Carnes y Embutidos': '--cat-carnes',
    'Frutas y Legumbres': '--cat-frutas',
    'Panaderia y Lacteos': '--cat-panaderia-lacteos',
    'Bebidas': '--cat-bebidas',
    'Heladeria': '--cat-heladeria',
    'Desechables': '--cat-desechables',
    'Otros': '--cat-otros'
};

function populateSecondaryViews(startDate, endDate) {
    const isFiltered = startDate && endDate;
    
    let salesHTML = '';
    let aggregatedSales = {};
    
    dbData.ventas.forEach(v => {
        let f = v.Fecha || v['Fecha '] || v.fecha || '';
        if(!f) return;
        
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let vDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        vDate.setHours(0,0,0,0);

        if (isFiltered) {
            if (vDate < startDate || vDate > endDate) return;
        }
        
        let plato = v['Nombre Plato Ref'] || v['Nombre Plato'] || v.Plato || v.plato || 'Venta Registrada';
        let cant = parseInt(v['Cantidad Vendida'] || v.Cantidad || v.cantidad || 1);
        let total = Number(v['Total Venta'] || v.Total || v.total || 0);

        if(!aggregatedSales[plato]) {
            aggregatedSales[plato] = { cantidad: 0, recaudado: 0 };
        }
        aggregatedSales[plato].cantidad += cant;
        aggregatedSales[plato].recaudado += total;
    });

    const salesArray = Object.keys(aggregatedSales).map(p => ({
        plato: p,
        cantidad: aggregatedSales[p].cantidad,
        recaudado: aggregatedSales[p].recaudado
    }));
    const sortedSales = sortDataArray(salesArray, 'sales');

    sortedSales.forEach(item => {
        salesHTML += `<tr>
            <td class="fw-500">${item.plato}</td>
            <td>${item.cantidad}</td>
            <td class="text-success fw-700">$${item.recaudado.toLocaleString()}</td>
        </tr>`;
    });

    document.getElementById('sales-body').innerHTML = salesHTML || '<tr><td colspan="3" class="table-empty-msg">No hay ventas para este periodo</td></tr>';

    let expHTML = '';
    let aggregatedExpenses = {};

    let unitsMap = {};
    if (dbData.inventario) {
        dbData.inventario.forEach(i => {
            let name = i['Nombre Insumo'] || i.Nombre || i.Insumo || '';
            let unit = i['Unidad de Medida'] || i.Unidad || i.unidad || 'u.';
            if (name) unitsMap[name] = unit;
        });
    }

    let processExpense = (item, isCompra) => {
        let f = item.Fecha || item.fecha || '';
        if(!f) return;
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let eDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        eDate.setHours(0,0,0,0);

        if (isFiltered) {
            if (eDate < startDate || eDate > endDate) return;
        }

        let cat = item.Categoria || item['Categoría'] || 'Otros';
        let desc = isCompra ? (item.Insumo || item['Nombre Insumo Ref'] || 'Insumo') : (item['Descripción'] || item.Descripcion || 'Gasto');
        let cant = isCompra ? parseFloat(item.Cantidad || 0) : 0;
        let unit = isCompra ? (unitsMap[desc] || item.Unidad || item['Unidad de Medida'] || 'u.') : '---';
        let val = Number(item['Costo Total'] || item.Valor || 0);

        let key = `${cat}___${desc}`;
        if (!aggregatedExpenses[key]) {
            aggregatedExpenses[key] = {
                cat: cat,
                desc: desc,
                cant: 0,
                unit: unit,
                val: 0,
                isCompra: isCompra
            };
        }
        aggregatedExpenses[key].cant += cant;
        aggregatedExpenses[key].val += val;
    };

    dbData.gastos.forEach(g => processExpense(g, false));
    dbData.compras.forEach(c => processExpense(c, true));

    const expensesArray = Object.values(aggregatedExpenses);
    const sortedExpenses = sortDataArray(expensesArray, 'expenses');

    sortedExpenses.forEach(e => {
        const catVar = categoryColorsMap[e.cat] || '--cat-otros';
        const bgColor = getVar(catVar) || '#808080';
        
        let cantDisplay = e.isCompra ? e.cant : '---';
        
        expHTML += `<tr>
            <td><span style="display: inline-block; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background-color: ${bgColor}; color: #fff;">${e.cat}</span></td>
            <td class="fw-500">${e.desc}</td>
            <td>${cantDisplay}</td>
            <td>${e.unit}</td>
            <td class="text-danger fw-700">-$${e.val.toLocaleString()}</td>
        </tr>`;
    });
    document.getElementById('expenses-body').innerHTML = expHTML || '<tr><td colspan="5" class="table-empty-msg">No hay gastos/compras para este periodo</td></tr>';

    let invArray = [];
    dbData.inventario.forEach(i => {
        let name = i['Nombre Insumo'] || i.Nombre || '';
        if(!name) return;
        
        let cat = i['Categoría'] || i.Categoria || 'Otros';
        let unit = i['Unidad Base'] || i.Unidad || 'u.';
        let stock = Number(i['Stock_Calculado'] || i['Stock Calculado'] || i.Stock || 0);
        let estadoStr = i['Estado'] || '';
        
        invArray.push({ cat, name, unit, stock, estadoStr });
    });

    const sortedInv = sortDataArray(invArray, 'inventory');

    let invHTML = '';
    sortedInv.forEach(i => {
        const catVar = categoryColorsMap[i.cat] || '--cat-otros';
        const bgColor = getVar(catVar) || '#808080';

        let statusHtml;
        if (i.estadoStr.toUpperCase() === 'SUFICIENTE' || i.stock > 0) {
            statusHtml = `<span class="badge-status status-completed">${i.estadoStr || 'Suficiente'}</span>`;
        } else {
            statusHtml = `<span class="badge-status status-danger">${i.estadoStr || 'Reabastecer'}</span>`;
        }

        invHTML += `<tr>
            <td><span style="display: inline-block; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background-color: ${bgColor}; color: #fff;">${i.cat}</span></td>
            <td class="fw-600">${i.name}</td>
            <td>${i.unit}</td>
            <td class="fw-700">${i.stock}</td>
            <td>${statusHtml}</td>
        </tr>`;
    });
    document.getElementById('inventory-body').innerHTML = invHTML || '<tr><td colspan="5" class="table-empty-msg">Sin datos de inventario</td></tr>';
}

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
                try {
                    updateDashboard();
                } catch (e) {
                    console.error("UI Update Error:", e);
                }
            } else {
                alert("Error cargando datos de la base: " + data.message);
            }
        })
        .catch(err => {
            console.error("Error fetching data:", err);
            alert("No se pudo descargar la base de datos. Verifica tu conexión a internet o el backend de Google Sheets.");
        })
        .finally(() => {
            const loader = document.getElementById('global-loader');
            if (loader) loader.classList.add('hidden');
        });
}

function updateDashboard() {
    const selectedDateStr = document.getElementById('analysis-date').value;
    if(!selectedDateStr) return;
    
    const targetDate = new Date(selectedDateStr + 'T12:00:00');
    targetDate.setHours(0,0,0,0);
    
    let startDate = new Date(targetDate);
    let endDate = new Date(targetDate);
    
    let labels = [];
    let salesChartData = [];
    let expensesChartData = [];
    let chartStartDate = new Date(startDate);
    let chartEndDate = new Date(endDate);

    let prevStartDate = new Date(startDate);
    let prevEndDate = new Date(endDate);

    if (currentPeriod === 'dia') {
        startDate = new Date(targetDate);
        endDate = new Date(targetDate);
        
        prevStartDate.setDate(startDate.getDate() - 1);
        prevEndDate.setDate(endDate.getDate() - 1);
        
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
        chartStartDate = new Date(targetDate);
        chartStartDate.setDate(diff);
        chartEndDate = new Date(chartStartDate);
        chartEndDate.setDate(chartStartDate.getDate() + 6);
        
        labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        salesChartData = Array(7).fill(0);
        expensesChartData = Array(7).fill(0);
    } else if (currentPeriod === 'semana') {
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(targetDate.setDate(diff));
        endDate = new Date(targetDate.setDate(diff + 6));
        
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(startDate.getDate() - 7);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(endDate.getDate() - 7);

        labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        salesChartData = Array(7).fill(0);
        expensesChartData = Array(7).fill(0);
        chartStartDate = new Date(startDate);
        chartEndDate = new Date(endDate);
    } else if (currentPeriod === 'mes') {
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        
        prevStartDate = new Date(startDate);
        prevStartDate.setMonth(startDate.getMonth() - 1);
        prevEndDate = new Date(endDate);
        prevEndDate.setDate(0); 

        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        salesChartData = Array(4).fill(0);
        expensesChartData = Array(4).fill(0);
        chartStartDate = new Date(startDate);
        chartEndDate = new Date(endDate);
    } else if (currentPeriod === 'año') {
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59);
        
        prevStartDate = new Date(startDate);
        prevStartDate.setFullYear(startDate.getFullYear() - 1);
        prevEndDate = new Date(endDate);
        prevEndDate.setFullYear(endDate.getFullYear() - 1);

        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        salesChartData = Array(12).fill(0);
        expensesChartData = Array(12).fill(0);
        chartStartDate = new Date(startDate);
        chartEndDate = new Date(endDate);
    }
    
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);
    prevStartDate.setHours(0,0,0,0);
    prevEndDate.setHours(23,59,59,999);
    chartStartDate.setHours(0,0,0,0);
    chartEndDate.setHours(23,59,59,999);

    let totalVentas = 0;
    let prevTotalVentas = 0;
    let totalGastos = 0;
    let prevTotalGastos = 0;
    let numVentas = 0;
    let prevNumVentas = 0;
    let platosVendidos = {};
    let expenseCategories = {};

    dbData.ventas.forEach(v => {
        let f = v.Fecha || v['Fecha '] || '';
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let vDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        vDate.setHours(0,0,0,0);
        
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
            let plato = v['Nombre Plato Ref'] || v.Plato || 'Desconocido';
            let cantidad = parseInt(v.Cantidad || v['Cantidad '] || 1);
            platosVendidos[plato] = (platosVendidos[plato] || 0) + cantidad;
        }

        if (vDate >= prevStartDate && vDate <= prevEndDate) {
            prevTotalVentas += monto;
            prevNumVentas += 1;
        }

        if (vDate >= chartStartDate && vDate <= chartEndDate) {
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

    let todosLosGastos = [...dbData.gastos, ...dbData.compras];

    todosLosGastos.forEach(g => {
        let f = g.Fecha || '';
        let parts = String(f).includes('/') ? String(f).split('/') : String(f).split('-');
        if(parts.length < 3) return;
        let gDate = String(f).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(f + 'T12:00:00');
        gDate.setHours(0,0,0,0);
        let monto = Number(g.Valor || g['Costo Total'] || 0);

        let isKPI = false;
        if (currentPeriod === 'dia') {
            isKPI = gDate.toDateString() === new Date(selectedDateStr + 'T12:00:00').toDateString();
        } else {
            isKPI = (gDate >= startDate && gDate <= endDate);
        }

        if (isKPI) {
            totalGastos += monto;
            let name = g['Descripción'] || g.Descripcion || g.Proveedor || g.Insumo || '';
            let tipo = g.Categoria || g['Categoría'] || 'Otros';
            
            expenseCategories[tipo] = (expenseCategories[tipo] || 0) + monto;
        }

        if (gDate >= prevStartDate && gDate <= prevEndDate) {
            prevTotalGastos += monto;
        }

        if (gDate >= chartStartDate && gDate <= chartEndDate) {
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

    const kpiValues = document.querySelectorAll('.kpi-card .value');
    if(kpiValues.length >= 3) {
        kpiValues[0].textContent = '$' + totalVentas.toLocaleString();
        kpiValues[1].textContent = '$' + totalGastos.toLocaleString();
        kpiValues[2].textContent = '$' + (totalVentas - totalGastos).toLocaleString();
    }

    const updateTrend = (index, current, previous) => {
        const trendEl = document.querySelectorAll('.kpi-card .trend')[index];
        const subLabelEl = document.querySelectorAll('.kpi-card .sub-label')[index];
        if(!trendEl || !subLabelEl) return;

        let diff = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
        let isUp = diff > 0;
        const isNeutral = Math.abs(diff) < 0.01;

        trendEl.className = `trend ${isUp ? (index === 1 ? 'down' : 'up') : (isNeutral ? 'neutral' : (index === 1 ? 'up' : 'down'))}`;
        
        const iconEl = trendEl.querySelector('i') || trendEl.querySelector('svg');
        if (iconEl) {
            iconEl.setAttribute('data-lucide', isUp ? 'arrow-up-right' : (isNeutral ? 'minus' : 'arrow-down-right'));
        }
        
        const spanEl = trendEl.querySelector('span');
        if (spanEl) {
            spanEl.textContent = `${Math.abs(Math.round(diff))}%`;
        }

        const periodNames = { 'dia': 'Diarios', 'semana': 'Semanales', 'mes': 'Mensuales', 'año': 'Anuales' };
        
        let label = '';
        if(index === 0) label = `Ventas ${periodNames[currentPeriod]}`;
        else if(index === 1) label = `Gastos ${periodNames[currentPeriod]}`;
        else if(index === 2) label = `Utilidad ${periodNames[currentPeriod]}`;
        else if(index === 3) label = `Ticket Promedio`;
        
        subLabelEl.textContent = label;
    };

    updateTrend(0, totalVentas, prevTotalVentas);
    updateTrend(1, totalGastos, prevTotalGastos);
    updateTrend(2, totalVentas - totalGastos, prevTotalVentas - prevTotalGastos);

    // Renderizar Top 3 Ventas
    const topVentasList = document.getElementById('top-ventas-list');
    if (topVentasList) {
        const sortedPlatos = Object.keys(platosVendidos)
            .map(plato => ({ plato, cantidad: platosVendidos[plato] }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 3);
            
        if (sortedPlatos.length === 0) {
            topVentasList.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No hay ventas</p>';
        } else {
            topVentasList.innerHTML = sortedPlatos.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-hover); padding: 0.4rem 0.6rem; border-radius: var(--radius-sm);">
                    <span style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${item.plato}</span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">${item.cantidad} u.</span>
                </div>
            `).join('');
        }
    }

    lucide.createIcons();

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

    if (window.pieChartInstance) {
        const categories = Object.keys(expenseCategories);
        const data = Object.values(expenseCategories);
        const colors = categories.map(cat => {
            const varName = categoryColorsMap[cat] || '--cat-otros';
            return getVar(varName) || '#808080';
        });
        
        const chartWrapper = document.getElementById('pieChart').parentElement;
        const noDataMsg = chartWrapper.querySelector('.no-data-msg');
        
        if (data.length === 0 || data.every(v => v === 0)) {
            if (!noDataMsg) {
                const msg = document.createElement('div');
                msg.className = 'no-data-msg';
                msg.textContent = 'Sin gastos en este periodo';
                msg.style.position = 'absolute';
                msg.style.top = '50%';
                msg.style.left = '50%';
                msg.style.transform = 'translate(-50%, -50%)';
                msg.style.color = 'var(--text-muted)';
                msg.style.fontSize = '0.9rem';
                chartWrapper.appendChild(msg);
            }
            window.pieChartInstance.data.labels = [];
            window.pieChartInstance.data.datasets[0].data = [];
        } else {
            if (noDataMsg) noDataMsg.remove();
            window.pieChartInstance.data.labels = categories;
            window.pieChartInstance.data.datasets[0].data = data;
            window.pieChartInstance.data.datasets[0].backgroundColor = colors;
        }
        window.pieChartInstance.update();
    }

    populateSecondaryViews(startDate, endDate);
}

    function setupSorting() {
        document.querySelectorAll('.sortable-header').forEach(th => {
            th.addEventListener('click', () => {
                const table = th.dataset.table;
                const col = th.dataset.sort;
                
                if (sortState[table].col === col) {
                    sortState[table].dir = sortState[table].dir === 'asc' ? 'desc' : 'asc';
                } else {
                    sortState[table].col = col;
                    sortState[table].dir = 'asc';
                }
                
                document.querySelectorAll(`.sortable-header[data-table="${table}"] .sort-icon`).forEach(icon => {
                    icon.innerHTML = '<i data-lucide="arrow-up-down"></i>';
                    icon.classList.remove('active');
                });
                const newIcon = sortState[table].dir === 'asc' ? 'arrow-up' : 'arrow-down';
                const iconSpan = th.querySelector('.sort-icon');
                iconSpan.innerHTML = `<i data-lucide="${newIcon}"></i>`;
                iconSpan.classList.add('active');
                lucide.createIcons();
                
                const activeBtn = document.querySelector('.period-selector .active');
                updateDashboard(activeBtn ? activeBtn.dataset.period : 'mes');
            });
        });
    }

    setupSorting();
