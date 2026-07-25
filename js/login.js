const nextPage = new URLSearchParams(window.location.search).get('next') || 'dashboard.html';

const token = getTriplineStore(AUTH_TOKEN_KEY);
console.log(token);

function finishDemoLogin(user) {
  const users = getTriplineStore(TRIPLINE_USERS_KEY);
  if (!users.some((saved) => saved.email === user.email)) {
    users.push(user);
    setTriplineStore(TRIPLINE_USERS_KEY, users);
  }
  setTriplineSession(user);
  window.location.href = nextPage;
}


// PROVIDER
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


// LOCAL
document.getElementById('loginForm').addEventListener('submit', async function (event) {

  event.preventDefault();

  const form = new FormData(event.currentTarget);

  const credentials = {
    email: form.get('email').trim().toLowerCase(),
    password: form.get('password').trim()
  }

  try{

    const response = await TL_API.post('/login',credentials);

    const token = response.data.token;

    localStorage.setItem('auth_token', token);

    finishDemoLogin(response.data.user);

  } catch(error){

    const errorDiv = document.getElementById('error-messages');

    errors(errorDiv, error);

  }


});
