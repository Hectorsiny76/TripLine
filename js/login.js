const nextPage = new URLSearchParams(window.location.search).get('next') || 'comunidad.html';

function finishDemoLogin(user) {
  const users = getTriplineStore(TRIPLINE_USERS_KEY);
  if (!users.some((saved) => saved.email === user.email)) {
    users.push(user);
    setTriplineStore(TRIPLINE_USERS_KEY, users);
  }
  setTriplineSession(user);
  window.location.href = nextPage;
}

document.querySelectorAll('[data-demo-provider]').forEach((button) => {
  button.addEventListener('click', () => {
    const provider = button.dataset.demoProvider;
    finishDemoLogin({
      name: `${provider} Explorer`,
      email: `demo.${provider.toLowerCase()}@tripline.mx`,
      provider
    });
  });
});

document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  finishDemoLogin({
    name: form.get('name').trim(),
    email: form.get('email').trim().toLowerCase(),
    provider: 'Correo local'
  });
});
