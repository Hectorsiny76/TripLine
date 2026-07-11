const registerNextPage = new URLSearchParams(window.location.search).get('next') || 'dashboard.html';

document.getElementById('registerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const user = {
    name: form.get('name').trim(),
    email: form.get('email').trim().toLowerCase(),
    favorite: form.get('favorite').trim() || 'Pico de Orizaba',
    provider: 'Registro local',
    createdAt: new Date().toISOString()
  };

  const users = getTriplineStore(TRIPLINE_USERS_KEY);
  const existingIndex = users.findIndex((saved) => saved.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }

  setTriplineStore(TRIPLINE_USERS_KEY, users);
  setTriplineSession(user);
  window.location.href = registerNextPage;
});
