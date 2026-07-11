const archiveDefaults = [
 { title: 'Ascenso glaciar', destination: 'Pico de Orizaba', category: 'montaña', duration: '42:18', imageClass: 'destino-bg--orizaba' },
 { title: 'Cascadas al límite', destination: 'Huasteca Potosina', category: 'agua', duration: '35:09', imageClass: 'destino-bg--huasteca' },
 { title: 'Bajo el Mar de Cortés', destination: 'Isla Espíritu Santo', category: 'agua', duration: '28:44', imageClass: 'destino-bg--espiritu' },
 { title: 'Cruce sin señal', destination: 'Zona del Silencio', category: 'desierto', duration: '51:02', imageClass: 'destino-bg--silencio' },
 { title: 'Ruta Lacandona', destination: 'Selva Lacandona', category: 'selva', duration: '46:31', imageClass: 'destino-bg--lacandona' }
];
let activeFilter = 'all';
function savedVods() { try { return JSON.parse(localStorage.getItem('tripline_vod')) || []; } catch (_) { return []; } }
function renderArchive() {
 const local = savedVods().map((item) => ({ ...item, destination: 'Grabación local', category: 'montaña', imageClass: 'destino-bg--orizaba' }));
 const items = [...local, ...archiveDefaults].filter((item) => activeFilter === 'all' || item.category === activeFilter);
 document.getElementById('archiveGrid').innerHTML = items.map((item, index) => `<article class="archive-card"><div class="archive-media ${item.imageClass}"><span>${item.duration || 'VOD'}</span></div><div><p>${item.destination}</p><h2>${item.title}</h2><button type="button" class="btn-ghost" data-play="${index}">VER RESUMEN</button></div></article>`).join('');
}
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('is-active')); button.classList.add('is-active'); activeFilter = button.dataset.filter; renderArchive(); }));
document.getElementById('archiveGrid').addEventListener('click', (event) => { if (event.target.matches('[data-play]')) event.target.textContent = 'REPRODUCCIÓN · PRÓXIMAMENTE'; });
renderArchive();