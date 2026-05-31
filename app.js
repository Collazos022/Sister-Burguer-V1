const API_URL = 'https://script.google.com/macros/s/AKfycbxH1PK-Tfy-Zon2OluMTCnhPs5XORiGN32nxbmm4UQ8JR_DHIbXln8vr6CGGxaZGKxKAw/exec';

let dbData = { ventas: [], gastos: [], compras: [], inventario: [], menu: [] };
let currentPeriod = 'dia';
let expenseCart = [];

const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatToLocalSheetsDate = (isoDate) => {
    if (!isoDate) return isoDate;
    let dStr = String(isoDate);
    if (dStr.includes('T')) dStr = dStr.split('T')[0];
    if (!dStr.includes('-')) return dStr;
    const parts = dStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
};

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
        const entryForm = document.getElementById('entry-form');
                const setDefaultDates = () => {
        const tStr = getLocalDateStr();
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
            views.forEach(v => {
                if (v.id === tabId) {
                    v.style.display = 'block';
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
                
                if (tabId === 'pos' || tabId === 'cocina') {
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
            const titles = {
                'dashboard': 'Resumen Financiero',
                'sales': 'Historial de Ventas',
                'expenses': 'Gastos y Compras',
                'inventory': 'Alerta de Inventario',
                'pos': 'Punto de Venta',
                'cocina': 'Cocina',
                'register': 'Registro de Gastos'
            };
            mainTitle.textContent = titles[tabId] || 'Registro de Gastos';
        });
    });

    const todayStr = getLocalDateStr();
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
        dateInput.value = getLocalDateStr(d);
        updateDashboard();
    });

    document.getElementById('btn-next-date').addEventListener('click', () => {
        let d = new Date(dateInput.value + 'T12:00:00');
        if (currentPeriod === 'dia') d.setDate(d.getDate() + 1);
        else if (currentPeriod === 'semana') d.setDate(d.getDate() + 7);
        else if (currentPeriod === 'mes') d.setMonth(d.getMonth() + 1);
        else if (currentPeriod === 'año') d.setFullYear(d.getFullYear() + 1);
        dateInput.value = getLocalDateStr(d);
        updateDashboard();
    });

                    const radioVenta = document.querySelector('input[value="sale"]');
    const radioGasto = document.querySelector('input[value="expense"]');
    const radioCompra = document.querySelector('input[value="purchase"]');
    const formVenta = document.getElementById('form-venta');
    const formGasto = document.getElementById('form-gasto');
    const formCompra = document.getElementById('form-compra');

    const globalFechaInput = document.getElementById('global-fecha');
    if (globalFechaInput && !globalFechaInput.value) {
        const today = getLocalDateStr();
        globalFechaInput.value = today;
    }
    const toggleFormType = () => {
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
    };

    function setRequired(formSection, isRequired) {
        const inputs = formSection.querySelectorAll('input, select');
        inputs.forEach(input => input.required = isRequired);
    }

    if(radioVenta) if(radioVenta) radioVenta.addEventListener('change', toggleFormType);
    if(radioGasto) if(radioGasto) radioGasto.addEventListener('change', toggleFormType);
    if(radioCompra) if(radioCompra) radioCompra.addEventListener('change', toggleFormType);
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
        
        let item = {};
        
        if (radioVenta && radioVenta.checked) {
            return;
        } else if (radioGasto && radioGasto.checked) {
            const cat = document.getElementById('exp-cat-gasto').value;
            const desc = document.getElementById('exp-descripcion').value;
            const valor = parseFloat(document.getElementById('exp-valor-gasto').value);
            
            if(!cat || !desc || isNaN(valor)) {
                alert("Completa todos los campos obligatorios del gasto.");
                return;
            }

            item = {
                type: 'expense',
                categoria: cat,
                descripcion: desc,
                valor: valor
            };
        } else if (radioCompra && radioCompra.checked) {
            const cat = document.getElementById('exp-cat-compra').value;
            const insumo = document.getElementById('exp-insumo').value;
            const unidad = document.getElementById('exp-unidades').value;
            const cantidad = parseFloat(document.getElementById('exp-cantidad').value);
            const costoUnit = parseFloat(document.getElementById('exp-costo-unitario').value);
            const costoTotal = parseFloat(document.getElementById('exp-costo-total').value);

            if(!cat || !insumo || isNaN(cantidad) || isNaN(costoTotal)) {
                alert("Completa todos los campos obligatorios de la compra.");
                return;
            }

            item = {
                type: 'purchase',
                categoria: cat,
                insumo: insumo,
                unidad: unidad,
                cantidad: cantidad,
                costoUnit: costoUnit,
                costoTotal: costoTotal
            };
        }
        
        expenseCart.push(item);
        
        // Limpiar form
        if (radioGasto && radioGasto.checked) {
            document.getElementById('exp-descripcion').value = '';
            document.getElementById('exp-valor-gasto').value = '';
        } else {
            document.getElementById('exp-cantidad').value = '';
            document.getElementById('exp-costo-unitario').value = '';
            document.getElementById('exp-costo-total').value = '';
        }
        
        renderExpenseCart();
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
            <td><span class="table-cat-badge" style="background-color: ${bgColor};">${e.cat}</span></td>
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
            <td><span class="table-cat-badge" style="background-color: ${bgColor};">${i.cat}</span></td>
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
    if (!select) return; // Sale form was removed
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
                dbData.flujo = data.flujo || [];
                
                if (data.pedidos && Array.isArray(data.pedidos)) {
                    pedidosActivos = data.pedidos
                        .filter(p => !p.Estado || p.Estado !== 'entregado')
                        .map(p => ({
                            id: Number(p.ID_Pedido || p["ID Pedido"] || Object.values(p)[1]),
                            destino: p.Destino || '',
                            cliente: p.Cliente || p["Nombre Cliente"] || '',
                            items: p.Detalle_JSON ? JSON.parse(p.Detalle_JSON) : [],
                            estado: p.Estado || 'pendiente',
                            fecha: p.Fecha || p['Fecha '] || getLocalDateStr(),
                            pago: p.Pago || 'Efectivo'
                        }));
                    savePedidos();
                    if(typeof renderKDS === 'function') renderKDS();
                    if(typeof renderOrderBar === 'function') renderOrderBar();
                }
                
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
            
            let isBebida = false;
            if (dbData.menu) {
                let menuItem = dbData.menu.find(m => m.nombre === plato);
                if(menuItem && menuItem.categoria && String(menuItem.categoria).trim().toLowerCase().includes('bebida')) {
                    isBebida = true;
                }
            }
            if(!isBebida) {
                platosVendidos[plato] = (platosVendidos[plato] || 0) + cantidad;
            }
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
        kpiValues[0].textContent = '$' + Math.round(totalVentas).toLocaleString('es-CO');
        kpiValues[1].textContent = '$' + Math.round(totalGastos).toLocaleString('es-CO');
        kpiValues[2].textContent = '$' + Math.round(totalVentas - totalGastos).toLocaleString('es-CO');
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
            topVentasList.innerHTML = '<p class="empty-text-state">No hay ventas</p>';
        } else {
            topVentasList.innerHTML = sortedPlatos.map(item => `
                <div class="top-sale-item">
                    <span class="top-sale-name">${item.plato}</span>
                    <span class="top-sale-qty">${item.cantidad} u.</span>
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

    const saldoEfectivoEl = document.getElementById('dash-saldo-efectivo');
    const saldoNequiEl = document.getElementById('dash-saldo-nequi');
    if(saldoEfectivoEl && saldoNequiEl && dbData.flujo) {
        let saldoEfe = 0;
        let saldoNeq = 0;
        const targetDateString = new Date(selectedDateStr + 'T12:00:00').toDateString();
        
        const rowFlujo = dbData.flujo.find(r => {
            let rf = r.Fecha || r['Fecha '] || '';
            if(!rf) return false;
            let parts = String(rf).includes('/') ? String(rf).split('/') : String(rf).split('-');
            if(parts.length < 3) return false;
            let rDate = String(rf).includes('/') ? new Date(parts[2], parts[1]-1, parts[0]) : new Date(rf + 'T12:00:00');
            return rDate.toDateString() === targetDateString;
        });

        if(rowFlujo) {
            saldoEfe = Number(rowFlujo['Efectivo Caja'] || 0);
            saldoNeq = Number(rowFlujo['Digital Nequi'] || 0);
        }

        if (saldoEfectivoEl && saldoNequiEl) {
            saldoEfectivoEl.textContent = '$' + Math.round(saldoEfe).toLocaleString('es-CO');
            saldoNequiEl.textContent = '$' + Math.round(saldoNeq).toLocaleString('es-CO');
        }
    }

    populateSecondaryViews(startDate, endDate);
    populateExpenseDropdowns();
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

// --- ROL Y VISTAS ---
document.addEventListener('DOMContentLoaded', () => {
    const roleSelector = document.getElementById('role-selector');
    const navItems = document.querySelectorAll('.nav-item');
    
    function updateRoles() {
        const role = roleSelector.value;
        let firstVisibleTab = null;
        
        const profileIcon = document.getElementById('profile-icon');
        if (profileIcon) {
            if (role === 'admin') profileIcon.style.color = 'var(--primary)';
            else if (role === 'servicio') profileIcon.style.color = 'var(--accent)';
            else if (role === 'cocina') profileIcon.style.color = 'var(--success)';
        }
        
        navItems.forEach(item => {
            const roles = item.getAttribute('data-roles');
            if (roles && !roles.split(',').includes(role)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
                if (!firstVisibleTab && item.getAttribute('data-tab')) {
                    firstVisibleTab = item;
                }
            }
        });
        
        const currentActive = document.querySelector('.nav-item.active');
        if (currentActive && currentActive.style.display === 'none' && firstVisibleTab) {
            firstVisibleTab.click();
        } else if (!currentActive && firstVisibleTab) {
            firstVisibleTab.click();
        }
    }
    
    if(roleSelector) {
        roleSelector.addEventListener('change', updateRoles);
        updateRoles();
    }
});

let posCart = [];
let pedidosActivos = JSON.parse(localStorage.getItem('pedidosActivos')) || [];
let posActiveOrderId = null; // Track if we are editing an existing order

function savePedidos() {
    localStorage.setItem('pedidosActivos', JSON.stringify(pedidosActivos));
    renderKDS();
    renderOrderBar();
}

function renderOrderBar() {
    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();
    const bar = document.getElementById('pos-order-bar');
    if (!bar) return;
    
    const currentScroll = bar.scrollLeft;
    
    const pendientes = pedidosActivos.filter(p => p.estado !== 'entregado');
    if (pendientes.length === 0) {
        bar.innerHTML = '<span class="empty-text-state">Sin órdenes activas</span>';
        updateOrderScrollArrows();
        return;
    }
    
    let html = '';
    pendientes.forEach(pedido => {
        let className = 'order-pill';
        if (pedido.estado === 'preparado') className += ' preparado';
        else className += ' pendiente';
        
        if (pedido.id === posActiveOrderId) className += ' selected-pill';
        
        html += `
            <div class="${className}" data-id="${pedido.id}">
                ${pedido.destino} ${pedido.cliente ? '- ' + pedido.cliente : ''}
                ${pedido.estado === 'preparado' ? '<i data-lucide="check-circle" class="icon-small"></i>' : ''}
            </div>
        `;
    });
    bar.innerHTML = html;
    bar.scrollLeft = currentScroll;
    
    lucide.createIcons();
    
    // Add click listeners to load order into POS
    bar.querySelectorAll('.order-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.getAttribute('data-id'));
            const activeTab = document.querySelector('.nav-item.active');
            if (activeTab && activeTab.getAttribute('data-tab') === 'cocina') {
                const btnPreparar = document.querySelector(`.kds-btn-preparar[data-id="${id}"]`);
                if (btnPreparar) {
                    const ticketDiv = btnPreparar.closest('.kds-ticket');
                    if (ticketDiv) {
                        const scrollContainer = document.querySelector('.content-scroll');
                        if (scrollContainer) {
                            scrollContainer.scrollTo({ top: ticketDiv.offsetTop - 120, behavior: 'smooth' });
                        }
                        const originalBorder = ticketDiv.style.border;
                        ticketDiv.style.border = '2px solid var(--primary)';
                        setTimeout(() => ticketDiv.style.border = originalBorder, 2000);
                    }
                }
                
                // Auto-scroll the bar itself
                bar.querySelectorAll('.order-pill').forEach(p => p.classList.remove('selected-pill', 'active'));
                e.currentTarget.classList.add('selected-pill', 'active');
                const scrollLeft = e.currentTarget.offsetLeft - (bar.clientWidth / 2) + (e.currentTarget.clientWidth / 2);
                bar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                return;
            }
            loadOrderIntoPOS(id);
        });
    });
    
    updateOrderScrollArrows();
}

function updateOrderScrollArrows() {
    const bar = document.getElementById('pos-order-bar');
    const leftArrow = document.getElementById('scroll-left');
    const rightArrow = document.getElementById('scroll-right');
    if(!bar || !leftArrow || !rightArrow) return;
    
    if (bar.scrollWidth > bar.clientWidth) {
        leftArrow.style.display = bar.scrollLeft > 0 ? 'flex' : 'none';
        rightArrow.style.display = bar.scrollLeft < (bar.scrollWidth - bar.clientWidth - 1) ? 'flex' : 'none';
    } else {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    }
}

function loadOrderIntoPOS(id) {
    const pedido = pedidosActivos.find(p => p.id === id);
    if (!pedido) return;
    
    const roleSelector = document.getElementById('role-selector');
    if (roleSelector && roleSelector.value === 'cocina') {
        // If the kitchen clicks the pill, maybe do nothing or show details? Just do nothing for now.
        return;
    }
    
    posActiveOrderId = id;
    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();
    
    // Switch to POS tab if not there
    const posTab = document.querySelector('.nav-item[data-tab="pos"]');
    if (posTab && !posTab.classList.contains('active')) posTab.click();
    
    // Populate form
    const posDestino = document.getElementById('pos-destino');
    const posNombre = document.getElementById('pos-nombre');
    
    if (posDestino) posDestino.value = pedido.destino;
    if (posNombre) {
        if (pedido.destino.startsWith('Domicilio')) {
            posNombre.style.display = 'block';
            posNombre.value = pedido.cliente || '';
        } else {
            posNombre.style.display = 'none';
            posNombre.value = '';
        }
    }
    
    const radioPago = document.querySelector(`input[name="pos-pago"][value="${pedido.pago}"]`);
    if (radioPago) radioPago.checked = true;
    
    posCart = JSON.parse(JSON.stringify(pedido.items)); // Deep copy
    if(typeof renderCart === 'function') renderCart();
    updatePOSButtons();
    renderOrderBar(); // Trigger UI update for the active pill
    
    setTimeout(() => {
        const activePill = document.querySelector('.order-pill.active');
        if (activePill) {
            const posBar = document.getElementById('pos-order-bar');
            if (posBar) {
                const sl = activePill.offsetLeft - (posBar.clientWidth / 2) + (activePill.clientWidth / 2);
                posBar.scrollTo({ left: sl, behavior: 'smooth' });
            }
        }
        const posView = document.querySelector('.main-container');
        if (posView) posView.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
}

function updatePOSButtons() {
    const btnCrear = document.getElementById('btn-pos-crear');
    const btnEditar = document.getElementById('btn-pos-editar');
    const btnEntregar = document.getElementById('btn-pos-entregar');
    const btnLimpiar = document.getElementById('btn-pos-limpiar');
    
    const posDestino = document.getElementById('pos-destino');
    const btnAddCart = document.getElementById('btn-add-cart');
    const paymentRadios = document.querySelectorAll('input[name="pos-pago"]');
    
    const isDestinoSelected = posDestino && posDestino.value !== "";
    const hasItems = posCart && posCart.length > 0;
    const hasPayment = document.querySelector('input[name="pos-pago"]:checked') !== null;
    
    if (btnAddCart) btnAddCart.disabled = !isDestinoSelected;
    paymentRadios.forEach(r => r.disabled = !hasItems);
    
    if (posActiveOrderId) {
        if (btnCrear) btnCrear.style.display = 'none';
        
        const pedido = pedidosActivos.find(p => p.id === posActiveOrderId);
        const estado = pedido ? pedido.estado : 'pendiente';
        
        if (btnLimpiar) {
            btnLimpiar.textContent = 'Atrás';
            btnLimpiar.style.display = 'block';
        }
        
        if (estado === 'preparado') {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { 
                btnEntregar.style.display = 'block'; 
                btnEntregar.disabled = false; 
                btnEntregar.textContent = 'Cobrado'; 
            }
            if (btnLimpiar) { btnLimpiar.style.display = 'none'; }
        } else {
            if (btnEditar) { btnEditar.style.display = 'block'; btnEditar.disabled = false; }
            if (btnEntregar) { btnEntregar.style.display = 'none'; }
            if (btnLimpiar) { btnLimpiar.style.display = 'block'; }
        }
    } else {
        if (btnCrear) {
            btnCrear.style.display = 'block';
            btnCrear.disabled = !(isDestinoSelected && hasItems && hasPayment);
        }
        if (btnEditar) btnEditar.style.display = 'none';
        if (btnEntregar) btnEntregar.style.display = 'none';
        
        if (btnLimpiar) {
            btnLimpiar.textContent = 'Limpiar';
            btnLimpiar.style.display = 'block';
        }
    }
}

function resetPOS() {
    posActiveOrderId = null;
    posCart = [];
    const posDestino = document.getElementById('pos-destino');
    if(posDestino) { posDestino.value = ''; posDestino.selectedIndex = 0; }
    const posNombre = document.getElementById('pos-nombre');
    if(posNombre) posNombre.value = '';
    if(typeof updateAvailableDestinations === 'function') updateAvailableDestinations();
    if(typeof renderCart === 'function') renderCart();
    if(typeof renderOrderBar === 'function') renderOrderBar();
    updatePOSButtons();
}

document.addEventListener('DOMContentLoaded', () => {
    const posDestino = document.getElementById('pos-destino');
    const posNombre = document.getElementById('pos-nombre');
    const posPlato = document.getElementById('pos-plato');
    const posNotas = document.getElementById('pos-notas');
    const btnAddCart = document.getElementById('btn-add-cart');
    const cartContainer = document.getElementById('cart-items');
    const posTotalPrice = document.getElementById('pos-total-price');
    const btnPosCrear = document.getElementById('btn-pos-crear');
    const btnPosEditar = document.getElementById('btn-pos-editar');
    const btnPosEntregar = document.getElementById('btn-pos-entregar');
    
    updatePOSButtons();

    if (posDestino) {
        posDestino.addEventListener('change', () => {
            if (posDestino.value.startsWith('Domicilio')) {
                posNombre.style.display = 'block';
            } else {
                posNombre.style.display = 'none';
            }
            updatePOSButtons();
        });
    }
    
    document.querySelectorAll('input[name="pos-pago"]').forEach(r => {
        r.addEventListener('change', updatePOSButtons);
    });

    const observer = new MutationObserver(() => {
        if(dbData && dbData.menu && dbData.menu.length > 0 && posPlato && posPlato.options.length <= 1) {
            dbData.menu.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.nombre;
                opt.textContent = `${item.nombre} ($${Number(item.precio).toLocaleString()})`;
                opt.dataset.precio = item.precio;
                posPlato.appendChild(opt);
            });
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function renderCart_local() {
        if (posCart.length === 0) {
            if (cartContainer) cartContainer.innerHTML = '<p class="empty-text-state">El carrito está vacío</p>';
            if (posTotalPrice) posTotalPrice.textContent = '$0';
            if (!posActiveOrderId) {
                if (btnPosCrear) btnPosCrear.disabled = true;
            }
            return;
        }
        
        if (!posActiveOrderId && btnPosCrear) btnPosCrear.disabled = false;
        
        let html = '';
        let total = 0;
        posCart.forEach((item, index) => {
            total += item.precio * item.cantidad;
            html += `
                <div class="cart-item-row">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.nombre} x${item.cantidad}</h4>
                        <p class="cart-item-note">${item.notas}</p>
                    </div>
                    <div class="cart-item-price">
                        $${(item.precio * item.cantidad).toLocaleString()}
                    </div>
                    <div class="qty-controls">
                        <button class="btn-qty-plus" data-index="${index}"><i data-lucide="chevron-up"></i></button>
                        <button class="btn-qty-minus" data-index="${index}"><i data-lucide="chevron-down"></i></button>
                    </div>
                </div>
            `;
        });
        if (cartContainer) cartContainer.innerHTML = html;
        if (posTotalPrice) posTotalPrice.textContent = '$' + total.toLocaleString();
        lucide.createIcons();
        
        document.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                const itm = posCart[idx];
                itm.cantidad--;
                if (itm.cantidad <= 0) {
                    posCart.splice(idx, 1);
                }
                renderCart_local();
                if(typeof updatePOSButtons === 'function') updatePOSButtons();
            });
        });
        document.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                const itm = posCart[idx];
                itm.cantidad++;
                renderCart_local();
                if(typeof updatePOSButtons === 'function') updatePOSButtons();
            });
        });
        
        updatePOSButtons();
    }

    // Expose global for the specific load logic
    window.renderCart = renderCart_local;

    if (btnAddCart) {
        btnAddCart.addEventListener('click', () => {
            const selectedOpt = posPlato.options[posPlato.selectedIndex];
            if (!selectedOpt || !selectedOpt.value) return alert("Selecciona un plato");
            
            const item = {
                nombre: selectedOpt.value,
                precio: Number(selectedOpt.dataset.precio),
                cantidad: 1, 
                notas: posNotas.value || '',
                plato: selectedOpt.value,
                total: Number(selectedOpt.dataset.precio)
            };
            
            // Si ya existe el plato con misma nota, sumamos
            const exists = posCart.find(i => i.nombre === item.nombre && i.notas === item.notas);
            if(exists) exists.cantidad += 1;
            else posCart.push(item);
            
            posNotas.value = '';
            posPlato.value = '';
            renderCart_local();
        });
    }

    if (btnPosCrear) {
        btnPosCrear.addEventListener('click', () => {
            if(posCart.length === 0) return;
            
            const destino = posDestino.value;
            const cliente = destino.startsWith('Domicilio') ? posNombre.value : '';
            const metodoPago = document.querySelector('input[name="pos-pago"]:checked').value;
            
            let totalPedido = posCart.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
            if (destino.startsWith('Domicilio')) totalPedido += 1000;

            const nuevoPedido = {
                id: Date.now(),
                destino: destino,
                cliente: cliente,
                pago: metodoPago,
                items: [...posCart],
                estado: 'pendiente', 
                fecha: new Date().toISOString()
            };
            
            const payload = {
                type: 'order',
                id_pedido: nuevoPedido.id,
                fecha: formatToLocalSheetsDate(nuevoPedido.fecha),
                destino: destino,
                nombre_cliente: cliente,
                metodo_pago: metodoPago,
                total: totalPedido,
                detalle_json: JSON.stringify(nuevoPedido.items)
            };

            const originalText = btnPosCrear.innerHTML;
            btnPosCrear.innerHTML = 'Enviando...';
            btnPosCrear.disabled = true;

            fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    pedidosActivos.push(nuevoPedido);
                    savePedidos();
                    resetPOS();
                    alert("Pedido creado y enviado a la cocina.");
                    if(typeof fetchData === 'function') fetchData();
                } else {
                    alert("Error en backend: " + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                pedidosActivos.push(nuevoPedido);
                savePedidos();
                resetPOS();
                alert("Sin conexión, pedido guardado solo localmente.");
            })
            .finally(() => {
                btnPosCrear.innerHTML = originalText;
                btnPosCrear.disabled = false;
            });
        });
    }

    if (btnPosEditar) {
        btnPosEditar.addEventListener('click', () => {
            if (!posActiveOrderId) return;
            
            const index = pedidosActivos.findIndex(p => p.id === posActiveOrderId);
            if(index > -1) {
                const destino = posDestino.value;
                const cliente = destino.startsWith('Domicilio') ? posNombre.value : '';
                const metodoPago = document.querySelector('input[name="pos-pago"]:checked').value;
                
                let totalPedido = posCart.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
                if (destino.startsWith('Domicilio')) totalPedido += 1000;

                const payload = {
                    type: 'update_order_full',
                    id_pedido: pedidosActivos[index].id,
                    total: totalPedido,
                    detalle_json: JSON.stringify(posCart)
                };

                const originalText = btnPosEditar.innerHTML;
                btnPosEditar.innerHTML = 'Modificando...';
                btnPosEditar.disabled = true;

                fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status === 'success') {
                        pedidosActivos[index].destino = destino;
                        pedidosActivos[index].cliente = cliente;
                        pedidosActivos[index].pago = metodoPago;
                        pedidosActivos[index].items = [...posCart];
                        pedidosActivos[index].estado = 'pendiente';
                        
                        savePedidos();
                        resetPOS();
                        alert("Pedido modificado y enviado de vuelta a la cocina.");
                    } else {
                        alert("Error en backend: " + data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Sin conexión para modificar pedido en la base de datos.");
                })
                .finally(() => {
                    btnPosEditar.innerHTML = originalText;
                    btnPosEditar.disabled = false;
                });
            }
        });
    }

    if (btnPosEntregar) {
        btnPosEntregar.addEventListener('click', () => {
            if (!posActiveOrderId) return;
            
            const index = pedidosActivos.findIndex(p => p.id === posActiveOrderId);
            if(index > -1) {
                const pedido = pedidosActivos[index];
                let totalPedido = pedido.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
                if (pedido.destino.startsWith('Domicilio')) totalPedido += 1000;

                const originalText = btnPosEntregar.innerHTML;
                btnPosEntregar.innerHTML = 'Enviando...';
                btnPosEntregar.disabled = true;

                const payload = {
                    type: 'complete_order',
                    id_pedido: pedido.id,
                    fecha: formatToLocalSheetsDate(pedido.fecha || getLocalDateStr()),
                    destino: pedido.destino,
                    metodo_pago: pedido.pago,
                    total: totalPedido,
                    detalle_json: JSON.stringify(pedido.items)
                };

                fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        pedidosActivos[index].estado = 'entregado';
                        savePedidos();
                        resetPOS();
                        alert("Pedido entregado y registrado en Ventas.");
                        if(typeof fetchData === 'function') fetchData(); // Sync con backend
                    } else {
                        alert("Error al entregar: " + data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Error de conexión al marcar como entregado.");
                })
                .finally(() => {
                    btnPosEntregar.innerHTML = originalText;
                    btnPosEntregar.disabled = false;
                });
            }
        });
    }
    
    const btnPosLimpiar = document.getElementById('btn-pos-limpiar');
    if (btnPosLimpiar) {
        btnPosLimpiar.addEventListener('click', resetPOS);
    }

    if(cartContainer) renderCart_local();
    
    window.addEventListener('storage', (e) => {
        if(e.key === 'pedidosActivos') {
            pedidosActivos = JSON.parse(e.newValue) || [];
            renderKDS();
            renderOrderBar();
        }
    });

    renderKDS();
    renderOrderBar();
    
    // Attach scroll arrow listeners
    document.getElementById('scroll-left')?.addEventListener('click', () => {
        const bar = document.getElementById('pos-order-bar');
        if(bar) bar.scrollBy({ left: -200, behavior: 'smooth' });
    });
    document.getElementById('scroll-right')?.addEventListener('click', () => {
        const bar = document.getElementById('pos-order-bar');
        if(bar) bar.scrollBy({ left: 200, behavior: 'smooth' });
    });
    document.getElementById('pos-order-bar')?.addEventListener('scroll', updateOrderScrollArrows);
});

function renderKDS() {
    const kdsGrid = document.getElementById('kds-grid');
    if(!kdsGrid) return;
    
    const pendientes = pedidosActivos.filter(p => p.estado !== 'entregado');
    
    if(pendientes.length === 0) {
        kdsGrid.innerHTML = '<p class="empty-text-kds">No hay pedidos en cocina</p>';
        return;
    }
    
    let html = '';
    pendientes.forEach(pedido => {
        let itemsHtml = pedido.items.map(item => `
            <li class="kds-ticket-item">
                <div class="kds-ticket-item-qty">${item.cantidad}x ${item.nombre}</div>
                ${item.notas ? `<div class="kds-ticket-item-note">Nota: ${item.notas}</div>` : ''}
            </li>
        `).join('');
        
        let title = pedido.destino.startsWith('Domicilio') ? `Dom: ${pedido.cliente || 'Sin Nombre'}` : pedido.destino;
        
        const isPreparado = pedido.estado === 'preparado';
        
        html += `
            <div class="kds-ticket ${isPreparado ? 'preparado' : ''}">
                <div class="kds-ticket-header">
                    <h3 class="kds-ticket-title">${title}</h3>
                    <span class="kds-ticket-time">${new Date(pedido.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <ul class="kds-ticket-list">
                    ${itemsHtml}
                </ul>
                <div class="kds-ticket-footer">
                    ${isPreparado 
                        ? `<span class="kds-status-listo"><i data-lucide="check-circle" class="icon-small"></i> Listo</span>` 
                        : `<button class="btn-preparar kds-btn-preparar" data-id="${pedido.id}"><i data-lucide="chef-hat" class="icon-small"></i> Preparado</button>`
                    }
                </div>
            </div>
        `;
    });
    
    kdsGrid.innerHTML = html;
    lucide.createIcons();
    
    document.querySelectorAll('.btn-preparar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.getAttribute('data-id'));
            const pedidoIndex = pedidosActivos.findIndex(p => p.id === id);
            if(pedidoIndex > -1) {
                const targetBtn = e.currentTarget;
                const originalText = targetBtn.innerHTML;
                targetBtn.innerHTML = '...';
                targetBtn.disabled = true;
                
                // Optimistic UI Update to feel instantaneous
                const estadoAnterior = pedidosActivos[pedidoIndex].estado;
                pedidosActivos[pedidoIndex].estado = 'preparado';
                savePedidos();
                
                fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ type: 'update_order', id_pedido: id })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status !== 'success') {
                        // Revert if failed
                        pedidosActivos[pedidoIndex].estado = estadoAnterior;
                        savePedidos();
                        alert("Error en backend: " + data.message);
                    }
                })
                .catch(err => {
                    console.error(err);
                    // Revert if failed
                    pedidosActivos[pedidoIndex].estado = estadoAnterior;
                    savePedidos();
                    alert("Sin conexión para marcar como preparado en base de datos.");
                })
                .finally(() => {
                    // Update btn state ONLY if it wasn't successfully marked as ready
                    if(pedidosActivos[pedidoIndex].estado !== 'preparado') {
                        targetBtn.innerHTML = originalText;
                        targetBtn.disabled = false;
                    }
                });
            }
        });
    });
}

function updateAvailableDestinations() {
    const select = document.getElementById('pos-destino');
    if (!select) return;
    const ocupadas = pedidosActivos.filter(p => p.estado !== 'entregado' && p.destino).map(p => p.destino);
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return;
        let currentEditingDestino = '';
        if (posActiveOrderId) {
            const p = pedidosActivos.find(x => x.id === posActiveOrderId);
            if (p) currentEditingDestino = p.destino;
        }
        if (ocupadas.includes(opt.value) && opt.value !== currentEditingDestino) {
            opt.disabled = true;
            opt.style.display = 'none';
        } else {
            opt.disabled = false;
            opt.style.display = '';
        }
    });
}

function renderExpenseCart() {
    const list = document.getElementById('expense-cart-list');
    const totalEl = document.getElementById('expense-cart-total');
    if(!list) return;
    
    if(expenseCart.length === 0) {
        list.innerHTML = '<div class="empty-text-state">Sin registros listados</div>';
        if(totalEl) totalEl.textContent = '$0';
        return;
    }
    
    list.innerHTML = '';
    let grandTotal = 0;
    
    expenseCart.forEach((item, index) => {
        let title, desc;
        if (item.type === 'expense') {
            title = item.descripcion;
            desc = item.categoria;
        } else {
            let unitAbrev = item.unidad || '';
            // If the unit has parentheses, extract the abbreviation (e.g. "Kg", "und")
            const match = unitAbrev.match(/\(([^)]+)\)/);
            if (match) {
                unitAbrev = match[1];
                // If the extracted part is just a number (e.g. "200" from "Paquete (200)"), use the main word instead
                if (!isNaN(unitAbrev)) {
                    unitAbrev = item.unidad.split(' ')[0];
                }
            }
            
            // Clean up the insumo name if it already has the unit appended at the end
            let insumoClean = item.insumo || '';
            if (insumoClean.includes(' (')) {
                insumoClean = insumoClean.split(' (')[0].trim();
            }
            
            title = `${insumoClean} - ${item.cantidad} ${unitAbrev}`;
            desc = ''; 
        }
        
        let price = item.type === 'expense' ? item.valor : item.costoTotal;
        grandTotal += price;
        
        const li = document.createElement('li');
        li.className = 'cart-item-row'; // THIS WAS THE BUG: was cart-item instead of cart-item-row
        
        li.innerHTML = `
            <div class="cart-item-details" style="flex: 1;">
                <span class="cart-item-name" style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">${title}</span>
                ${desc ? `<span class="cart-item-notes" style="font-size: 0.8rem; color: var(--text-light);">${desc}</span>` : ''}
            </div>
            <div class="cart-item-price" style="font-weight: bold; margin-right: 10px;">$${price.toLocaleString('es-CO')}</div>
            <button type="button" class="cart-btn-remove" onclick="removeExpenseFromCart(${index})" style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 5px; display: flex; align-items: center;"><i data-lucide="trash-2"></i></button>
        `;
        list.appendChild(li);
    });
    
    if(totalEl) totalEl.textContent = `$${grandTotal.toLocaleString('es-CO')}`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function removeExpenseFromCart(index) {
    expenseCart.splice(index, 1);
    renderExpenseCart();
}

function populateExpenseDropdowns() {
    if (!dbData || !dbData.inventario) return;
    
    const catSelect = document.getElementById('exp-cat-compra');
    const insumoSelect = document.getElementById('exp-insumo');
    const unitInput = document.getElementById('exp-unidades');
    
    if (!catSelect || !insumoSelect || !unitInput) return;
    
    const today = getLocalDateStr();
    const fechaC = document.getElementById('exp-fecha-compra');
    const fechaG = document.getElementById('exp-fecha-gasto');
    if(fechaC && !fechaC.value) fechaC.value = today;
    if(fechaG && !fechaG.value) fechaG.value = today;
    
    // Set global date input default
    const globalFecha = document.getElementById('global-fecha');
    if(globalFecha && !globalFecha.value) globalFecha.value = today;

    const categories = [...new Set(dbData.inventario.map(i => i['Categoría'] || i.Categoria || 'Otros'))];
    
    let catHtml = '<option value="">Seleccione...</option>';
    categories.sort().forEach(c => {
        catHtml += `<option value="${c}">${c}</option>`;
    });
    catSelect.innerHTML = catHtml;
    
    // Remove old event listeners if they exist to prevent duplicates
    const newCatSelect = catSelect.cloneNode(true);
    catSelect.parentNode.replaceChild(newCatSelect, catSelect);
    
    const newInsumoSelect = insumoSelect.cloneNode(true);
    insumoSelect.parentNode.replaceChild(newInsumoSelect, insumoSelect);
    
    newCatSelect.addEventListener('change', () => {
        const selCat = newCatSelect.value;
        if (!selCat) {
            newInsumoSelect.innerHTML = '<option value="">Seleccione Categoría primero</option>';
            unitInput.value = '';
            return;
        }
        
        const insumos = dbData.inventario.filter(i => (i['Categoría'] || i.Categoria || 'Otros') === selCat);
        let insumoHtml = '<option value="">Seleccione Insumo...</option>';
        insumos.sort((a,b) => {
            const nameA = a['Nombre Insumo'] || a.Nombre || '';
            const nameB = b['Nombre Insumo'] || b.Nombre || '';
            return nameA.localeCompare(nameB);
        }).forEach(i => {
            const name = i['Nombre Insumo'] || i.Nombre || 'Desconocido';
            insumoHtml += `<option value="${name}">${name}</option>`;
        });
        newInsumoSelect.innerHTML = insumoHtml;
    });
    
    newInsumoSelect.addEventListener('change', () => {
        const selInsumo = newInsumoSelect.value;
        const info = dbData.inventario.find(i => (i['Nombre Insumo'] || i.Nombre) === selInsumo);
        if (info) {
            unitInput.value = info['Unidad Base'] || info.Unidad || '';
        } else {
            unitInput.value = '';
        }
    });

    const qtyInput = document.getElementById('exp-cantidad');
    const priceInput = document.getElementById('exp-costo-unitario');
    const totalInput = document.getElementById('exp-costo-total');
    
    const updateTotal = () => {
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        totalInput.value = (qty * price).toFixed(2);
    };
    
    if(qtyInput && priceInput) {
        qtyInput.removeEventListener('input', updateTotal);
        priceInput.removeEventListener('input', updateTotal);
        qtyInput.addEventListener('input', updateTotal);
        priceInput.addEventListener('input', updateTotal);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-submit-expenses').addEventListener('click', async () => {
        if(expenseCart.length === 0) {
            alert("La lista de registros está vacía.");
            return;
        }
        
        const globalFecha = document.getElementById('global-fecha').value;
        const globalPago = document.querySelector('input[name="global-pago"]:checked') ? document.querySelector('input[name="global-pago"]:checked').value : 'Efectivo';
        const globalComentario = document.getElementById('global-comentario').value || '';
        
        if (!globalFecha) {
            alert("Por favor selecciona una Fecha de Registro.");
            return;
        }

        // Apply global fields to all items in expenseCart
        const finalCart = expenseCart.map(item => {
            return {
                ...item,
                fecha: formatToLocalSheetsDate(globalFecha),
                pago: globalPago,
                comentarios: globalComentario
            };
        });

        const btn = document.getElementById('btn-submit-expenses');
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader" class="icon-small spinner"></i> Registrando...';
        btn.disabled = true;
        
        try {
            const payload = {
                type: 'batch_transactions',
                items: JSON.stringify(finalCart)
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            const data = await response.json();
            
            if(data.status === 'success') {
                alert("Transacciones registradas exitosamente!");
                expenseCart = [];
                renderExpenseCart();
                document.getElementById('global-comentario').value = '';
                fetchData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        } finally {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
});


// --- Injected Register Tabs Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const btnTabPurchase = document.getElementById('btn-tab-purchase');
    const btnTabExpense = document.getElementById('btn-tab-expense');
    const hiddenCompra = document.getElementById('radio-compra-hidden');
    const hiddenGasto = document.getElementById('radio-gasto-hidden');
    const mainTitle = document.getElementById('main-title');
    
    if (btnTabPurchase && btnTabExpense) {
        btnTabPurchase.addEventListener('click', (e) => {
            e.preventDefault();
            btnTabPurchase.classList.add('active');
            btnTabExpense.classList.remove('active');
            if(hiddenCompra) hiddenCompra.checked = true;
            if(hiddenGasto) hiddenGasto.checked = false;
            
            if (hiddenCompra) hiddenCompra.dispatchEvent(new Event('change'));
        });
        // Force purchase as default on load
        setTimeout(() => btnTabPurchase.click(), 50);
        
        btnTabExpense.addEventListener('click', (e) => {
            e.preventDefault();
            btnTabExpense.classList.add('active');
            btnTabPurchase.classList.remove('active');
            if(hiddenGasto) hiddenGasto.checked = true;
            if(hiddenCompra) hiddenCompra.checked = false;
            
            if (hiddenGasto) hiddenGasto.dispatchEvent(new Event('change'));
        });
    }
});
