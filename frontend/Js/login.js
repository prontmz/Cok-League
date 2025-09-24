const backendUrl = "http://localhost:3000";

async function login() {
  const username = document.getElementById("usernameLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();

  if (!username || !password) return alert("Preencha todos os campos");

  try {
    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      return alert(errData.mensagem || "Erro ao logar");
    }

    const data = await res.json();

    if (data.painel === "admin") {
      window.location.href = "dashboard-admin.html";
    } else {
      // Salva id e username do jogador no localStorage
      const usersRes = await fetch(`${backendUrl}/users`);
      const users = await usersRes.json();
      const user = users.find(u => u.username === username);
      if (user) {
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("username", user.username);
      }
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    alert("Erro ao logar: " + err.message);
  }
}