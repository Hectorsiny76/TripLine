const STORE_CART_KEY = 'tripline_demo_cart';
const STORE_ORDERS_KEY = 'tripline_store_orders';
const storeCatalog = {
  shell: { name: 'Signal Shell Jacket', price: 2890, variants: { lime: { label: 'Verde señal', image: 'assets/store/chamarra-lima.png' } } },
  pack: { name: 'Mission Pack', price: 3490, variants: { lime: { label: 'Verde señal', image: 'assets/store/mochila-lima.png' }, black: { label: 'Negro operativo', image: 'assets/store/mochila-negra.png' } } },
  headwear: { name: 'Expedition Headwear', price: 790, variants: { visor: { label: 'Visor deportivo', image: 'assets/store/visor-lima.png' }, classic: { label: 'Gorra clásica', image: 'assets/store/gorra-classic-negra.png' } } }
};

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
const storedCart = getTriplineStore(STORE_CART_KEY);
const cart = Array.isArray(storedCart) ? storedCart.filter((item) => storeCatalog[item?.productId]?.variants[item.variantId] && Number(item.qty) > 0) : [];
const subtotal = cart.reduce((sum, item) => sum + storeCatalog[item.productId].price * item.qty, 0);
const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 199;
const total = subtotal + shipping;
let completedReceipt = null;

function maskName(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => `${part.charAt(0)}${'•'.repeat(Math.max(2, part.length - 1))}`).join(' ');
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return `••••••${digits.slice(-4)}`;
}

async function sha256(value) {
  if (!window.isSecureContext || !window.crypto?.subtle) {
    throw new Error('La huella SHA-256 requiere abrir el sitio mediante HTTPS o localhost.');
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256Bytes(value) {
  const digest = await crypto.subtle.digest('SHA-256', value);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createElectronicSignature(payload) {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const payloadBytes = new TextEncoder().encode(payload);
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    payloadBytes
  );
  const verified = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.publicKey,
    signatureBuffer,
    payloadBytes
  );
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  return {
    algorithm: 'ECDSA P-256 / SHA-256',
    signature: bytesToBase64Url(signatureBuffer),
    publicKey: bytesToBase64Url(publicKeyBuffer),
    publicKeyFingerprint: await sha256Bytes(publicKeyBuffer),
    verified
  };
}

function secureOperationNumber() {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return String(value[0] % 100000000).padStart(8, '0');
}
function secureReference(prefix) {
  const random = new Uint32Array(2);
  crypto.getRandomValues(random);
  return `${prefix}-${new Date().getFullYear()}-${Array.from(random).map((value) => value.toString(36).toUpperCase()).join('').slice(0, 10)}`;
}

function renderOrder() {
  const target = document.getElementById('storeOrderItems');
  if (!cart.length) {
    target.innerHTML = '<div class="store-order-empty"><strong>NO HAY PRODUCTOS</strong><p>Agrega equipo antes de continuar.</p><a class="btn-primary" href="tienda.html">VOLVER A LA TIENDA</a></div>';
    document.querySelector('.store-pay-button').disabled = true;
  } else {
    target.innerHTML = cart.map((item) => {
      const product = storeCatalog[item.productId];
      const variant = product.variants[item.variantId];
      return `<article><img src="${variant.image}" alt=""><div><span>${variant.label} · ${item.size}</span><h3>${product.name}</h3><small>${item.qty} × ${money(product.price)}</small></div><strong>${money(product.price * item.qty)}</strong></article>`;
    }).join('');
  }
  document.getElementById('storeSubtotal').textContent = money(subtotal);
  document.getElementById('storeShipping').textContent = shipping ? money(shipping) : 'GRATIS';
  document.getElementById('storeTotal').textContent = money(total);
}

const session = getTriplineSession();
if (session) {
  document.getElementById('buyerName').value = session.name || '';
  document.getElementById('buyerEmail').value = session.email || '';
}

document.getElementById('storeCheckoutForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!cart.length) return;
  const form = event.currentTarget;
  const status = document.getElementById('checkoutStatus');
  const button = event.submitter;
  const data = new FormData(form);
  const customer = {
    name: String(data.get('name')).trim(),
    email: String(data.get('email')).trim().toLowerCase(),
    phone: String(data.get('phone')).trim()
  };
  const delivery = {
    street: String(data.get('street')).trim(),
    neighborhood: String(data.get('neighborhood')).trim(),
    city: String(data.get('city')).trim(),
    state: String(data.get('state')).trim(),
    postalCode: String(data.get('postalCode')).trim(),
    deliveryNotes: String(data.get('deliveryNotes')).trim()
  };
  const paymentMethod = String(data.get('paymentMethod'));
  button.disabled = true;
  button.textContent = 'VALIDANDO INTEGRIDAD…';
  status.textContent = '';
  try {
    const dateIso = new Date().toISOString();
    const reference = secureReference('TLG');
    const paymentToken = `demo_${secureReference('tok').toLowerCase()}`;
    const deliveryHash = await sha256(JSON.stringify(delivery));
    const receiptBase = {
      reference,
      dateIso,
      items: cart.map((item) => ({ productId: item.productId, variantId: item.variantId, size: item.size, qty: item.qty, unitPrice: storeCatalog[item.productId].price })),
      subtotal,
      shipping,
      total,
      paymentMethod,
      paymentToken,
      customerHash: await sha256(JSON.stringify(customer)),
      deliveryHash
    };
    const authorization = {
      code: secureReference('AUT'),
      operationNumber: secureOperationNumber(),
      terminal: 'WEB-MTY-001',
      merchantId: 'TLMX-WEB-2026',
      status: 'PAGO DEMO AUTORIZADO',
      authorizedAt: dateIso
    };
    const signedReceiptBase = { ...receiptBase, authorization };
    const integrityHash = await sha256(JSON.stringify(signedReceiptBase));
    const electronicSignature = await createElectronicSignature(JSON.stringify({ ...signedReceiptBase, integrityHash }));
    completedReceipt = { ...signedReceiptBase, integrityHash, electronicSignature, customer, delivery };
    const safeOrder = {
      ...signedReceiptBase,
      integrityHash,
      electronicSignature,
      customer: { name: maskName(customer.name), email: maskEmail(customer.email), phone: maskPhone(customer.phone) },
      delivery: { hash: deliveryHash },
      status: 'PAGO DEMO AUTORIZADO'
    };
    const orders = getTriplineStore(STORE_ORDERS_KEY);
    orders.unshift(safeOrder);
    setTriplineStore(STORE_ORDERS_KEY, orders.slice(0, 30));
    localStorage.removeItem(STORE_CART_KEY);
    renderReceipt(completedReceipt);
  } catch (error) {
    status.textContent = error.message || 'No fue posible validar el pedido.';
    button.disabled = false;
    button.textContent = 'PROCEDER CON EL PAGO SEGURO';
  }
});

function renderReceipt(receipt) {
  document.getElementById('checkoutWorkspace').hidden = true;
  document.querySelector('.store-checkout-heading').hidden = true;
  const stage = document.getElementById('receiptStage');
  stage.hidden = false;
  document.getElementById('receiptReference').textContent = receipt.reference;
  document.getElementById('receiptDate').textContent = new Date(receipt.dateIso).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
  document.getElementById('receiptCustomer').textContent = `${receipt.customer.name} · ${maskEmail(receipt.customer.email)}`;
  document.getElementById('receiptMethod').textContent = receipt.paymentMethod;
  document.getElementById('receiptItems').innerHTML = receipt.items.map((item) => {
    const product = storeCatalog[item.productId];
    const variant = product.variants[item.variantId];
    return `<div class="receipt-item-row"><span><strong>${product.name}</strong><small>${variant.label} · ${item.size}</small></span><b>${item.qty}</b><strong>${money(item.qty * item.unitPrice)}</strong></div>`;
  }).join('');
  const address = [receipt.delivery.street, receipt.delivery.neighborhood, receipt.delivery.city, receipt.delivery.state, `C.P. ${receipt.delivery.postalCode}`].filter(Boolean).join(', ');
  document.getElementById('receiptAddress').textContent = address;
  document.getElementById('receiptSubtotal').textContent = money(receipt.subtotal);
  document.getElementById('receiptShipping').textContent = receipt.shipping ? money(receipt.shipping) : 'Incluido';
  document.getElementById('receiptTotal').textContent = money(receipt.total);
  document.getElementById('receiptAuthorization').textContent = receipt.authorization.code;
  document.getElementById('receiptOperation').textContent = receipt.authorization.operationNumber;
  document.getElementById('receiptTerminal').textContent = receipt.authorization.terminal;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pdfSafeText(value) {
  return String(value ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[·•]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapPdfText(text, font, size, maxWidth) {
  const source = pdfSafeText(text);
  if (!source) return [''];
  const lines = [];
  let current = '';
  const pushLongWord = (word) => {
    let part = '';
    for (const character of word) {
      const candidate = part + character;
      if (part && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(part);
        part = character;
      } else {
        part = candidate;
      }
    }
    return part;
  };
  source.split(' ').forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = font.widthOfTextAtSize(word, size) > maxWidth ? pushLongWord(word) : word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function drawPdfWrapped(page, text, options) {
  const { x, y, font, size, maxWidth, lineHeight = size * 1.25, color } = options;
  const lines = wrapPdfText(text, font, size, maxWidth);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, font, size, color }));
  return y - lines.length * lineHeight;
}

function downloadPdfBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function receiptAddress(receipt) {
  return [receipt.delivery.street, receipt.delivery.neighborhood, receipt.delivery.city, receipt.delivery.state, `C.P. ${receipt.delivery.postalCode}`].filter(Boolean).join(', ');
}

async function createA4ReceiptPdf(receipt) {
  if (!window.PDFLib) throw new Error('No fue posible cargar el generador PDF local.');
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Recibo TRIP LINE ${receipt.reference}`);
  pdfDoc.setAuthor('TRIP LINE MX, S.A. de C.V.');
  pdfDoc.setSubject('Recibo digital con firma electrónica de integridad');
  pdfDoc.setCreationDate(new Date(receipt.dateIso));
  const page = pdfDoc.addPage([595.28, 841.89]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdfDoc.embedFont(StandardFonts.Courier);
  const monoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const black = rgb(0, 0, 0);
  const gray = rgb(.94, .95, .95);
  const line = rgb(.55, .58, .6);
  const margin = 42;
  const contentWidth = 511.28;
  let y = 800;
  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(1, 1, 1) });
  page.drawText('TRIP LINE MX', { x: margin, y, font: bold, size: 25, color: black });
  page.drawText('FIELD GEAR', { x: margin, y: y - 22, font: regular, size: 14, color: black });
  page.drawText(`FOLIO: ${pdfSafeText(receipt.reference)}`, { x: 330, y: y - 1, font: bold, size: 9, color: black });
  page.drawText(`FECHA: ${pdfSafeText(new Date(receipt.dateIso).toLocaleString('es-MX'))}`, { x: 330, y: y - 17, font: regular, size: 8, color: black });
  y -= 46;
  drawPdfWrapped(page, 'TRIP LINE MX, S.A. DE C.V. - Av. Expedición 2026, Piso 4, Monterrey, N.L., C.P. 64610 - +52 81 0000 2026', { x: margin, y, font: regular, size: 7.5, maxWidth: contentWidth, lineHeight: 9, color: black });
  y -= 24;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 1.2, color: black });
  y -= 12;

  const infoHeight = 54;
  page.drawRectangle({ x: margin, y: y - infoHeight, width: contentWidth, height: infoHeight, color: gray, borderColor: line, borderWidth: .7 });
  const info = [
    ['CLIENTE', `${receipt.customer.name} - ${maskEmail(receipt.customer.email)}`],
    ['MÉTODO DE PAGO', receipt.paymentMethod],
    ['ESTADO DEL PAGO', 'PAGO DEMO AUTORIZADO']
  ];
  const widths = [235, 125, 151.28];
  let infoX = margin;
  info.forEach(([label, value], index) => {
    if (index) page.drawLine({ start: { x: infoX, y: y - infoHeight }, end: { x: infoX, y }, thickness: .5, color: line });
    page.drawText(pdfSafeText(label), { x: infoX + 8, y: y - 14, font: bold, size: 7.5, color: black });
    drawPdfWrapped(page, value, { x: infoX + 8, y: y - 29, font: regular, size: 8.5, maxWidth: widths[index] - 16, lineHeight: 10, color: black });
    infoX += widths[index];
  });
  y -= infoHeight + 18;

  page.drawText('DETALLES DEL PEDIDO / DESGLOSE DE LA COMPRA', { x: margin, y, font: bold, size: 10, color: black });
  y -= 15;
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 20, color: gray, borderColor: line, borderWidth: .7 });
  page.drawText('DESCRIPCIÓN DEL PRODUCTO', { x: margin + 8, y: y - 13, font: bold, size: 7.5, color: black });
  page.drawText('CANTIDAD', { x: margin + 370, y: y - 13, font: bold, size: 7.5, color: black });
  page.drawText('SUBTOTAL', { x: margin + 445, y: y - 13, font: bold, size: 7.5, color: black });
  y -= 20;
  receipt.items.forEach((item) => {
    const product = storeCatalog[item.productId];
    const variant = product.variants[item.variantId];
    const rowHeight = 31;
    page.drawRectangle({ x: margin, y: y - rowHeight, width: contentWidth, height: rowHeight, borderColor: line, borderWidth: .55 });
    page.drawLine({ start: { x: margin + 360, y: y - rowHeight }, end: { x: margin + 360, y }, thickness: .5, color: line });
    page.drawLine({ start: { x: margin + 430, y: y - rowHeight }, end: { x: margin + 430, y }, thickness: .5, color: line });
    page.drawText(pdfSafeText(product.name), { x: margin + 8, y: y - 12, font: bold, size: 8.5, color: black });
    page.drawText(pdfSafeText(`${variant.label} - ${item.size}`), { x: margin + 8, y: y - 24, font: regular, size: 7.5, color: black });
    page.drawText(String(item.qty), { x: margin + 391, y: y - 19, font: regular, size: 9, color: black });
    page.drawText(pdfSafeText(money(item.qty * item.unitPrice)), { x: margin + 440, y: y - 19, font: bold, size: 8.5, color: black });
    y -= rowHeight;
  });
  y -= 14;

  page.drawText('DATOS DE ENTREGA', { x: margin, y, font: bold, size: 9, color: black });
  y = drawPdfWrapped(page, receiptAddress(receipt), { x: margin, y: y - 13, font: regular, size: 8.5, maxWidth: 330, lineHeight: 10, color: black }) - 4;
  page.drawText('RESUMEN DE PAGO', { x: 405, y: y + 27, font: bold, size: 9, color: black });
  page.drawText(`Subtotal: ${pdfSafeText(money(receipt.subtotal))}`, { x: 405, y: y + 13, font: regular, size: 8.5, color: black });
  page.drawText(`Envío: ${receipt.shipping ? pdfSafeText(money(receipt.shipping)) : 'Incluido'}`, { x: 405, y: y + 1, font: regular, size: 8.5, color: black });
  page.drawText(`TOTAL: ${pdfSafeText(money(receipt.total))}`, { x: 405, y: y - 15, font: bold, size: 13, color: black });
  y -= 42;

  const authHeight = 58;
  page.drawText('DATOS DE AUTORIZACIÓN', { x: margin, y, font: bold, size: 10.5, color: black });
  y -= 10;
  page.drawRectangle({ x: margin, y: y - authHeight, width: contentWidth, height: authHeight, color: gray, borderColor: line, borderWidth: .8 });
  page.drawText(`NO. AUTORIZACIÓN: ${pdfSafeText(receipt.authorization.code)}`, { x: margin + 9, y: y - 17, font: bold, size: 8.5, color: black });
  page.drawText(`NO. OPERACIÓN: ${receipt.authorization.operationNumber}`, { x: margin + 280, y: y - 17, font: bold, size: 8.5, color: black });
  page.drawText(`TERMINAL: ${receipt.authorization.terminal}`, { x: margin + 9, y: y - 36, font: regular, size: 8.5, color: black });
  page.drawText(`ESTADO: ${receipt.authorization.status}`, { x: margin + 280, y: y - 36, font: bold, size: 8.5, color: black });
  y -= authHeight + 18;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: .7, color: line });
  page.drawText('OPERACIÓN DEMOSTRATIVA - COMPROBANTE DIGITAL', { x: margin, y: y - 15, font: bold, size: 8, color: black });
  page.drawText('© 2026 TRIP LINE MX - RECIBO DIGITAL', { x: margin, y: 24, font: regular, size: 7.5, color: black });
  return pdfDoc.save();
}

async function createThermalTicketPdf(receipt) {
  if (!window.PDFLib) throw new Error('No fue posible cargar el generador PDF local.');
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Ticket TRIP LINE ${receipt.reference}`);
  pdfDoc.setAuthor('TRIP LINE MX, S.A. de C.V.');
  pdfDoc.setSubject('Ticket térmico con firma electrónica de integridad');
  const regular = await pdfDoc.embedFont(StandardFonts.Courier);
  const bold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const width = 226.77;
  const height = 420 + receipt.items.length * 28;
  const page = pdfDoc.addPage([width, height]);
  const black = rgb(0, 0, 0);
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  const margin = 13;
  const maxWidth = width - margin * 2;
  let y = height - 26;
  const center = (text, font, size) => {
    const safe = pdfSafeText(text);
    page.drawText(safe, { x: Math.max(margin, (width - font.widthOfTextAtSize(safe, size)) / 2), y, font, size, color: black });
    y -= size + 5;
  };
  const row = (text, font = regular, size = 7.4, lineHeight = 9.2) => {
    const lines = wrapPdfText(text, font, size, maxWidth);
    lines.forEach((line) => { page.drawText(line, { x: margin, y, font, size, color: black }); y -= lineHeight; });
  };
  const rule = () => { page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: .6, color: black }); y -= 10; };
  center('TRIP LINE MX', bold, 14);
  center('FIELD GEAR', bold, 9);
  center('TRIP LINE MX, S.A. DE C.V.', regular, 6.7);
  center('AV. EXPEDICION 2026, MONTERREY, N.L.', regular, 6.4);
  center('+52 81 0000 2026', regular, 6.4);
  y -= 3; rule();
  row(`FOLIO: ${receipt.reference}`, bold);
  row(`FECHA: ${new Date(receipt.dateIso).toLocaleString('es-MX')}`);
  row(`CLIENTE: ${receipt.customer.name}`);
  row(`CORREO: ${maskEmail(receipt.customer.email)}`);
  row(`METODO: ${receipt.paymentMethod}`);
  y -= 3; rule();
  center('DETALLE DE COMPRA', bold, 8.3);
  receipt.items.forEach((item) => {
    const product = storeCatalog[item.productId];
    const variant = product.variants[item.variantId];
    row(`${item.qty} X ${product.name}`, bold);
    row(`${variant.label} / ${item.size}`);
    row(`IMPORTE: ${money(item.qty * item.unitPrice)}`, bold);
    y -= 3;
  });
  rule();
  row(`SUBTOTAL: ${money(receipt.subtotal)}`);
  row(`ENVIO: ${receipt.shipping ? money(receipt.shipping) : 'INCLUIDO'}`);
  row(`TOTAL M.N.: ${money(receipt.total)}`, bold, 9);
  y -= 3; rule();
  row(`NO. OPERACION: ${receipt.authorization.operationNumber}`);
  row(`NO. AUTORIZACION: ${receipt.authorization.code}`, bold);
  row(`TERMINAL: ${receipt.authorization.terminal}`);
  row(`ID COMERCIO: ${receipt.authorization.merchantId}`);
  row(`ESTADO: ${receipt.authorization.status}`, bold);
  y -= 3;
  row('EL TITULAR CONFIRMA LA ORDEN Y AUTORIZA EL REGISTRO DE ESTA OPERACIÓN DEMOSTRATIVA.', regular, 6.8, 8.4);
  y -= 3; rule();
  center('OPERACIÓN DEMO REGISTRADA', bold, 7.8);
  center('© 2026 TRIP LINE MX', regular, 6.8);
  return pdfDoc.save();
}

async function runReceiptDownload(button, createPdf, filenamePrefix) {
  if (!completedReceipt) return;
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = 'GENERANDO...';
  try {
    const bytes = await createPdf(completedReceipt);
    downloadPdfBytes(bytes, `${filenamePrefix}-${completedReceipt.reference}.pdf`);
  } catch (error) {
    document.getElementById('checkoutStatus').textContent = error.message || 'No fue posible generar el PDF.';
  } finally {
    button.disabled = false;
    button.textContent = previous;
  }
}

document.getElementById('printReceipt').addEventListener('click', () => window.print());
document.getElementById('downloadPdf').addEventListener('click', (event) => runReceiptDownload(event.currentTarget, createA4ReceiptPdf, 'tripline-recibo-a4'));
document.getElementById('downloadReceipt').addEventListener('click', (event) => runReceiptDownload(event.currentTarget, createThermalTicketPdf, 'tripline-ticket'));

renderOrder();