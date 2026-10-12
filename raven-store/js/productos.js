/* Catálogo inicial e imágenes de los productos (los archivos están en img/productos/) */
const PH = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#111"/><rect x="24" y="24" width="552" height="752" fill="none" stroke="#a100ff" stroke-width="3"/><text x="300" y="400" fill="#a100ff" font-family="Orbitron,Arial,sans-serif" font-size="56" font-weight="800" text-anchor="middle">RAVEN</text><text x="300" y="450" fill="#888" font-family="Arial,sans-serif" font-size="26" text-anchor="middle">Foto próximamente</text></svg>');
/* Ruta de imagen. Acepta rutas normales (img/productos/x.jpg), URLs y data:.
   También entiende el formato antiguo '@nombre' para no romper datos ya guardados. */
const imgSrc = v => {
  v = String(v || '');
  if (v.charAt(0) === '@') return 'img/productos/' + v.slice(1).replace('busobeigh', 'busobeige') + '.jpg';
  return v || PH;
};
const SEED_V = 3;
const SEED = [
  { id: 'sudaderaroja', nombre: 'Sudadera roja', precio: 180, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/sudaderaroja.jpg', desc: 'Tejido grueso con dos líneas azul marino.' },
  { id: 'sudaderacafe', nombre: 'Sudadera café', precio: 220, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/sudaderacafe.jpg', desc: 'Media cremallera, cuello alto y bolsillos curvos.' },
  { id: 'chamarraroja', nombre: 'Chamarra roja', precio: 300, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/chamarraroja.jpg', desc: 'Cortaviento guinda y azul con vivos blancos y capucha.' },
  { id: 'chamarraploma', nombre: 'Chamarra plomo', precio: 280, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/chamarraploma.jpg', desc: 'Cortaviento plomo con franja verde y blanca.' },
  { id: 'busoblanco', nombre: 'Buso blanco', precio: 150, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/busoblanco.jpg', desc: 'Corte ancho, cintura elástica con cordón.' },
  { id: 'busobeige', nombre: 'Buso beige', precio: 160, stock: 5, tallas: 'S,M,L,XL', img: 'img/productos/busobeige.jpg', desc: 'Cintura con cordón y franja reflectante en el tobillo.' }
];
