const catalog = window.TRIPLINE_DATA;
const destinationSelect = document.getElementById('bookingDestination');
const dateSelect = document.getElementById('bookingDate');
const form = document.getElementById('bookingForm');
const params = new URLSearchParams(location.search);
const requestedSlug = params.get('destino');
const requestedPackage = params.get('package');

destinationSelect.innerHTML = Object.entries(catalog.destinations).map(([slug, item]) => `<option value="${slug}">${item.name} — ${item.region}</option>`).join('');
if (catalog.destinations[requestedSlug]) destinationSelect.value = requestedSlug;
document.getElementById('standardDescription').textContent = catalog.packages.standard.description;
document.getElementById('extremeDescription').textContent = catalog.packages.extreme.description;
if (catalog.packages[requestedPackage]) form.elements.package.value = requestedPackage;

function formatMoney(value) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value); }
function refreshBooking() {
  const destination = catalog.destinations[destinationSelect.value];
  const previousDate = dateSelect.value;
  dateSelect.innerHTML = destination.dates.map((date, index) => `<option value="${date}">${new Date(`${date}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} · ${Math.max(2, destination.capacity - index * 2)} cupos</option>`).join('');
  if ([...dateSelect.options].some((option) => option.value === previousDate)) dateSelect.value = previousDate;
  const travelers = Number(form.travelers.value);
  const packageKey = new FormData(form).get('package');
  const total = Math.round(destination.basePrice * catalog.packages[packageKey].multiplier * travelers);
  document.getElementById('bookingRoute').textContent = `${destination.name} · ${destination.duration} días · ${travelers} viajero${travelers > 1 ? 's' : ''}`;
  document.getElementById('bookingTotal').textContent = formatMoney(total);
  document.getElementById('bookingCapacity').textContent = `Grupo máximo: ${destination.capacity} · Operador: ${destination.operator}`;
}
destinationSelect.addEventListener('change', refreshBooking);
form.addEventListener('change', refreshBooking);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const query = new URLSearchParams({ destino: data.get('destination'), date: data.get('date'), travelers: data.get('travelers'), package: data.get('package') });
  location.href = `checkout.html?${query}`;
});
refreshBooking();