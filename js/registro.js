const registerNextPage = new URLSearchParams(window.location.search).get('next') || 'dashboard.html';

document.getElementById('registerForm').addEventListener('submit', async function (event){
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  const user = {
    name: form.get('name').trim(),
    email: form.get('email').trim().toLowerCase(),
    favorite: form.get('favorite').trim() || 'Pico de Orizaba',
    provider_name: 'Local',
    provider_id: 1,
    password: form.get('password').trim(),
  }

  try{

    const response = await axios.post('https://tripline-api.onrender.com/api/register', user);

    const token = response.data.token;

    localStorage.setItem('auth_token', token);

    setTriplineSession(response.data.user);

    window.location.href = registerNextPage;

  } catch(error){

    const errorDiv = document.getElementById('error-messages');

    errors(errorDiv, error);

  }

  // const user = {
  //   name: form.get('name').trim(),
  //   email: form.get('email').trim().toLowerCase(),
  //   favorite: form.get('favorite').trim() || 'Pico de Orizaba',
  //   provider_name: 'Registro local',
  //   provider_id: 1,
  //   password: form.get('password').trim(),
  // };
  //
  // const users = getTriplineStore(TRIPLINE_USERS_KEY);
  // const existingIndex = users.findIndex((saved) => saved.email === user.email);
  // if (existingIndex >= 0) {
  //   users[existingIndex] = { ...users[existingIndex], ...user };
  // } else {
  //   users.push(user);
  // }
  //
  // setTriplineStore(TRIPLINE_USERS_KEY, users);
  // setTriplineSession(user);
  // window.location.href = registerNextPage;
});
