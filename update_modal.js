const fs = require('fs');

const indexHtmlPath = 'index.html';
let html = fs.readFileSync(indexHtmlPath, 'utf8');

const newModalInner = `
            <form id="entry-form">
                <div class="form-tabs">
                    <label class="tab-option">
                        <input type="radio" name="entry-type" value="purchase" checked>
                        <span>Compra Insumo</span>
                    </label>
                    <label class="tab-option">
                        <input type="radio" name="entry-type" value="expense">
                        <span>Gasto Operativo</span>
                    </label>
                </div>

                <div class="form-body" id="form-venta" style="display: none;"></div>

                <div class="form-body" id="form-gasto" style="display: none;">
                    <div class="form-group"><label>Fecha</label><input type="date" id="exp-fecha-gasto" required></div>
                    <div class="form-group"><label>Categoría</label>
                        <select id="exp-cat-gasto">
                            <option value="Administración">Administración</option>
                            <option value="Servicios Públicos">Servicios Públicos</option>
                            <option value="Nómina">Nómina</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Descripción</label><input type="text" id="exp-descripcion"></div>
                    <div class="form-group"><label>Valor ($)</label><input type="number" id="exp-valor-gasto"></div>
                    <div class="form-group"><label>Método Pago</label><select id="exp-pago-gasto"><option value="Efectivo">Efectivo</option><option value="Transferencia">Transferencia</option></select></div>
                    <div class="form-group"><label>Comentario</label><input type="text" id="exp-comentarios-gasto"></div>
                </div>

                <div class="form-body" id="form-compra" style="display: block;">
                    <div class="form-group"><label>Fecha</label><input type="date" id="exp-fecha-compra" required></div>
                    <div class="form-group"><label>Categoría</label><select id="exp-cat-compra"><option value="">Cargando...</option></select></div>
                    <div class="form-group"><label>Insumo</label><select id="exp-insumo"><option value="">Seleccione Categoría primero</option></select></div>
                    <div class="form-group"><label>Unidades</label><input type="text" id="exp-unidades" readonly disabled style="background: var(--bg-body);"></div>
                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex:1"><label>Cantidad</label><input type="number" id="exp-cantidad" step="0.01"></div>
                        <div class="form-group" style="flex:1"><label>Costo Unitario ($)</label><input type="number" id="exp-costo-unitario"></div>
                    </div>
                    <div class="form-group"><label>Costo Total ($)</label><input type="number" id="exp-costo-total" readonly disabled style="font-weight:bold; color:var(--primary); background: var(--bg-body);"></div>
                    <div class="form-group"><label>Método Pago</label><select id="exp-pago-compra"><option value="Efectivo">Efectivo</option><option value="Transferencia">Transferencia</option></select></div>
                    <div class="form-group"><label>Comentarios</label><input type="text" id="exp-comentarios-compra"></div>
                </div>

                <div class="modal-footer" style="flex-direction: column; gap: 10px;">
                    <button type="submit" class="btn-primary" id="btn-add-expense" style="width: 100%;"><i data-lucide="plus"></i> Agregar a la Lista</button>
                    
                    <div style="width: 100%; text-align: left; background: var(--bg-body); padding: 10px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">Lista a Registrar:</h4>
                        <ul id="expense-cart-list" class="cart-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 10px;">
                            <div class="empty-text-state" style="font-size: 0.8rem;">La lista está vacía</div>
                        </ul>
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;">
                            <span>Total:</span>
                            <span id="expense-cart-total">$0</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; width: 100%;">
                        <button type="button" class="btn-secondary" id="btn-cancel" style="flex: 1;">Cerrar</button>
                        <button type="button" class="btn-primary" id="btn-submit-expenses" style="flex: 1; background: var(--success);"><i data-lucide="save"></i> Registrar Todo</button>
                    </div>
                </div>
            </form>
`;

const startIndex = html.indexOf('<form id="entry-form">');
const endIndex = html.indexOf('</form>', startIndex) + '</form>'.length;

if (startIndex > -1 && endIndex > -1) {
    html = html.substring(0, startIndex) + newModalInner + html.substring(endIndex);
    fs.writeFileSync(indexHtmlPath, html);
    console.log("Updated index.html modal successfully.");
} else {
    console.log("Could not find <form id=\"entry-form\">");
}
