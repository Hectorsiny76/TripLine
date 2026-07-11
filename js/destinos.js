const destinations = {
  'espiritu-santo': {
    name: 'ISLA ESPÃRITU SANTO',
    type: 'BUCEO EXTREMO + KAYAK',
    lead: 'AtrÃ©vete a explorar nuevos desafÃ­os entre aguas cristalinas, lobos marinos y cuevas costeras. Vive una experiencia Ãºnica diseÃ±ada para los aventureros que quieren llegar mÃ¡s lejos.',
    difficulty: 'ALTA',
    duration: '5 DÃAS',
    region: 'BAJA CALIFORNIA SUR',
    image: "url('../assets/espiritu santo.jpg')"
  },
  'selva-lacandona': {
    name: 'SELVA LACANDONA',
    type: 'SURVIVAL + JUNGLE TREK',
    lead: 'Entra a la selva mÃ¡s intensa de MÃ©xico y aprende a avanzar entre rÃ­os, ruinas y vegetaciÃ³n indomable. Una misiÃ³n para quienes buscan descubrir lo desconocido.',
    difficulty: 'EXTREMA',
    duration: '7 DÃAS',
    region: 'CHIAPAS',
    image: "url('../assets/lacandon-wingsuit.png')"
  },
  'zona-silencio': {
    name: 'ZONA DEL SILENCIO',
    type: 'DESIERTO + ANOMALÃA',
    lead: 'Cruza un territorio Ã¡rido donde la seÃ±al desaparece y la orientaciÃ³n se vuelve parte del reto. Calor, aislamiento y aventura pura para exploradores decididos.',
    difficulty: 'EXTREMA',
    duration: '4 DÃAS',
    region: 'DURANGO',
    image: "url('../assets/ZONA-DEL-SILENCIO.jpg')"
  },
  'huasteca-potosina': {
    name: 'HUASTECA POTOSINA',
    type: 'RAPPEL + CASCADAS + CUEVA',
    lead: 'Desciende por cascadas turquesa, atraviesa caÃ±ones y descubre cavernas escondidas. Naturaleza espectacular con desafÃ­os que convierten cada dÃ­a en historia.',
    difficulty: 'ALTA',
    duration: '6 DÃAS',
    region: 'SAN LUIS POTOSÃ',
    image: "url('../assets/huasteca.jpg')"
  },
  'pico-orizaba': {
    name: 'PICO DE ORIZABA',
    type: 'ALTA MONTAÃ‘A + WINGSUIT',
    lead: 'Supera el ascenso al volcÃ¡n mÃ¡s alto de MÃ©xico y experimenta la montaÃ±a en su forma mÃ¡s radical. Hielo, altura y vistas reservadas para los mÃ¡s valientes.',
    difficulty: 'EXTREMA',
    duration: '10 DÃAS',
    region: 'VERACRUZ',
    image: "url('../assets/MontaÃ±a.jpg')"
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

document.getElementById('destinationBookingLink')?.setAttribute('href', 'reserva.html?destino=' + activeSlug);
