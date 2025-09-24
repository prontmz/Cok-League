const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // usa a porta do Render se existir

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ========================= CONEXÃO MYSQL =========================
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "EMERSON007",
  database: process.env.DB_NAME || "papa"
});

db.connect(err => {
  if (err) return console.error("❌ Erro na conexão:", err);
  console.log("✅ Conectado ao MySQL");
});

// ========================= PÁGINA INICIAL =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ========================= USUÁRIOS =========================
app.post("/cadastro", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Nome e senha obrigatórios");

  db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err) => {
    if (err) return res.status(500).send("Erro ao cadastrar: " + err.message);
    res.send("Usuário cadastrado!");
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "12345") {
    return res.json({ sucesso: true, painel: "admin" });
  }

  db.query("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      const user = results[0];
      return res.json({ 
        sucesso: true, 
        painel: "user", 
        user_id: user.id, 
        username: user.username 
      });
    }
    return res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
  });
});

app.get("/users", (req, res) => {
  db.query("SELECT id, username FROM users", (err, results) => {
    if (err) return res.status(500).send("Erro ao buscar usuários");
    res.json(results);
  });
});

app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  if (userId === "1") return res.status(403).send("Não é permitido apagar o admin");

  db.query("DELETE FROM users WHERE id=?", [userId], (err) => {
    if (err) return res.status(500).send("Erro ao apagar usuário");
    res.send("Usuário apagado com sucesso!");
  });
});

// ========================= LIGAS =========================
app.post("/ligas", (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).send("Nome da liga obrigatório");

  db.query("INSERT INTO ligas (nome) VALUES (?)", [nome], (err, result) => {
    if (err) return res.status(500).send("Erro ao criar liga: " + err.message);
    res.json({ sucesso: true, id: result.insertId });
  });
});

app.get("/ligas", (req, res) => {
  db.query("SELECT * FROM ligas", (err, results) => {
    if (err) return res.status(500).send("Erro ao buscar ligas");
    res.json(results);
  });
});

app.delete("/ligas/:id", (req, res) => {
  const ligaId = req.params.id;
  db.query("DELETE FROM ligas WHERE id=?", [ligaId], (err) => {
    if (err) return res.status(500).send("Erro ao apagar liga");
    res.send("Liga apagada com sucesso!");
  });
});

// ========================= CLUBES NAS LIGAS =========================
app.post("/liga-clubes", (req, res) => {
  const { liga_id, clubes } = req.body;
  if (!liga_id || !clubes || clubes.length === 0) return res.status(400).send("Dados inválidos");

  const values = clubes.map(clube_id => [liga_id, clube_id]);
  db.query("INSERT INTO liga_clubes (liga_id, clube_id) VALUES ?", [values], (err) => {
    if (err) return res.status(500).send("Erro ao adicionar clubes: " + err.message);
    res.json({ sucesso: true });
  });
});

app.get("/liga-clubes/:liga_id", (req, res) => {
  const liga_id = req.params.liga_id;
  db.query("SELECT u.id, u.username FROM liga_clubes lc JOIN users u ON lc.clube_id = u.id WHERE lc.liga_id=?", [liga_id], (err, results) => {
    if (err) return res.status(500).send("Erro ao buscar clubes");
    res.json(results);
  });
});

// ========================= CONFRONTOS =========================
app.post("/confrontos", (req, res) => {
  const { liga_id, clube_casa_id, clube_fora_id, data_confronto, hora_confronto } = req.body;
  if (!liga_id || !clube_casa_id || !clube_fora_id || !data_confronto || !hora_confronto) return res.status(400).send("Dados inválidos");

  db.query("INSERT INTO confrontos (liga_id, clube_casa_id, clube_fora_id, data_confronto, hora_confronto) VALUES (?,?,?,?,?)",
    [liga_id, clube_casa_id, clube_fora_id, data_confronto, hora_confronto], (err) => {
      if (err) return res.status(500).send("Erro ao marcar confronto");
      res.json({ sucesso: true });
    });
});

app.get("/confrontos/:liga_id", (req, res) => {
  const liga_id = req.params.liga_id;
  db.query(`SELECT c.id, c.data_confronto, c.hora_confronto, u1.username AS casa, u2.username AS fora, c.resultado, c.estado
            FROM confrontos c
            JOIN users u1 ON c.clube_casa_id = u1.id
            JOIN users u2 ON c.clube_fora_id = u2.id
            WHERE c.liga_id=? ORDER BY c.data_confronto, c.hora_confronto`, [liga_id], (err, results) => {
    if(err) return res.status(500).send("Erro ao buscar confrontos");
    res.json(results);
  });
});

app.delete("/confrontos/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM confrontos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).send("Erro ao apagar confronto");
    res.send("Confronto apagado com sucesso!");
  });
});

app.put("/confrontos/:id/resultado", (req, res) => {
  const id = req.params.id;
  const { golos_casa, golos_fora } = req.body;
  if (golos_casa === undefined || golos_fora === undefined) return res.status(400).send("Golos inválidos");

  const resultado = `${golos_casa}-${golos_fora}`;
  db.query("UPDATE confrontos SET resultado=?, estado='Finalizado' WHERE id=?", [resultado, id], (err) => {
    if (err) return res.status(500).send("Erro ao atualizar resultado");
    res.json({ sucesso: true });
  });
});

// ========================= TABELA CLASSIFICATIVA =========================
app.get("/tabela/:liga_id", (req, res) => {
  const liga_id = req.params.liga_id;

  db.query("SELECT u.id, u.username FROM liga_clubes lc JOIN users u ON lc.clube_id = u.id WHERE lc.liga_id = ?", [liga_id], (err, clubes) => {
    if(err) return res.status(500).send("Erro ao buscar clubes");

    if(clubes.length === 0) return res.json([]);

    db.query("SELECT * FROM confrontos WHERE liga_id = ?", [liga_id], (err2, confrontos) => {
      if(err2) return res.status(500).send("Erro ao buscar confrontos");

      const tabelaMap = {};
      clubes.forEach(c => {
        tabelaMap[c.username] = { clube: c.username, J:0, V:0, E:0, D:0, GM:0, GS:0, SG:0, Pts:0 };
      });

      confrontos.forEach(c => {
        if(c.resultado && c.resultado !== "-") {
          const [gCasa, gFora] = c.resultado.split("-").map(Number);
          const clubeCasa = clubes.find(cl => cl.id === c.clube_casa_id)?.username;
          const clubeFora = clubes.find(cl => cl.id === c.clube_fora_id)?.username;

          if(clubeCasa && clubeFora){
            tabelaMap[clubeCasa].J++;
            tabelaMap[clubeFora].J++;

            tabelaMap[clubeCasa].GM += gCasa;
            tabelaMap[clubeCasa].GS += gFora;

            tabelaMap[clubeFora].GM += gFora;
            tabelaMap[clubeFora].GS += gCasa;

            if(gCasa > gFora){
              tabelaMap[clubeCasa].V++; tabelaMap[clubeCasa].Pts += 3;
              tabelaMap[clubeFora].D++;
            } else if(gCasa < gFora){
              tabelaMap[clubeFora].V++; tabelaMap[clubeFora].Pts += 3;
              tabelaMap[clubeCasa].D++;
            } else {
              tabelaMap[clubeCasa].E++; tabelaMap[clubeFora].E++;
              tabelaMap[clubeCasa].Pts++; tabelaMap[clubeFora].Pts++;
            }
          }
        }
      });

      Object.values(tabelaMap).forEach(cl => cl.SG = cl.GM - cl.GS);
      const tabelaFinal = Object.values(tabelaMap).sort((a,b)=> b.Pts - a.Pts || b.SG - a.SG);
      tabelaFinal.forEach((cl,i)=> cl.Pos = i+1);

      res.json(tabelaFinal);
    });
  });
});

// ========================= DASHBOARD DO JOGADOR =========================
app.get("/dashboard/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query("SELECT l.id, l.nome FROM liga_clubes lc JOIN ligas l ON lc.liga_id=l.id WHERE lc.clube_id=?", [user_id], (err, ligas) => {
    if (err) return res.status(500).send("Erro ao buscar ligas do jogador");

    if (ligas.length === 0) return res.json({ estatisticas: {}, ligas: [] });

    db.query("SELECT * FROM confrontos WHERE clube_casa_id=? OR clube_fora_id=?", [user_id, user_id], (err2, confrontos) => {
      if (err2) return res.status(500).send("Erro ao buscar confrontos");

      let jogos = 0, vitorias = 0, empates = 0, derrotas = 0, golos = 0;

      confrontos.forEach(c => {
        if (c.resultado && c.resultado !== "-") {
          const [gCasa, gFora] = c.resultado.split("-").map(Number);
          jogos++;

          if (c.clube_casa_id === Number(user_id)) {
            golos += gCasa;
            if (gCasa > gFora) vitorias++;
            else if (gCasa < gFora) derrotas++;
            else empates++;
          } else {
            golos += gFora;
            if (gFora > gCasa) vitorias++;
            else if (gFora < gCasa) derrotas++;
            else empates++;
          }
        }
      });

      const estatisticas = { jogos, vitorias, empates, derrotas, golos };
      res.json({ estatisticas, ligas });
    });
  });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
