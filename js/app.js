
// ── CURSOR ─────────────────────────────────────
const ring = document.getElementById('cursorRing');
const dot = document.getElementById('cursorDot');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  requestAnimationFrame(animCursor);
})();
document.querySelectorAll('a,button,.btn-primary,.btn-ghost,.destino-card,.stream-card-small,.vod-entry').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='50px'; ring.style.height='50px'; ring.style.borderColor='#fff'; });
  el.addEventListener('mouseleave', () => { ring.style.width='32px'; ring.style.height='32px'; ring.style.borderColor='var(--neon)'; });
});

// ══════════════════════════════════════════════
// 🎥 CONFIGURACIÓN DE STREAMS — EDITA AQUÍ
// ══════════════════════════════════════════════
const MEDIA_SERVER_HOST =
  window.location.protocol === 'file:' || !window.location.hostname
    ? '192.168.100.14'
    : window.location.hostname;
const HLS_BASE_URL = `http://${MEDIA_SERVER_HOST}:8888`;

const STREAM_1_URL = `${HLS_BASE_URL}/live/aventura1/index.m3u8`;
const STREAM_2_URL = `${HLS_BASE_URL}/live/selva/index.m3u8`;

const STREAM_3_URL =
'';

const endpointEl = document.getElementById('stream-endpoint');
if (endpointEl) {
  endpointEl.textContent = `${MEDIA_SERVER_HOST}:8888 — aventura1`;
}

// ── VOD STORAGE ────────────────────────────────
// Saved streams are stored in localStorage as JSON array
const VOD_KEY = 'tripline_vod';
function getVODs() {
  try { return JSON.parse(localStorage.getItem(VOD_KEY)) || []; }
  catch(e) { return []; }
}
function saveVOD(entry) {
  const vods = getVODs();
  vods.unshift(entry); // newest first
  if (vods.length > 20) vods.pop(); // keep max 20
  localStorage.setItem(VOD_KEY, JSON.stringify(vods));
}
function renderVODs() {
  const list = document.getElementById('vod-list');
  const vods = getVODs();
  if (!list) return;
  if (vods.length === 0) {
    list.innerHTML = '<div style="font-family:var(--font-hud);font-size:.55rem;color:var(--text-dim);letter-spacing:2px;text-align:center;padding:1rem;">NO HAY GRABACIONES AÚN</div>';
    return;
  }
  list.innerHTML = vods.map((v, i) => `
    <div class="vod-entry" onclick="playVOD('${v.url}','${v.title}')">
      <div>
        <div style="font-size:.65rem;letter-spacing:2px;">${v.title}</div>
        <div style="color:var(--text-dim);font-size:.5rem;margin-top:.2rem;">${v.date} · ${v.duration}</div>
      </div>
      <button class="vod-play-btn">▶ VER</button>
    </div>
  `).join('');
}

// ── HLS PLAYER ─────────────────────────────────
const video = document.getElementById('main-video');
const streamUrl = STREAM_1_URL;
const HLS_AVAILABLE = typeof Hls !== 'undefined';

let hls = null;
let isLive = false;
let liveStartTime = null;
let retryCount = 0;
let retryTimer = null;
const MAX_RETRIES = 999; // keep trying forever while page is open
const RETRY_DELAY = 5000;

const elConnecting = document.getElementById('stream-connecting');
const elOffline = document.getElementById('stream-offline');
const elControls = document.getElementById('stream-controls');
const elUnmute = document.getElementById('unmute-overlay');
const elStatus = document.getElementById('connect-status');
const elPlayBtn = document.getElementById('play-btn');

function showConnecting(msg) {
  elConnecting.style.display = 'flex';
  elOffline.style.display = 'none';
  elControls.style.display = 'none';
  if (elStatus) elStatus.textContent = msg || 'CONECTANDO SEÑAL...';
}
function showLive() {
  elConnecting.style.display = 'none';
  elOffline.style.display = 'none';
  elControls.style.display = 'flex';
}
function showOffline() {
  elConnecting.style.display = 'none';
  elOffline.style.display = 'flex';
  elControls.style.display = 'none';
  renderVODs();
}

function onStreamStarted() {
  isLive = true;
  liveStartTime = liveStartTime || new Date();
  retryCount = 0;
  clearTimeout(retryTimer);
  showLive();

  // Try unmuting (browser may block)
  video.muted = false;
  video.volume = 1;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Browser blocked autoplay with sound — show unmute overlay
      video.muted = true;
      video.play();
      elUnmute.style.display = 'flex';
    });
  }
}

function onStreamEnded() {
  if (isLive && liveStartTime) {
    // Save to VOD
    const endTime = new Date();
    const dur = Math.floor((endTime - liveStartTime) / 1000);
    const h = Math.floor(dur/3600), m = Math.floor((dur%3600)/60), s = dur%60;
    saveVOD({
      url: streamUrl,
      title: `WINGSUIT — PICO DE ORIZABA`,
      date: liveStartTime.toLocaleDateString('es-MX', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),
      duration: `${h>0?h+'h ':' '}${m}m ${s}s`
    });
  }
  isLive = false;
  showOffline();
  scheduleRetry();
}

function scheduleRetry() {
  if (retryCount >= MAX_RETRIES) return;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    retryCount++;
    elStatus && (elStatus.textContent = `INTENTANDO RECONECTAR... (${retryCount})`);
    initHLS();
  }, RETRY_DELAY);
}

function initHLS() {
  if (!HLS_AVAILABLE) {
    elStatus && (elStatus.textContent = 'MODO PREVIEW — PLAYER HLS NO DISPONIBLE');
    renderVODs();
    return;
  }
  if (hls) { hls.destroy(); hls = null; }

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      xhrSetup: function(xhr) {
        xhr.withCredentials = false;
      }
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => { onStreamStarted(); });
    hls.on(Hls.Events.MEDIA_ATTACHED, () => { showConnecting('SEÑAL DETECTADA — CARGANDO...'); });

    hls.on(Hls.Events.ERROR, (event, data) => {
      const isWaitingForSignal =
        data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
        data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT;
      if (!isWaitingForSignal) {
        console.warn('[HLS error]', data.type, data.details, data.fatal);
      }
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            elStatus && (elStatus.textContent = 'SIN SEÑAL — REINTENTANDO...');
            if (isWaitingForSignal) {
              // Stream not started yet — keep polling silently
              showConnecting('ESPERANDO TRANSMISIÓN...');
              scheduleRetry();
            } else {
              hls.startLoad(); // try to recover
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            onStreamEnded();
            break;
        }
      } else if (data.details === 'levelLoadError' || data.details === 'fragLoadError') {
        // Non-fatal frag error — HLS.js will retry by itself
      }
    });

    // Detect when stream ends (stalled after being live)
    video.addEventListener('waiting', () => {
      if (isLive) {
        setTimeout(() => {
          if (video.readyState < 3 && isLive) {
            elStatus && (elStatus.textContent = 'SEÑAL INESTABLE — RECONECTANDO...');
            showConnecting('SEÑAL INESTABLE...');
            scheduleRetry();
          }
        }, 8000);
      }
    });

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', onStreamStarted, { once: true });
    video.addEventListener('error', () => { showConnecting('ERROR — REINTENTANDO...'); scheduleRetry(); }, { once: true });
    video.play().catch(() => {
      video.muted = true;
      video.play();
      elUnmute.style.display = 'flex';
    });
  } else {
    elStatus && (elStatus.textContent = 'NAVEGADOR NO COMPATIBLE CON HLS');
  }
}

// ── UNMUTE ─────────────────────────────────────
function unmuteStream() {
  video.muted = false;
  video.volume = 1;
  elUnmute.style.display = 'none';
  video.play();
}

// ── CONTROLS ───────────────────────────────────
function togglePlayPause() {
  if (video.paused) { video.play(); elPlayBtn.textContent = '⏸'; }
  else { video.pause(); elPlayBtn.textContent = '▶'; }
}
function setVolume(v) {
  video.volume = parseFloat(v);
  video.muted = (parseFloat(v) === 0);
  document.getElementById('vol-label').textContent = Math.round(v*100) + '%';
  document.getElementById('mute-btn').textContent = video.muted ? '🔇' : '🔊';
}
function toggleMute() {
  video.muted = !video.muted;
  document.getElementById('mute-btn').textContent = video.muted ? '🔇' : '🔊';
  document.getElementById('vol-slider').value = video.muted ? 0 : video.volume;
  document.getElementById('vol-label').textContent = video.muted ? '0%' : Math.round(video.volume*100)+'%';
}
function toggleFullscreen() {
  const wrapper = video.closest('.stream-main');
  if (!document.fullscreenElement) {
    (wrapper || video).requestFullscreen().catch(()=>{});
  } else {
    document.exitFullscreen();
  }
}

// ── VOD PLAYBACK ───────────────────────────────
function playVOD(url, title) {
  if (!HLS_AVAILABLE) {
    showOffline();
    return;
  }
  elOffline.style.display = 'none';
  elControls.style.display = 'flex';
  elPlayBtn.textContent = '⏸';

  if (hls) { hls.destroy(); hls = null; }

  if (Hls.isSupported()) {
    hls = new Hls({ enableWorker: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.muted = false;
      video.volume = 1;
      video.play().catch(() => { video.muted = true; video.play(); elUnmute.style.display = 'flex'; });
    });
    hls.on(Hls.Events.ERROR, (e, d) => { if (d.fatal) showOffline(); });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.play();
  }

  // When VOD ends, go back to offline screen
  video.addEventListener('ended', () => { showOffline(); }, { once: true });
}

// ── STREAM TIMER ───────────────────────────────
let seconds = 9257;
function updateTimer() {
  seconds++;
  const h = String(Math.floor(seconds/3600)).padStart(2,'0');
  const m = String(Math.floor((seconds%3600)/60)).padStart(2,'0');
  const s = String(seconds%60).padStart(2,'0');
  const el = document.getElementById('timer-main');
  if (el) el.innerHTML = `<span>DURACIÓN</span>${h}:${m}:${s}`;
}
setInterval(updateTimer, 1000);

// ── CLOCK ──────────────────────────────────────
function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('es-MX', {hour12:false});
  const el = document.getElementById('stream-time');
  if (el) el.textContent = `MX TIME — ${t}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── LIVE HUD RANDOM DATA ───────────────────────
function randomInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }
setInterval(() => {
  const hrEl = document.getElementById('hud-hr');
  const vEl = document.getElementById('hud-viewers');
  const altEl = document.getElementById('hud-alt');
  if (hrEl) hrEl.textContent = randomInt(138,156);
  if (vEl) vEl.textContent = randomInt(2700,2900).toLocaleString();
  if (altEl) altEl.textContent = (4890+randomInt(-10,10)).toLocaleString();
}, 2500);

// ── SCROLL REVEAL ──────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach((e,i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i*80); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── GLITCH ─────────────────────────────────────
document.querySelectorAll('.glitch').forEach(el => {
  setInterval(() => {
    el.style.textShadow = `${randomInt(-3,3)}px 0 var(--neon), ${randomInt(-3,3)}px 0 rgba(255,0,0,0.5)`;
    setTimeout(() => { el.style.textShadow = ''; }, 80);
  }, randomInt(3000,7000));
});

// ── BOOT ───────────────────────────────────────
showConnecting('CONECTANDO SEÑAL...');
initHLS();

// ── SIDE STREAMS ───────────────────────────────
function initSideStream(videoId, url) {
  if (!url || !HLS_AVAILABLE) return; // no URL configured
  const v = document.getElementById(videoId);
  if (!v) return;
  v.style.display = 'block';

  if (Hls.isSupported()) {
    const h = new Hls({ enableWorker: true, lowLatencyMode: true });
    h.loadSource(url);
    h.attachMedia(v);
    h.on(Hls.Events.MANIFEST_PARSED, () => { v.muted = true; v.play(); });
    h.on(Hls.Events.ERROR, (e, d) => { if (d.fatal) h.destroy(); });
  } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
    v.src = url; v.muted = true; v.play();
  }
}
initSideStream('side-video-2', STREAM_2_URL);
initSideStream('side-video-3', STREAM_3_URL);
