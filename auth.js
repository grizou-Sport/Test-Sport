async function redirectIfLoggedIn() {
  const { data } = await momentumDB.auth.getSession();

  if (data.session) {
    window.location.replace("index.html");
  }
}

redirectIfLoggedIn();

const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function getAuthValues() {
  const formData = new FormData(authForm);
  return {
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

loginBtn.addEventListener("click", async () => {
  const { email, password } = getAuthValues();

  authMessage.textContent = "Connexion en cours...";

  const { error } = await momentumDB.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  window.location.href = "index.html";
});

signupBtn.addEventListener("click", async () => {
  const { email, password } = getAuthValues();

  authMessage.textContent = "Création du compte...";

  const { error } = await momentumDB.auth.signUp({
    email,
    password,
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  authMessage.textContent =
    "Compte créé. Vérifie ton email, puis connecte-toi.";
});
