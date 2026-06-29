async function protectMomentum() {
  const { data } = await momentumDB.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
  }
}

protectMomentum();
