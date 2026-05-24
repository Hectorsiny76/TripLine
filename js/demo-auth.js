const TRIPLINE_SESSION_KEY = 'tripline_demo_session';
const TRIPLINE_USERS_KEY = 'tripline_demo_users';
const TRIPLINE_LIVES_KEY = 'tripline_demo_lives';
const TRIPLINE_ORDERS_KEY = 'tripline_demo_orders';

function getTriplineSession() {
  try {
    return JSON.parse(localStorage.getItem(TRIPLINE_SESSION_KEY));
  } catch (error) {
    return null;
  }
}

function setTriplineSession(user) {
  localStorage.setItem(TRIPLINE_SESSION_KEY, JSON.stringify(user));
}

function clearTriplineSession() {
  localStorage.removeItem(TRIPLINE_SESSION_KEY);
}

function getTriplineStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function setTriplineStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function requireTriplineSession() {
  const session = getTriplineSession();
  if (session) return session;
  const target = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
  window.location.href = `login.html?next=${target}`;
  return null;
}

function refreshAuthNavigation() {
  const session = getTriplineSession();
  document.querySelectorAll('[data-community-link]').forEach((link) => {
    link.textContent = session ? 'MI COMUNIDAD' : 'COMUNIDAD';
  });
  document.querySelectorAll('[data-session-name]').forEach((label) => {
    label.textContent = session ? session.name : '';
  });
}

refreshAuthNavigation();
