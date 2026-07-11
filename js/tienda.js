const products = [
  { id: 'shell', category: 'CHAQUETA TÉCNICA', name: 'Signal Shell Jacket', price: 2890, description: 'Capa impermeable ligera con ventilación y detalles reflectantes.', sizes: ['CH','M','G','XG'], variants: [
    { id: 'lime', label: 'Verde lima', color: '#c9ed00', image: 'assets/store/chamarra-lima.png', stock: 8 },
    { id: 'black', label: 'Negro', color: '#0a0c0a', image: 'assets/store/chamarra-negra.png', stock: 12 }
  ]},
  { id: 'pack', category: 'MOCHILA 38L', name: 'Mission Pack', price: 3490, description: 'Organización modular, correas de compresión y respaldo ventilado.', sizes: ['38L'], variants: [
    { id: 'lime', label: 'Verde lima', color: '#c9ed00', image: 'assets/store/mochila-lima.png', stock: 6 },
    { id: 'black', label: 'Negro', color: '#0a0c0a', image: 'assets/store/mochila-negra.png', stock: 9 }
  ]},
  { id: 'headwear', category: 'HEADWEAR', name: 'Expedition Headwear', price: 790, description: 'Protección ligera, ajuste trasero y bordado TRIP LINE.', sizes: ['UNITALLA'], variants: [
    { id: 'visor', label: 'Visor lima', color: '#798b20', image: 'assets/store/visor-lima.png', stock: 7 },
    { id: 'classic', label: 'Classic negro', color: '#0a0c0a', image: 'assets/store/gorra-classic-negra.png', stock: 10 },
    { id: 'trucker', label: 'Trucker negro', color: '#171917', image: 'assets/store/gorra-trucker-negra.png', stock: 5 }
  ]}
];
const selections = Object.fromEntries(products.map((p) => [p.id, { variant: p.variants[0].id, size: p.sizes[0] }]));
let stored = getTriplineStore('tripline_demo_cart');
let cart = Array.isArray(stored) ? stored.filter((item) => item && typeof item === 'object' && item.productId) : [];
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
const productFor = (id) => products.find((product) => product.id === id);
const variantFor = (product, id) => product.variants.find((variant) => variant.id === id);

function renderProducts() {
  document.getElementById('shopGrid').innerHTML = products.map((product) => {
    const selected = selections[product.id]; const variant = variantFor(product, selected.variant); const reserved = cart.filter((item) => item.productId === product.id && item.variantId === variant.id).reduce((sum, item) => sum + item.qty, 0); const remaining = Math.max(0, variant.stock - reserved);
    return `<article class="product-card premium-product" data-product="${product.id}">
      <div class="product-image-wrap"><img src="${variant.image}" alt="${product.name} color ${variant.label}" loading="lazy"><span class="stock-pill ${remaining <= 6 ? 'stock-low' : ''}">${remaining === 0 ? 'AGOTADO' : remaining <= 6 ? `ÚLTIMAS ${remaining}` : `${remaining} DISPONIBLES`}</span></div>
      <div class="product-info"><p>${product.category}</p><h2>${product.name}</h2><p class="product-description">${product.description}</p><strong>${money(product.price)}</strong>
      <div class="variant-block"><span>COLOR / MODELO: <b>${variant.label.toUpperCase()}</b></span><div class="variant-swatches">${product.variants.map((item) => `<button type="button" class="variant-swatch ${item.id === variant.id ? 'is-selected' : ''}" data-variant="${item.id}" aria-label="${item.label}" title="${item.label}" style="--swatch:${item.color}"></button>`).join('')}</div></div>
      <label class="size-select">TALLA<select data-size>${product.sizes.map((size) => `<option ${size === selected.size ? 'selected' : ''}>${size}</option>`).join('')}</select></label>
      <button class="btn-primary add-to-cart" data-add="${product.id}" ${remaining === 0 ? 'disabled' : ''}>${remaining === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}</button></div></article>`;
  }).join('');
}
function saveCart() { setTriplineStore('tripline_demo_cart', cart); }
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0); document.getElementById('cartCount').textContent = count;
  document.getElementById('cartItems').innerHTML = cart.length ? cart.map((item) => { const product = productFor(item.productId); const variant = variantFor(product, item.variantId); return `<article class="cart-product" data-key="${item.key}"><img src="${variant.image}" alt=""><div><span>${product.category}</span><h3>${product.name}</h3><small>${variant.label} · ${item.size}</small><div class="quantity-control"><button type="button" data-qty="-1" aria-label="Quitar uno">−</button><strong>${item.qty}</strong><button type="button" data-qty="1" aria-label="Agregar uno">+</button><button type="button" class="remove-item" data-remove>ELIMINAR</button></div></div><strong>${money(product.price * item.qty)}</strong></article>`; }).join('') : '<div class="cart-empty"><span>🛒</span><h3>TU CARRITO ESTÁ VACÍO</h3><p>Agrega equipo para preparar tu próxima ruta.</p></div>';
  const subtotal = cart.reduce((sum, item) => sum + productFor(item.productId).price * item.qty, 0); const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 199;
  document.getElementById('cartSubtotal').textContent = money(subtotal); document.getElementById('cartShipping').textContent = shipping ? money(shipping) : 'GRATIS'; document.getElementById('cartTotal').textContent = money(subtotal + shipping); document.getElementById('demoOrder').disabled = !cart.length; saveCart();
}
document.getElementById('shopGrid').addEventListener('click', (event) => {
  const card = event.target.closest('[data-product]'); if (!card) return; const id = card.dataset.product;
  if (event.target.dataset.variant) { selections[id].variant = event.target.dataset.variant; renderProducts(); return; }
  if (event.target.dataset.add) { const selected = selections[id]; const product = productFor(id); const variant = variantFor(product, selected.variant); const key = `${id}-${selected.variant}-${selected.size}`; const existing = cart.find((item) => item.key === key); const reserved = cart.filter((item) => item.productId === id && item.variantId === selected.variant).reduce((sum, item) => sum + item.qty, 0); if (reserved >= variant.stock) return; if (existing) existing.qty += 1; else cart.push({ key, productId: id, variantId: selected.variant, size: selected.size, qty: 1 }); renderCart(); renderProducts(); document.getElementById('cartPanel').hidden = false; }
});
document.getElementById('shopGrid').addEventListener('change', (event) => { if (event.target.matches('[data-size]')) selections[event.target.closest('[data-product]').dataset.product].size = event.target.value; });
document.getElementById('cartItems').addEventListener('click', (event) => { const row = event.target.closest('[data-key]'); if (!row) return; const item = cart.find((entry) => entry.key === row.dataset.key); if (event.target.dataset.remove !== undefined) cart = cart.filter((entry) => entry.key !== item.key); else if (event.target.dataset.qty) { const product = productFor(item.productId); const variant = variantFor(product, item.variantId); const reserved = cart.filter((entry) => entry.productId === item.productId && entry.variantId === item.variantId).reduce((sum, entry) => sum + entry.qty, 0); const delta = Number(event.target.dataset.qty); if (delta > 0 && reserved >= variant.stock) return; item.qty += delta; if (item.qty <= 0) cart = cart.filter((entry) => entry.key !== item.key); } renderCart(); renderProducts(); });
document.getElementById('cartButton').addEventListener('click', () => { document.getElementById('cartPanel').hidden = false; });
document.getElementById('closeCart').addEventListener('click', () => { document.getElementById('cartPanel').hidden = true; });
document.getElementById('demoOrder').addEventListener('click', () => { document.getElementById('cartStatus').textContent = 'ORDEN PREPARADA · CONTINÚA CON EL MÉTODO DE PAGO'; });
renderProducts(); renderCart();