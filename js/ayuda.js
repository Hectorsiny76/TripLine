document.getElementById('contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const requests = getTriplineStore('tripline_demo_support');
  requests.unshift({ ...data, id: `SUP-${Date.now().toString().slice(-6)}`, status: 'RECIBIDA', createdAt: new Date().toISOString() });
  setTriplineStore('tripline_demo_support', requests.slice(0, 20));
  event.currentTarget.reset();
  document.getElementById('contactStatus').textContent = 'SOLICITUD RECIBIDA · EL EQUIPO DE OPERACIONES TE CONTACTARÁ PRONTO.';
});