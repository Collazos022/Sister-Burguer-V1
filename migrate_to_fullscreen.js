const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update the sidebar navigation
html = html.replace(
    '<a href="#" class="nav-item" id="btn-open-form" data-roles="admin,servicio,cocina">',
    '<a href="#" class="nav-item" data-tab="register" data-roles="admin,servicio,cocina">'
);

// 2. Remove the modal and extract its contents
const modalStart = html.indexOf('<div class="modal" id="entry-modal">');
const modalEnd = html.indexOf('</div>', html.lastIndexOf('</div>', html.indexOf('<!-- JS -->') - 10)) + 6; // Rough extraction

// Let's use a safer regex or replacement to remove the modal
const modalRegex = /<div class="modal" id="entry-modal">[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;
html = html.replace(modalRegex, '');

// 3. Define the new full-screen section
const newSection = `
                <section class="dashboard-view" id="register" style="display: none;">
                    <div class="pos-container">
                        <!-- PANEL IZQUIERDO: FORMULARIO -->
                        <div class="pos-cart pos-cart-box" style="flex: 1.5; padding: 20px; overflow-y: auto;">
                            <h2 style="margin-bottom: 20px;">Registrar Compra / Gasto</h2>
                            
                            <form id="entry-form">
                                <div class="form-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                                    <label class="tab-option">
                                        <input type="radio" name="entry-type" value="purchase" checked>
                                        <span>Compra Insumo</span>
                                    </label>
                                    <label class="tab-option">
                                        <input type="radio" name="entry-type" value="expense">
                                        <span>Gasto Operativo</span>
                                    </label>
                                </div>

                                <div class="form-body" id="form-gasto" style="display: none;">
                                    <div class="form-group"><label>Fecha</label><input type="date" id="exp-fecha-gasto" class="pos-input" required></div>
                                    <div class="form-group"><label>Categoría</label>
                                        <select id="exp-cat-gasto" class="pos-select">
                                            <option value="Administración">Administración</option>
                                            <option value="Servicios Públicos">Servicios Públicos</option>
                                            <option value="Nómina">Nómina</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label>Descripción</label><input type="text" id="exp-descripcion" class="pos-input"></div>
                                    <div class="form-group"><label>Valor ($)</label><input type="number" id="exp-valor-gasto" class="pos-input"></div>
                                    <div class="form-group"><label>Método Pago</label>
                                        <select id="exp-pago-gasto" class="pos-select">
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Transferencia">Transferencia</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label>Comentario</label><input type="text" id="exp-comentarios-gasto" class="pos-input"></div>
                                </div>

                                <div class="form-body" id="form-compra" style="display: block;">
                                    <div class="form-group"><label>Fecha</label><input type="date" id="exp-fecha-compra" class="pos-input" required></div>
                                    <div class="form-group"><label>Categoría</label><select id="exp-cat-compra" class="pos-select"><option value="">Cargando...</option></select></div>
                                    <div class="form-group"><label>Insumo</label><select id="exp-insumo" class="pos-select"><option value="">Seleccione Categoría primero</option></select></div>
                                    <div class="form-group"><label>Unidades</label><input type="text" id="exp-unidades" class="pos-input" readonly disabled style="background: var(--bg-body);"></div>
                                    <div style="display:flex; gap:10px;">
                                        <div class="form-group" style="flex:1"><label>Cantidad</label><input type="number" id="exp-cantidad" class="pos-input" step="0.01"></div>
                                        <div class="form-group" style="flex:1"><label>Costo Unitario ($)</label><input type="number" id="exp-costo-unitario" class="pos-input"></div>
                                    </div>
                                    <div class="form-group"><label>Costo Total ($)</label><input type="number" id="exp-costo-total" class="pos-input" readonly disabled style="font-weight:bold; color:var(--primary); background: var(--bg-body);"></div>
                                    <div class="form-group"><label>Método Pago</label>
                                        <select id="exp-pago-compra" class="pos-select">
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Transferencia">Transferencia</option>
                                        </select>
                                    </div>
                                    <div class="form-group"><label>Comentarios</label><input type="text" id="exp-comentarios-compra" class="pos-input"></div>
                                </div>

                                <button type="submit" class="btn-primary" id="btn-add-expense" style="width: 100%; margin-top: 20px;"><i data-lucide="plus"></i> Agregar a la Lista</button>
                            </form>
                        </div>

                        <!-- PANEL DERECHO: CARRITO -->
                        <div class="pos-cart pos-cart-box" style="flex: 1; display: flex; flex-direction: column;">
                            <div class="pos-header pos-header-row" style="margin-bottom: 1rem;">
                                <h3>Lista a Registrar</h3>
                            </div>
                            
                            <div class="cart-separator"></div>

                            <ul id="expense-cart-list" class="cart-items cart-items-container" style="flex-grow: 1; overflow-y: auto; padding: 0; margin: 0; list-style: none;">
                                <div class="empty-text-state">La lista está vacía</div>
                            </ul>

                            <div class="cart-separator"></div>
                            
                            <div class="pos-totals" style="padding: 15px;">
                                <div class="totals-row total">
                                    <span>Total Lote</span>
                                    <span id="expense-cart-total">$0</span>
                                </div>
                                <button type="button" class="btn-primary" id="btn-submit-expenses" style="width: 100%; margin-top: 15px; background: var(--success); font-size: 1.1rem; padding: 15px;"><i data-lucide="save"></i> Registrar Todo</button>
                            </div>
                        </div>
                    </div>
                </section>
`;

const insertPos = html.indexOf('</main>');
html = html.substring(0, insertPos) + newSection + html.substring(insertPos);

fs.writeFileSync('index.html', html);
console.log("index.html updated to fullscreen register view");
