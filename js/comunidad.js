const currentUser = requireTriplineSession();
const defaultLives = [
  { title: 'Cascadas al límite', destination: 'Huasteca Potosina', creator: 'Marina Ríos', viewers: 214, imageClass: 'destino-bg--huasteca' },
  { title: 'Cruce del desierto', destination: 'Zona del Silencio', creator: 'Aldo Vega', viewers: 97, imageClass: 'destino-bg--silencio' },
  { title: 'Ascenso glaciar', destination: 'Pico de Orizaba', creator: 'Luna Torres', viewers: 452, imageClass: 'destino-bg--orizaba' }
];

let preparedLive = null;

function imageClassFor(destination) {
  return {
    'Isla Espíritu Santo': 'destino-bg--espiritu',
    'Selva Lacandona': 'destino-bg--lacandona',
    'Zona del Silencio': 'destino-bg--silencio',
    'Huasteca Potosina': 'destino-bg--huasteca',
    'Pico de Orizaba': 'destino-bg--orizaba'
  }[destination] || 'destino-bg--lacandona';
}

function renderLives() {
  const ownLives = getTriplineStore(TRIPLINE_LIVES_KEY);
  const allLives = [...ownLives, ...defaultLives];
  document.getElementById('communityGrid').innerHTML = allLives.map((live, index) => `
    <article class="community-live-card">
      <div class="community-live-media ${live.imageClass}"></div>
      <div class="community-live-badge"><span></span> LIVE</div>
      <div class="community-live-body">
        <p>${live.destination}</p>
        <h3>${live.title}</h3>
        <div><span>${live.creator}</span><span>${live.viewers || (33 + index * 11)} VIEWERS</span></div>
      </div>
    </article>
  `).join('');
}

function renderOrders() {
  const orders = getTriplineStore(TRIPLINE_ORDERS_KEY).filter((order) => order.email === currentUser.email);
  const target = document.getElementById('ordersList');
  if (!orders.length) {
    target.innerHTML = '<p class="empty-state">Aún no tienes misiones reservadas. Elige un paquete para probar el checkout.</p><a class="btn-ghost" href="index.html#paquetes">VER PAQUETES</a>';
    return;
  }
  target.innerHTML = orders.map((order) => `
    <div class="order-row">
      <strong>${order.packageName}</strong>
      <span>${order.reference}</span>
      <span class="order-status">CONFIRMADA</span>
    </div>
  `).join('');
}

document.getElementById('openLiveComposer').addEventListener('click', () => {
  document.getElementById('creatorPanel').hidden = false;
});

document.getElementById('closeLiveComposer').addEventListener('click', () => {
  document.getElementById('creatorPanel').hidden = true;
});

document.getElementById('liveForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = form.get('title').trim();
  const destination = form.get('destination');
  const slug = currentUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'explorer';
  preparedLive = {
    title,
    destination,
    creator: currentUser.name,
    viewers: 1,
    imageClass: imageClassFor(destination)
  };
  document.getElementById('setupServer').textContent = 'rtmp://tripline-demo/live';
  document.getElementById('setupKey').textContent = `${slug}-${Date.now().toString().slice(-6)}`;
  document.getElementById('streamSetup').hidden = false;
});

document.getElementById('publishDemoLive').addEventListener('click', () => {
  if (!preparedLive) return;
  const lives = getTriplineStore(TRIPLINE_LIVES_KEY);
  lives.unshift(preparedLive);
  setTriplineStore(TRIPLINE_LIVES_KEY, lives.slice(0, 6));
  preparedLive = null;
  document.getElementById('liveForm').reset();
  document.getElementById('streamSetup').hidden = true;
  document.getElementById('creatorPanel').hidden = true;
  renderLives();
});

document.getElementById('logoutButton').addEventListener('click', () => {
  clearTriplineSession();
  window.location.href = 'login.html?next=comunidad.html';
});

if (currentUser) {
  refreshAuthNavigation();
  renderLives();
  renderOrders();
}
