/* Lógica de la tienda: base de datos local, catálogo y carrito de reservas */
/* ============ "BASE DE DATOS" (guardada en el navegador) ============ */
const DB = {
  get(k, d) { try { const v = localStorage.getItem('raven_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('raven_' + k, JSON.stringify(v)); return true; } catch (e) { alert('No se pudo guardar. Revisa el espacio del navegador.'); return false; } }
};
let products = DB.get('products', null) || SEED;
if (!DB.get('products', null) && location.protocol !== 'file:') fetch('data/productos.json').then(r => r.ok ? r.json() : null).then(d => { if (Array.isArray(d) && d.length) { products = d; renderGrid(); } }).catch(() => {});
if (DB.get('products', null) && DB.get('seedv', 0) < SEED_V) {
  const viejo = /^p([1-9]|10)$/;   // prendas de ejemplo de versiones anteriores
  products = SEED.concat(products.filter(p => !viejo.test(p.id) && !SEED.some(x => x.id === p.id)));
  DB.set('products', products); DB.set('seedv', SEED_V);
}
let cart = DB.get('cart', []);
let reservas = DB.get('reservas', []);

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => CFG.moneda + ' ' + (Math.round(n * 100) / 100);

/* ============ CATÁLOGO ============ */
function renderGrid() {
  const list = products;
  $('grid').innerHTML = list.length ? list.map(p => {
    const tallas = (p.tallas || '').split(',').map(t => t.trim()).filter(Boolean);
    const soon = !(p.precio > 0), out = soon || p.stock <= 0;
    return `<div class="rv-slide"><div class="card rv-card" data-id="${esc(p.id)}">
      <img src="${esc(imgSrc(p.img))}" alt="${esc(p.nombre)}" loading="lazy">
      <div class="card-body d-flex flex-column">
        <h6 class="card-title mb-1">${esc(p.nombre)}</h6>
        <p class="small text-secondary mb-2">${esc(p.desc)}</p>
        <div class="rv-price mb-2">${soon ? 'Próximamente' : money(p.precio)}</div>
        ${tallas.length && !out ? `<select class="form-select form-select-sm bg-dark text-white border-purple mb-2" aria-label="Talla">${tallas.map(t => `<option>${esc(t)}</option>`).join('')}</select>` : ''}
        <button class="btn ${out ? 'btn-secondary' : 'btn-outline-purple'} mt-auto" data-act="reservar" ${out ? 'disabled' : ''}>${out ? (soon ? 'Próximamente' : 'Agotado') : 'Reservar'}</button>
      </div></div></div>`;
  }).join('') : '<p class="text-secondary">Aún no hay prendas en el catálogo.</p>';
  arrows();
}
const track = $('grid');
let pausedUntil = 0;
function arrows() { document.querySelectorAll('.rv-nav').forEach(b => b.classList.toggle('d-none', track.scrollWidth - track.clientWidth < 4)); }
function slide(dir) {
  const max = track.scrollWidth - track.clientWidth;
  if (max < 4) return;
  const first = track.firstElementChild;
  const step = first ? first.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 20) : 300;
  if (dir > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });      // del final vuelve al inicio
  else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: max, behavior: 'smooth' });    // del inicio salta al final
  else track.scrollBy({ left: dir * step, behavior: 'smooth' });
}
document.querySelectorAll('[data-slide]').forEach(b => b.addEventListener('click', () => { pausedUntil = Date.now() + 12000; slide(+b.dataset.slide); }));
['pointerdown', 'mousemove', 'focusin', 'touchstart', 'wheel'].forEach(ev => track.addEventListener(ev, () => { pausedUntil = Date.now() + 12000; }, { passive: true }));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!document.hidden && Date.now() > pausedUntil) slide(1); }, 4000);
addEventListener('resize', arrows);
$('cLugar').innerHTML += CFG.lugares.map(l => `<option>${esc(l)}</option>`).join('');
(function () {
  let h = '<option value="">Hora</option>';
  for (let m = CFG.horaIni * 60; m < CFG.horaFin * 60; m += 30) h += `<option>${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}</option>`;
  $('cHora').innerHTML = h;
})();
const hoyISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
$('cFecha').min = hoyISO();

/* ============ CARRITO ============ */
function saveCart() { DB.set('cart', cart); renderCart(); }
function renderCart() {
  const n = cart.reduce((a, l) => a + l.cant, 0);
  $('cartCount').textContent = n;
  $('cartCount').classList.toggle('d-none', n === 0);
  $('cartItems').innerHTML = cart.length ? cart.map((l, i) => `
    <div class="d-flex gap-2 mb-3 align-items-center">
      <img src="${esc(imgSrc(l.img))}" alt="" class="adm-thumb">
      <div class="flex-grow-1"><div>${esc(l.nombre)}</div><div class="small text-secondary">${l.talla ? 'Talla ' + esc(l.talla) + ' · ' : ''}${money(l.precio)}</div></div>
      <div class="btn-group btn-group-sm"><button class="btn btn-outline-light" data-act="menos" data-i="${i}" aria-label="Quitar uno">−</button><span class="btn btn-dark disabled">${l.cant}</span><button class="btn btn-outline-light" data-act="mas" data-i="${i}" aria-label="Agregar uno">+</button></div>
      <button class="btn btn-sm btn-outline-danger" data-act="quitar" data-i="${i}" aria-label="Eliminar"><i class="bi bi-trash"></i></button>
    </div>`).join('') : '<p class="text-secondary">Tu reserva está vacía. Elige una prenda del catálogo.</p>';
  $('cartTotal').textContent = money(cart.reduce((a, l) => a + l.cant * l.precio, 0));
}
function addToCart(card, btn) {
  const p = products.find(x => x.id === card.dataset.id); if (!p) return;
  const sel = card.querySelector('select'); const talla = sel ? sel.value : '';
  const line = cart.find(l => l.id === p.id && l.talla === talla);
  const enCarrito = cart.filter(l => l.id === p.id).reduce((a, l) => a + l.cant, 0);
  if (enCarrito >= p.stock) { btn.textContent = 'Sin más stock'; setTimeout(() => btn.textContent = 'Reservar', 1200); return; }
  if (line) line.cant++; else cart.push({ id: p.id, nombre: p.nombre, precio: p.precio, img: p.img, talla, cant: 1 });
  saveCart(); btn.textContent = 'Añadido ✓'; setTimeout(() => btn.textContent = 'Reservar', 1000);
}
function checkout() {
  const nombre = $('cName').value.trim(), tel = $('cPhone').value.trim(), msg = $('cartMsg');
  msg.textContent = '';
  if (!cart.length) { msg.textContent = 'Agrega al menos una prenda.'; return; }
  if (nombre.replace(/ /g, '').length < 2) { msg.textContent = 'Escribe tu nombre (solo letras).'; return; }
  if (!/^\d{7,8}$/.test(tel)) { msg.textContent = 'Escribe tu celular con 7 u 8 números.'; return; }
  const lugar = $('cLugar').value, fecha = $('cFecha').value, hora = $('cHora').value;
  if (!lugar) { msg.textContent = 'Elige el lugar de entrega.'; return; }
  if (!fecha || fecha < hoyISO()) { msg.textContent = 'Elige una fecha de entrega válida.'; return; }
  if (new Date(fecha + 'T12:00').getDay() === 0) { msg.textContent = 'Los domingos estamos cerrados. Elige otro día.'; return; }
  if (!hora) { msg.textContent = 'Elige la hora de entrega.'; return; }
  if (fecha === hoyISO()) { const n = new Date(); if (hora <= String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')) { msg.textContent = 'Esa hora ya pasó. Elige una más tarde.'; return; } }
  const entrega = fecha.split('-').reverse().join('/') + ' ' + hora;
  const total = cart.reduce((a, l) => a + l.cant * l.precio, 0);
  const r = { id: Date.now().toString(36), fecha: new Date().toLocaleString('es-BO'), cliente: nombre, telefono: tel, estado: 'Pendiente', total, lugar, entrega,
    items: cart.map(l => ({ id: l.id, nombre: l.nombre, talla: l.talla, cant: l.cant, precio: l.precio })) };
  reservas.push(r); DB.set('reservas', reservas);
  const texto = `Hola Raven Store, quiero reservar:\n` + r.items.map(i => `- ${i.cant}x ${i.nombre}${i.talla ? ' (' + i.talla + ')' : ''} - ${money(i.precio * i.cant)}`).join('\n') + `\nTotal: ${money(total)}\nNombre: ${nombre}\nCelular: ${tel}\nEntrega: ${lugar}, ${entrega}`;
  window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  cart = []; saveCart(); $('cName').value = ''; $('cPhone').value = ''; $('cLugar').value = ''; $('cFecha').value = ''; $('cHora').value = '';
  bootstrap.Offcanvas.getOrCreateInstance($('cartPanel')).hide();
}
$('checkout').addEventListener('click', checkout);
$('cName').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^\p{L} ]/gu, '').replace(/ {2,}/g, ' '); });
$('cPhone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, i = +b.dataset.i;
  if (act === 'reservar') addToCart(b.closest('.rv-card'), b);
  else if (act === 'mas') { const l = cart[i], p = products.find(x => x.id === l.id); if (p && cart.filter(c => c.id === l.id).reduce((a, c) => a + c.cant, 0) < p.stock) l.cant++; saveCart(); }
  else if (act === 'menos') { if (--cart[i].cant <= 0) cart.splice(i, 1); saveCart(); }
  else if (act === 'quitar') { cart.splice(i, 1); saveCart(); }
});

renderGrid(); renderCart();
