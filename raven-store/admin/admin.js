/* Panel de administrador: se inyecta en la página y gestiona productos y reservas */
const ADMIN_HTML = `
<!-- ==================== ADMIN ==================== -->
<div class="modal fade" id="adminModal" tabindex="-1" aria-labelledby="adminTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content bg-dark text-white">
      <div class="modal-header border-secondary">
        <h5 class="modal-title" id="adminTitle">Panel de administrador</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <div id="adLogin" class="mx-auto" style="max-width:340px">
          <label for="adPass" class="form-label">Contraseña</label>
          <input id="adPass" type="password" class="form-control bg-dark text-white border-purple mb-2">
          <button id="adEnter" class="btn btn-purple w-100">Entrar</button>
          <div id="adErr" class="small text-danger mt-2"></div>
        </div>
        <div id="adPanel" class="d-none">
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tabProd">Productos</button></li>
            <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabRes">Reservas <span id="resCount" class="badge bg-danger"></span></button></li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane fade show active" id="tabProd">
              <form id="pf" class="row g-2 mb-4">
                <input type="hidden" id="pId">
                <div class="col-md-4"><input id="pNombre" class="form-control bg-dark text-white" placeholder="Nombre" required></div>
                <div class="col-6 col-md-2"><input id="pPrecio" type="text" inputmode="decimal" maxlength="7" class="form-control bg-dark text-white" placeholder="Precio (Bs)" required></div>
                <div class="col-6 col-md-2"><input id="pStock" type="text" inputmode="numeric" maxlength="4" class="form-control bg-dark text-white" placeholder="Stock" required></div>
                <div class="col-md-4"><input id="pTallas" class="form-control bg-dark text-white" placeholder="Tallas: S,M,L,XL" maxlength="30"></div>
                <div class="col-md-5"><input id="pImg" class="form-control bg-dark text-white" placeholder="Imagen: img/productos/prenda.jpg" required></div>
                <div class="col-md-5"><input id="pDesc" class="form-control bg-dark text-white" placeholder="Descripción corta"></div>
                <div class="col-md-2 d-flex gap-2"><button class="btn btn-purple flex-fill" id="pSave">Guardar</button><button type="button" class="btn btn-outline-light" id="pCancel" title="Cancelar edición">✕</button></div>
              </form>
              <button type="button" class="btn btn-sm btn-outline-light mb-3" id="expProd">Descargar productos.json (para publicar el catálogo)</button>
              <div class="table-responsive"><table class="table table-dark align-middle mb-0"><thead><tr><th></th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Tallas</th><th></th></tr></thead><tbody id="adProds"></tbody></table></div>
            </div>
            <div class="tab-pane fade" id="tabRes">
              <div class="d-flex flex-wrap gap-2 mb-3">
                <button class="btn btn-sm btn-outline-light" id="expJson">Descargar respaldo (JSON)</button>
                <button class="btn btn-sm btn-outline-light" id="expCsv">Reservas en CSV</button>
              </div>
              <div id="adRes"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', ADMIN_HTML);

/* Acciones de los botones del panel (editar/eliminar) */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act === 'editP') editProduct(b.dataset.id);
  else if (act === 'delP') { if (confirm('¿Eliminar esta prenda?')) { products = products.filter(p => p.id !== b.dataset.id); DB.set('products', products); renderAdmin(); renderGrid(); } }
  else if (act === 'delR') { if (confirm('¿Eliminar esta reserva?')) { reservas = reservas.filter(r => r.id !== b.dataset.id); DB.set('reservas', reservas); renderAdmin(); } }
});

/* ============ ADMIN ============ */
let isAdmin = false;
$('adminLink').addEventListener('click', e => {
  e.preventDefault(); reservas = DB.get('reservas', []);
  $('adLogin').classList.toggle('d-none', isAdmin); $('adPanel').classList.toggle('d-none', !isAdmin);
  if (isAdmin) renderAdmin();
  bootstrap.Modal.getOrCreateInstance($('adminModal')).show();
});
function enter() {
  if ($('adPass').value === CFG.adminPass) { isAdmin = true; $('adPass').value = ''; $('adErr').textContent = ''; $('adLogin').classList.add('d-none'); $('adPanel').classList.remove('d-none'); renderAdmin(); }
  else $('adErr').textContent = 'Contraseña incorrecta.';
}
$('adEnter').addEventListener('click', enter);
$('adPass').addEventListener('keydown', e => { if (e.key === 'Enter') enter(); });

function renderAdmin() {
  $('adProds').innerHTML = products.map(p => `<tr><td><img src="${esc(imgSrc(p.img))}" alt="" class="adm-thumb"></td><td>${esc(p.nombre)}</td><td>${money(p.precio)}</td><td>${p.stock}</td><td>${esc(p.tallas)}</td>
    <td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-light" data-act="editP" data-id="${esc(p.id)}">Editar</button> <button class="btn btn-sm btn-outline-danger" data-act="delP" data-id="${esc(p.id)}">Eliminar</button></td></tr>`).join('');
  const pend = reservas.filter(r => r.estado === 'Pendiente').length;
  $('resCount').textContent = pend || '';
  $('adRes').innerHTML = reservas.length ? reservas.slice().reverse().map(r => `
    <div class="card bg-black border-secondary text-white mb-3"><div class="card-body">
      <div class="d-flex flex-wrap justify-content-between gap-2">
        <div><strong>${esc(r.cliente)}</strong> · <a class="text-info" href="tel:${esc(r.telefono)}">${esc(r.telefono)}</a><div class="small text-secondary">${esc(r.fecha)} · #${esc(r.id)}</div></div>
        <div class="d-flex gap-2 align-items-start">
          <select class="form-select form-select-sm bg-dark text-white" data-estado="${esc(r.id)}">${['Pendiente', 'Confirmada', 'Entregada', 'Cancelada'].map(s => `<option ${s === r.estado ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <button class="btn btn-sm btn-outline-danger" data-act="delR" data-id="${esc(r.id)}" aria-label="Eliminar reserva"><i class="bi bi-trash"></i></button>
        </div>
      </div>
      <div class="small mt-2"><i class="bi bi-geo-alt-fill" style="color:#a100ff"></i> ${esc(r.lugar || '—')} · ${esc(r.entrega || '')}</div><ul class="mb-1 mt-1">${r.items.map(i => `<li>${i.cant}x ${esc(i.nombre)}${i.talla ? ' (' + esc(i.talla) + ')' : ''} — ${money(i.precio * i.cant)}</li>`).join('')}</ul>
      <div class="rv-price">Total ${money(r.total)}</div>
    </div></div>`).join('') : '<p class="text-secondary">Todavía no hay reservas.</p>';
}
$('adRes').addEventListener('change', e => {
  const id = e.target.dataset.estado; if (!id) return;
  const r = reservas.find(x => x.id === id); if (r) { r.estado = e.target.value; DB.set('reservas', reservas); renderAdmin(); }
});
function resetForm() { $('pf').reset(); $('pId').value = ''; }
function editProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  $('pId').value = p.id; $('pNombre').value = p.nombre; $('pPrecio').value = p.precio; $('pStock').value = p.stock; $('pTallas').value = p.tallas; $('pImg').value = p.img.startsWith('data:') ? '' : p.img; $('pDesc').value = p.desc;
  $('pNombre').focus();
}
$('pPrecio').addEventListener('input', e => { const [a, ...b] = e.target.value.replace(/[^\d.]/g, '').split('.'); e.target.value = b.length ? a + '.' + b.join('') : a; });
$('pStock').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
$('pTallas').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^A-Za-z0-9,]/g, '').toUpperCase(); });
$('pCancel').addEventListener('click', resetForm);
$('pf').addEventListener('submit', e => {
  e.preventDefault();
  if (!(+$('pPrecio').value > 0)) { alert('Escribe un precio válido, solo números.'); return; }
  const o = { id: $('pId').value || 'p' + Date.now().toString(36), nombre: $('pNombre').value.trim(), precio: +$('pPrecio').value, stock: parseInt($('pStock').value, 10) || 0,
    tallas: $('pTallas').value.trim(), img: $('pImg').value.trim(), desc: $('pDesc').value.trim() };
  const i = products.findIndex(p => p.id === o.id);
  if (i >= 0) products[i] = o; else products.push(o);
  DB.set('products', products); resetForm(); renderAdmin(); renderGrid();
});
function download(name, text, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
$('expProd').addEventListener('click', () => download('productos.json', JSON.stringify(products, null, 2), 'application/json'));
$('expJson').addEventListener('click', () => download('raven-respaldo.json', JSON.stringify({ products, reservas }, null, 2), 'application/json'));
$('expCsv').addEventListener('click', () => {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [['id', 'fecha', 'cliente', 'telefono', 'estado', 'lugar', 'entrega', 'prendas', 'total']].concat(reservas.map(r => [r.id, r.fecha, r.cliente, r.telefono, r.estado, r.lugar || '', r.entrega || '', r.items.map(i => i.cant + 'x ' + i.nombre + (i.talla ? ' (' + i.talla + ')' : '')).join(' | '), r.total]));
  download('raven-reservas.csv', '\ufeff' + rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
});
