window.addEventListener("triplineDataLoaded", function() {
  const catalog = window.TRIPLINE_DATA;

  console.log("catalog variable", catalog);

  const destinations = Object.entries(catalog.destinations);

  console.log("destinations data", destinations);

  const packages = Object.entries(catalog.packages);

  console.log("packages descripcion", packages);

  const destinationSelect = document.getElementById('bookingDestination');
  const dateSelect = document.getElementById('bookingDate');
  const packageSelect = document.getElementById('packagesAvailable');
  const form = document.getElementById('bookingForm');

  const params = new URLSearchParams(location.search);

  const requestedSlug = params.get('destino');
  const requestedPackage = params.get('package');

  destinationSelect.innerHTML = Object.entries(catalog.destinations).map(([slug, item]) => `<option value="${slug}" >${item.name} — ${item.region}</option>`).join('');
  if (catalog.destinations[requestedSlug]) destinationSelect.value = requestedSlug;
  packageSelect.innerHTML = Object.entries(catalog.packages).map(([slug, item], index) => `<label class="package-choice"><input type="radio" name="package" ${index === 0 ? 'checked' : ''} value="${slug}"><span><strong>${item.name}</strong><small>${item.description}</small></span></label>`).join('');
  if (catalog.packages[requestedPackage]) form.elements.package.value = requestedPackage;

  function formatMoney(value) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value); }

  function refreshBooking() {
    const destination = catalog.destinations[destinationSelect.value];
    console.log("desitno fechas",destination);
    console.log("capacidad de destino", destination.capacity);
    const previousDate = dateSelect.value;
    dateSelect.innerHTML = destination.dates.map((date, index) => {

      console.log(date);

      return `<option value="${date.date}">${new Date(`${date.date}`).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })} · ${Math.max(2, destination.capacity - index * 2)} cupos</option>`
    }).join('');
    if ([...dateSelect.options].some((option) => option.value === previousDate)) dateSelect.value = previousDate;
    const travelers = Number(form.travelers.value);

    const packageKey = new FormData(form).get('package');
    console.log('precio', destination.base_price);
    console.log("llave", packageKey);
    console.log('package nombre', catalog.packages[packageKey].multiplier);
    console.log(travelers);
    const total = Math.round(destination.base_price * catalog.packages[packageKey].multiplier * travelers);
    document.getElementById('bookingRoute').textContent = `${destination.name} · ${destination.duration_days} días · ${travelers} viajero${travelers > 1 ? 's' : ''}`;
    document.getElementById('bookingTotal').textContent = formatMoney(total);
    document.getElementById('bookingCapacity').textContent = `Grupo máximo: ${destination.capacity} · Operador: ${destination.operator.name}`;
  }
  destinationSelect.addEventListener('change', refreshBooking);
  form.addEventListener('change', refreshBooking);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const query = new URLSearchParams({ destination: data.get('destination'), date: data.get('date'), travelers: data.get('travelers'), package: data.get('package') });
    location.href = `checkout.html?${query}`;
  });
  refreshBooking();
});