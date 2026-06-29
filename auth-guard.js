async function protectMomentum() {
  const { data, error } = await momentumDB.auth.getSession();

  if (error || !data.session) {
    window.location.replace("login.html");
    return;
  }

  document.body.classList.add("auth-ready");
}

protectMomentum();
