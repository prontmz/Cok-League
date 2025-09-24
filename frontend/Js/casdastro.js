const backendUrl = "http://localhost:3000";

async function cadastrar() {
  const username = document.getElementById("usernameCadastro").value.trim();
  const password = document.getElementById("passwordCadastro").value.trim();

  if (!username || !password) return alert("Preencha todos os campos");

  try {
    const res = await fetch(`${backendUrl}/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.text();
    alert(data);
    document.getElementById("usernameCadastro").value = "";
    document.getElementById("passwordCadastro").value = "";
  } catch (err) {
    alert("Erro ao cadastrar: " + err.message);
  }
}