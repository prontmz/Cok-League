document.addEventListener("DOMContentLoaded", () => {
  // Dados guardados no login
  const userId = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");

  const userNameEl = document.getElementById("user-name");
  const statsDiv = document.getElementById("stats");
  const ligasDiv = document.getElementById("ligas");

  if (!userId || !username) {
    alert("Precisa fazer login primeiro!");
    window.location.href = "index.html";
    return;
  }

  // Mostrar nome do jogador
  userNameEl.textContent = username;

  // Buscar estatísticas e ligas do jogador
  fetch(`http://localhost:3000/dashboard/${userId}`)
    .then(res => res.json())
    .then(data => {
      mostrarEstatisticas(data.estatisticas);
      mostrarLigas(data.ligas);
    })
    .catch(err => {
      console.error("Erro ao carregar dashboard:", err);
      statsDiv.textContent = "Erro ao carregar estatísticas.";
    });

  // Função para mostrar estatísticas
  function mostrarEstatisticas(est) {
    statsDiv.innerHTML = `
      <h3>📊 Estatísticas</h3>
      <p><b>Jogos:</b> ${est.jogos || 0}</p>
      <p><b>Vitórias:</b> ${est.vitorias || 0}</p>
      <p><b>Empates:</b> ${est.empates || 0}</p>
      <p><b>Derrotas:</b> ${est.derrotas || 0}</p>
      <p><b>Golos Marcados:</b> ${est.golos || 0}</p>
    `;
  }

  // Função para mostrar as ligas
  function mostrarLigas(ligas) {
    ligasDiv.innerHTML = "<h3>🏆 Suas Ligas</h3>";

    if (!ligas || ligas.length === 0) {
      ligasDiv.innerHTML += "<p>Não está em nenhuma liga ainda.</p>";
      return;
    }

    const ul = document.createElement("ul");

    ligas.forEach(liga => {
      const li = document.createElement("li");
      li.textContent = liga.nome;

      // Botão para ver tabela classificativa da liga
      const btnTabela = document.createElement("button");
      btnTabela.textContent = "📋 Ver Tabela";
      btnTabela.onclick = () => verTabelaLiga(liga.id);

      // Botão para ver confrontos da liga
      const btnJogos = document.createElement("button");
      btnJogos.textContent = "⚽ Ver Confrontos";
      btnJogos.onclick = () => verConfrontosLiga(liga.id);

      li.appendChild(btnTabela);
      li.appendChild(btnJogos);
      ul.appendChild(li);
    });

    ligasDiv.appendChild(ul);
  }

  // Mostrar tabela da liga
  function verTabelaLiga(ligaId) {
    fetch(`http://localhost:3000/tabela/${ligaId}`)
      .then(res => res.json())
      .then(tabela => {
        let tabelaHTML = `
          <h4>🏆 Tabela Classificativa</h4>
          <table border="1" cellpadding="5">
            <tr>
              <th>Pos</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th>
              <th>GM</th><th>GS</th><th>SG</th><th>Pontos</th>
            </tr>
        `;
        tabela.forEach(cl => {
          tabelaHTML += `
            <tr>
              <td>${cl.Pos}</td>
              <td>${cl.clube}</td>
              <td>${cl.J}</td>
              <td>${cl.V}</td>
              <td>${cl.E}</td>
              <td>${cl.D}</td>
              <td>${cl.GM}</td>
              <td>${cl.GS}</td>
              <td>${cl.SG}</td>
              <td>${cl.Pts}</td>
            </tr>
          `;
        });
        tabelaHTML += "</table>";

        ligasDiv.innerHTML = tabelaHTML;
      })
      .catch(err => {
        console.error("Erro ao carregar tabela:", err);
        ligasDiv.innerHTML = "Erro ao carregar tabela da liga.";
      });
  }

  // Mostrar confrontos da liga
  function verConfrontosLiga(ligaId) {
    fetch(`http://localhost:3000/confrontos/${ligaId}`)
      .then(res => res.json())
      .then(confrontos => {
        let jogosHTML = `
          <h4>⚽ Confrontos da Liga</h4>
          <table border="1" cellpadding="5">
            <tr>
              <th>Data</th><th>Hora</th><th>Casa</th><th>Fora</th><th>Resultado</th><th>Estado</th>
            </tr>
        `;
        confrontos.forEach(jogo => {
          jogosHTML += `
            <tr>
              <td>${jogo.data_confronto}</td>
              <td>${jogo.hora_confronto}</td>
              <td>${jogo.casa}</td>
              <td>${jogo.fora}</td>
              <td>${jogo.resultado || "-"}</td>
              <td>${jogo.estado}</td>
            </tr>
          `;
        });
        jogosHTML += "</table>";

        ligasDiv.innerHTML = jogosHTML;
      })
      .catch(err => {
        console.error("Erro ao carregar confrontos:", err);
        ligasDiv.innerHTML = "Erro ao carregar confrontos da liga.";
      });
  }
});
