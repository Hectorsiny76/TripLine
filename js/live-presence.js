(function () {
  const STORAGE_KEY = 'tripline_live_presence_v1';
  const SESSION_KEY = 'tripline_presence_id';
  const TTL = 15000;
  const HEARTBEAT = 5000;
  const sessionId = sessionStorage.getItem(SESSION_KEY) || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  sessionStorage.setItem(SESSION_KEY, sessionId);

  function readPresence() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  function renderCount(count) {
    document.querySelectorAll('[data-live-count]').forEach((element) => {
      element.textContent = String(Math.max(1, count));
    });
  }
  function updatePresence(removeCurrent) {
    const now = Date.now();
    const presence = readPresence();
    Object.keys(presence).forEach((id) => {
      if (now - presence[id] > TTL || (removeCurrent && id === sessionId)) delete presence[id];
    });
    if (!removeCurrent) presence[sessionId] = now;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presence));
    renderCount(Object.keys(presence).length);
  }
  updatePresence(false);
  setInterval(() => updatePresence(false), HEARTBEAT);
  window.addEventListener('storage', () => updatePresence(false));
  window.addEventListener('pagehide', () => updatePresence(true));
}());