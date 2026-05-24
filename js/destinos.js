const destinations = {
  'espiritu-santo': {
    name: 'ISLA ESPÍRITU SANTO',
    type: 'BUCEO EXTREMO + KAYAK',
    lead: 'Atrévete a explorar nuevos desafíos entre aguas cristalinas, lobos marinos y cuevas costeras. Vive una experiencia única diseñada para los aventureros que quieren llegar más lejos.',
    difficulty: 'ALTA',
    duration: '5 DÍAS',
    region: 'BAJA CALIFORNIA SUR',
    image: "url('../assets/espiritu santo.jpg')"
  },
  'selva-lacandona': {
    name: 'SELVA LACANDONA',
    type: 'SURVIVAL + JUNGLE TREK',
    lead: 'Entra a la selva más intensa de México y aprende a avanzar entre ríos, ruinas y vegetación indomable. Una misión para quienes buscan descubrir lo desconocido.',
    difficulty: 'EXTREMA',
    duration: '7 DÍAS',
    region: 'CHIAPAS',
    image: "url('../assets/lacandon-wingsuit.png')"
  },
  'zona-silencio': {
    name: 'ZONA DEL SILENCIO',
    type: 'DESIERTO + ANOMALÍA',
    lead: 'Cruza un territorio árido donde la señal desaparece y la orientación se vuelve parte del reto. Calor, aislamiento y aventura pura para exploradores decididos.',
    difficulty: 'EXTREMA',
    duration: '4 DÍAS',
    region: 'DURANGO',
    image: "url('../assets/Zona-del-silencio.jpg')"
  },
  'huasteca-potosina': {
    name: 'HUASTECA POTOSINA',
    type: 'RAPPEL + CASCADAS + CUEVA',
    lead: 'Desciende por cascadas turquesa, atraviesa cañones y descubre cavernas escondidas. Naturaleza espectacular con desafíos que convierten cada día en historia.',
    difficulty: 'ALTA',
    duration: '6 DÍAS',
    region: 'SAN LUIS POTOSÍ',
    image: "url('../assets/huasteca.jpg')"
  },
  'pico-orizaba': {
    name: 'PICO DE ORIZABA',
    type: 'ALTA MONTAÑA + WINGSUIT',
    lead: 'Supera el ascenso al volcán más alto de México y experimenta la montaña en su forma más radical. Hielo, altura y vistas reservadas para los más valientes.',
    difficulty: 'EXTREMA',
    duration: '10 DÍAS',
    region: 'VERACRUZ',
    image: "url('../assets/montaña.jpg')"
  }
};

const selectedSlug = new URLSearchParams(window.location.search).get('destino');
const activeSlug = destinations[selectedSlug] ? selectedSlug : 'espiritu-santo';
const active = destinations[activeSlug];

document.title = `${active.name} | TRIP LINE`;
document.getElementById('destinationImage').style.setProperty('--detail-image', active.image);
document.getElementById('destinationName').textContent = active.name;
document.getElementById('destinationType').textContent = active.type;
document.getElementById('destinationLead').textContent = active.lead;
document.getElementById('destinationDifficulty').textContent = active.difficulty;
document.getElementById('destinationDuration').textContent = active.duration;
document.getElementById('destinationRegion').textContent = active.region;
document.querySelector(`[data-destination="${activeSlug}"]`)?.classList.add('is-active');
