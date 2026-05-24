const buyer = requireTriplineSession();
const packages = {
  standard: {
    name: 'STANDARD',
    duration: '// 3 DÍAS DE EXPEDICIÓN',
    price: '$8,500 MXN',
    benefits: ['Guía certificado', 'Campamento equipado', 'Seguro de emergencias']
  },
  extreme: {
    name: 'EXTREME',
    duration: '// 7 DÍAS — MISIÓN COMPLETA',
    price: '$38,000 MXN',
    benefits: ['Transmisión en vivo', 'Cinematic recap 4K', 'Acceso a retos especiales']
  }
};

const selected = new URLSearchParams(window.location.search).get('package');
const packageData = packages[selected] || packages.extreme;

document.getElementById('checkoutPackageName').textContent = packageData.name;
document.getElementById('checkoutPackageDuration').textContent = packageData.duration;
document.getElementById('checkoutPrice').textContent = packageData.price;
document.getElementById('checkoutBenefits').innerHTML = packageData.benefits
  .map((benefit) => `<li>${benefit}</li>`)
  .join('');

document.getElementById('paymentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!buyer) return;
  const orders = getTriplineStore(TRIPLINE_ORDERS_KEY);
  orders.unshift({
    email: buyer.email,
    packageName: packageData.name,
    reference: `TL-${Date.now().toString().slice(-8)}`
  });
  setTriplineStore(TRIPLINE_ORDERS_KEY, orders);
  event.currentTarget.hidden = true;
  document.querySelector('.payment-account').hidden = true;
  document.getElementById('paymentSuccess').hidden = false;
});
