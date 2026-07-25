const TRIPLINE_SESSION_KEY = 'tripline_demo_session';
const TRIPLINE_USERS_KEY = 'tripline_demo_users';
const TRIPLINE_LIVES_KEY = 'tripline_demo_lives';
const TRIPLINE_ORDERS_KEY = 'tripline_demo_orders';
const AUTH_TOKEN_KEY = 'auth_token';

const TL_API = axios.create({
  baseURL: 'http://tripline-api.test/api',
  headers: {
    'Accept': 'application/json',
  }
});

TL_API.interceptors.request.use(config => {
  const token = getAuthToken();
  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
    }
);

function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.log(error);
    return null;
  }
}

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

async function clearTriplineSession() {
  try{
    const response = await TL_API.post("/logout");

    console.log("Éxito!", response.data);

    localStorage.removeItem(TRIPLINE_SESSION_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    location.href = 'login.html?next=dashboard.html';

  } catch (e) {
    console.log("Error de logout", e);
  }
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
  document.querySelectorAll('[data-dashboard-link]').forEach((link) => {
    link.textContent = session ? 'DASHBOARD' : 'ENTRAR';
    link.href = session ? 'dashboard.html' : 'login.html?next=dashboard.html';
  });
  document.querySelectorAll('[data-session-name]').forEach((label) => {
    label.textContent = session ? session.name : '';
  });
}

refreshAuthNavigation();

function errors( errorDiv, error ){
  errorDiv.innerHTML = '';

  if(error.response && error.response.status === 422){

    const validationErrors = error.response.data.errors;

    for(const field in validationErrors){
      errorDiv.innerHTML += `<p>${validationErrors[field][0]}</p>`;
    }

  } else if(error.response && error.response.status === 401){

    const message = error.response.data.message;

    errorDiv.innerHTML += `<p>${message}</p>`;

  } else {
    errorDiv.innerHTML = '<p>Oops... Algo salió mal.</p>';
    console.error(error);
  }
}
