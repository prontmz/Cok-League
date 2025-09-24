document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.getAttribute('onclick') === 'logout()') return;
            menuItems.forEach(menuItem => menuItem.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(tab => tab.classList.remove('active'));

            const tabId = this.getAttribute('data-tab');
            const correspondingTab = document.getElementById(tabId);
            if (correspondingTab) {
                correspondingTab.classList.add('active');
                const pageTitle = document.getElementById('pageTitle');
                const tabName = this.querySelector('span').textContent;
                pageTitle.textContent = `Painel Admin - ${tabName}`;
            }
        });
    });

    carregarUsuarios();
    carregarLigas();
    carregarClubes();
});

// Logout
function logout() { window.location.href = "login.html"; }

// ========================
// Usuários
// ========================
async function carregarUsuarios() {
    const res = await fetch("/users");
    const users = await res.json();
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${user.id}</td><td>${user.username}</td><td><button onclick="apagarUsuario(${user.id})">Apagar</button></td>`;
        tbody.appendChild(row);
    });
}

async function apagarUsuario(id) {
    if (!confirm("Tens certeza que queres apagar este utilizador?")) return;
    await fetch(`/users/${id}`, { method: "DELETE" });
    carregarUsuarios();
}

// ========================
// Ligas
// ========================
async function carregarLigas() {
    const res = await fetch("/ligas");
    const ligas = await res.json();

    const tabelaLigas = document.querySelector("#tabelaLigas tbody");
    tabelaLigas.innerHTML = "";
    ligas.forEach(liga => {
        tabelaLigas.innerHTML += `<tr><td>${liga.id}</td><td>${liga.nome}</td><td><button onclick="apagarLiga(${liga.id})">Apagar</button></td></tr>`;
    });

    const selectLiga = document.getElementById("select-liga");
    const selectLigaConfrontos = document.getElementById("select-liga-confrontos");
    const selectLigaResultados = document.getElementById("select-liga-resultados");
    if(selectLiga && selectLigaConfrontos && selectLigaResultados) {
        selectLiga.innerHTML = selectLigaConfrontos.innerHTML = selectLigaResultados.innerHTML = '<option value="">-- Selecione uma Liga --</option>';
        ligas.forEach(liga => {
            const option = `<option value="${liga.id}">${liga.nome}</option>`;
            selectLiga.innerHTML += option;
            selectLigaConfrontos.innerHTML += option;
            selectLigaResultados.innerHTML += option;
        });
    }
}

async function apagarLiga(id){
    if(!confirm("Deseja apagar esta liga?")) return;
    await fetch(`/ligas/${id}`, { method: "DELETE" });
    carregarLigas();
    carregarConfrontos();
}

// ========================
// Clubes
// ========================
async function carregarClubes() {
    const res = await fetch("/users");
    const clubes = await res.json();
    const container = document.getElementById("clubes-checkboxes");
    const selectCasa = document.getElementById("select-clube-casa");
    const selectFora = document.getElementById("select-clube-fora");
    container.innerHTML = "";
    selectCasa.innerHTML = selectFora.innerHTML = '<option value="">-- Selecione --</option>';
    
    clubes.forEach(clube => {
        container.innerHTML += `<div><input type="checkbox" id="clube${clube.id}" value="${clube.id}"><label for="clube${clube.id}" style="display:inline;">${clube.username}</label></div>`;
        selectCasa.innerHTML += `<option value="${clube.id}">${clube.username}</option>`;
        selectFora.innerHTML += `<option value="${clube.id}">${clube.username}</option>`;
    });
}

// ========================
// Criar Liga
// ========================
document.getElementById("form-liga").addEventListener("submit", async e=>{
    e.preventDefault();
    const nome = document.getElementById("nome-liga").value.trim();
    if(!nome) return alert("Nome da liga obrigatório");
    await fetch("/ligas", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({nome}) });
    document.getElementById("nome-liga").value="";
    carregarLigas();
});

// ========================
// Adicionar Clubes a Liga
// ========================
document.getElementById("form-add-clubes-liga").addEventListener("submit", async e=>{
    e.preventDefault();
    const liga_id = document.getElementById("select-liga").value;
    const clubes = Array.from(document.querySelectorAll("#clubes-checkboxes input:checked")).map(c=>c.value);
    if(!liga_id || clubes.length ===0) return alert("Selecione uma liga e pelo menos 1 clube");
    await fetch("/liga-clubes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({liga_id, clubes}) });
    alert("Clubes adicionados à liga com sucesso!");
    carregarTabela(liga_id);
});

// ========================
// Confrontos
// ========================
document.getElementById("form-confrontos").addEventListener("submit", async e=>{
    e.preventDefault();
    const liga_id = document.getElementById("select-liga-confrontos").value;
    const clube_casa_id = document.getElementById("select-clube-casa").value;
    const clube_fora_id = document.getElementById("select-clube-fora").value;
    const data_confronto = document.getElementById("data-confronto").value;
    const hora_confronto = document.getElementById("hora-confronto").value;
    if(!liga_id || !clube_casa_id || !clube_fora_id || !data_confronto || !hora_confronto) return alert("Preencha todos os campos");
    
    await fetch("/confrontos", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({liga_id, clube_casa_id, clube_fora_id, data_confronto, hora_confronto}) });
    alert("Confronto marcado com sucesso!");
    carregarConfrontos(liga_id);
});

async function carregarConfrontos(liga_id=null){
    const selectLigaConfrontos = document.getElementById("select-liga-confrontos");
    if(!liga_id) liga_id = selectLigaConfrontos.value;
    if(!liga_id) return;

    const res = await fetch(`/confrontos/${liga_id}`);
    const confrontos = await res.json();
    const tbody = document.querySelector("#tabelaConfrontos tbody");
    tbody.innerHTML = "";
    confrontos.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${c.data_confronto} ${c.hora_confronto}</td><td>${c.casa} vs ${c.fora}</td><td>${c.resultado||'-'}</td><td>${c.estado||'-'}</td><td><button onclick="apagarConfronto(${c.id})">Apagar</button></td>`;
        tbody.appendChild(row);
    });

    carregarTabela(liga_id);
}

async function apagarConfronto(id){
    if(!confirm("Deseja apagar este confronto?")) return;
    await fetch(`/confrontos/${id}`, { method:"DELETE" });
    carregarConfrontos();
}

document.getElementById("select-liga-confrontos").addEventListener("change", e=>{
    carregarConfrontos(e.target.value);
});

// ========================
// Resultados
// ========================
document.getElementById("form-resultados").addEventListener("submit", async e=>{
    e.preventDefault();
    const confronto_id = document.getElementById("select-confronto").value;
    const golos_casa = document.getElementById("golos-casa").value;
    const golos_fora = document.getElementById("golos-fora").value;

    if(!confronto_id || golos_casa==="" || golos_fora==="") return alert("Preencha todos os campos");

    await fetch(`/confrontos/${confronto_id}/resultado`, { 
        method:"PUT", 
        headers:{"Content-Type":"application/json"}, 
        body:JSON.stringify({golos_casa, golos_fora}) 
    });
    alert("Resultado registrado com sucesso!");

    const liga_id = document.getElementById("select-liga-resultados").value;
    carregarConfrontos(liga_id);
});

document.getElementById("select-liga-resultados").addEventListener("change", async e=>{
    const liga_id = e.target.value;
    if(!liga_id) return;
    const res = await fetch(`/confrontos/${liga_id}`);
    const confrontos = await res.json();
    const selectConfronto = document.getElementById("select-confronto");
    selectConfronto.innerHTML = '<option value="">-- Selecione um Confronto --</option>';
    confrontos.forEach(c => {
        selectConfronto.innerHTML += `<option value="${c.id}">${c.casa} vs ${c.fora}</option>`;
    });

    carregarTabela(liga_id);
});

// ========================
// Tabela Classificativa
// ========================
async function carregarTabela(liga_id){
    if(!liga_id) return;
    const res = await fetch(`/tabela/${liga_id}`);
    const tabela = await res.json();

    const tbody = document.querySelector("#tabelas table tbody");
    tbody.innerHTML = "";
    tabela.forEach(cl=>{
        const row = document.createElement("tr");
        row.innerHTML = `<td>${cl.Pos}</td><td>${cl.clube}</td><td>${cl.J}</td><td>${cl.V}</td><td>${cl.E}</td><td>${cl.D}</td><td>${cl.GM}</td><td>${cl.GS}</td><td>${cl.SG>=0? '+'+cl.SG:cl.SG}</td><td>${cl.Pts}</td>`;
        tbody.appendChild(row);
    });
}
