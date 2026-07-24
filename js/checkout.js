window.addEventListener("triplineDataLoaded", function() {
 const buyer = requireTriplineSession();
 const catalog = window.TRIPLINE_DATA;
 const params = new URLSearchParams(location.search);

 console.log("params", params);

 const destinationSlug = catalog.destinations[params.get('destination')] ? params.get('destination') : 'huasteca-potosina';
 const destination = catalog.destinations[destinationSlug];
 const packageKey = catalog.packages[params.get('package')] ? params.get('package') : 'extreme';
 const packageData = catalog.packages[packageKey];
 console.log("packageData", packageData);
 const travelers = Math.min(4, Math.max(1, Number(params.get('travelers')) || 1));
 const departureDate = new Date(Object.values(destination.dates).includes(params.get('date')) ? params.get('date') : destination.dates[0].date);
 const total = Math.round(destination.base_price * packageData.multiplier * travelers);
 let confirmedOrder = null;
 const documentTemplates = {
  ticket: 'assets/tripline-ticket-simulado.pdf',
  boardingPass: 'assets/tripline-boleto-simulado.pdf'
 };
 const money = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
 }).format(value);

 console.log("duracion ", destination.duration_days);

 document.getElementById('checkoutPackageName').textContent = `${destination.name} · ${packageData.name}`.toUpperCase();
 document.getElementById('checkoutPackageDuration').textContent = `// ${destination.duration_days} DÍAS · ${destination.region.toUpperCase()}`;
 document.getElementById('checkoutPrice').textContent = money(total);
 document.getElementById('checkoutTripMeta').innerHTML = `<span>SALIDA <strong>${new Date(`${departureDate}`).toLocaleDateString('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
 })}</strong></span><span>VIAJEROS <strong>${travelers}</strong></span><span>OPERADOR <strong>${destination.operator.name}</strong></span>`;
 document.getElementById('checkoutBenefits').innerHTML = [...destination.activities, packageData.description, 'Confirmación y documentos inmediatos'].map((item) => `<li>${item}</li>`).join('');

 document.getElementById('paymentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!buyer) return;
  const button = event.submitter;
  button.disabled = true;
  button.textContent = 'TOKENIZANDO…';
  const now = new Date();
  const sensitiveDemo = `4242424242424242|123|${now.toISOString()}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sensitiveDemo));
  const fingerprint = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  confirmedOrder = {
   name: buyer.name,
   email: buyer.email,
   destinationSlug,
   destinationName: destination.name,
   region: destination.region,
   operator: destination.operator.name,
   departureDate,
   travelers,
   packageName: packageData.name.toUpperCase(),
   duration: `${destination.duration_days} días`,
   price: money(total),
   total,
   benefits: [...destination.activities],
   reference: `TRP-${now.getFullYear()}-${Date.now().toString().slice(-7)}`,
   dateIso: now.toISOString(),
   status: 'CONFIRMADA', //
   paymentToken: `sha256:${fingerprint}`
  };
  const orders = getTriplineStore(TRIPLINE_ORDERS_KEY);
  orders.unshift(confirmedOrder);
  setTriplineStore(TRIPLINE_ORDERS_KEY, orders);
  // event.currentTarget.reset();
  // event.currentTarget.hidden = true;
  document.querySelector('.payment-account').hidden = true;
  document.getElementById('paymentSuccess').hidden = false;
  document.getElementById('documentActions').hidden = false;
 });

 document.getElementById('downloadTicket').addEventListener('click', () => downloadStaticDocument(documentTemplates.ticket, `tripline-ticket-${confirmedOrder?.reference || 'demo'}.pdf`));
 document.getElementById('downloadBoardingPass').addEventListener('click', () => downloadStaticDocument(documentTemplates.boardingPass, `tripline-boleto-${confirmedOrder?.reference || 'demo'}.pdf`));

 function downloadStaticDocument(path, filename) {
  const link = document.createElement('a');
  link.href = path;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
 }
});