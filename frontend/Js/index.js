document.addEventListener('DOMContentLoaded', function() {
    carregarLigasTabela();
});

async function carregarLigasTabela() {
    const res = await fetch("/ligas");
    const ligas = await res.json();

    const container = document.getElementById("ligas-container");
    container.innerHTML = "";

    for(const liga of ligas){
        // Cria título da liga
        const titulo = document.createElement("h3");
        titulo.textContent = liga.nome;
        container.appendChild(titulo);

        // Cria tabela
        const tabela = document.createElement("table");
        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Clube</th>
                    <th>J</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>GM</th>
                    <th>GS</th>
                    <th>SG</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        container.appendChild(tabela);

        // Carrega tabela do backend
        const resTabela = await fetch(`/tabela/${liga.id}`);
        const classificacao = await resTabela.json();
        const tbody = tabela.querySelector("tbody");
        classificacao.forEach(cl=>{
            const row = document.createElement("tr");
            row.innerHTML = `<td>${cl.Pos}</td><td>${cl.clube}</td><td>${cl.J}</td><td>${cl.V}</td><td>${cl.E}</td><td>${cl.D}</td><td>${cl.GM}</td><td>${cl.GS}</td><td>${cl.SG>=0? '+'+cl.SG:cl.SG}</td><td>${cl.Pts}</td>`;
            tbody.appendChild(row);
        });
    }
}