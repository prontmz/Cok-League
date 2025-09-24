document.addEventListener("DOMContentLoaded", () => {
    carregarTabelasLigas();
});

async function carregarTabelasLigas() {
    const container = document.getElementById("ligas-tabelas");
    container.innerHTML = "<p>Carregando ligas...</p>";

    const res = await fetch("/ligas-com-confrontos");
    const ligasComConfrontos = await res.json();

    container.innerHTML = "";

    ligasComConfrontos.forEach(({ liga, confrontos }) => {
        const divLiga = document.createElement("div");
        divLiga.classList.add("card");

        // Cabeçalho da liga
        const header = document.createElement("div");
        header.classList.add("card-header");
        header.textContent = liga.nome;
        divLiga.appendChild(header);

        // Tabela da liga
        const tabela = document.createElement("table");
        tabela.innerHTML = `
            <thead>
                <tr>
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
        const tbody = tabela.querySelector("tbody");

        // Calcular estatísticas de cada clube
        const clubes = {};
        confrontos.forEach(c => {
            const [gCasa, gFora] = c.resultado && c.resultado !== "-" ? c.resultado.split("-").map(Number) : [0, 0];

            if (!clubes[c.casa]) clubes[c.casa] = { J:0, V:0, E:0, D:0, GM:0, GS:0, SG:0, Pts:0 };
            if (!clubes[c.fora]) clubes[c.fora] = { J:0, V:0, E:0, D:0, GM:0, GS:0, SG:0, Pts:0 };

            clubes[c.casa].J++;
            clubes[c.fora].J++;
            clubes[c.casa].GM += gCasa;
            clubes[c.casa].GS += gFora;
            clubes[c.fora].GM += gFora;
            clubes[c.fora].GS += gCasa;

            if (c.estado === "Finalizado") {
                if (gCasa > gFora) {
                    clubes[c.casa].V++;
                    clubes[c.casa].Pts += 3;
                    clubes[c.fora].D++;
                } else if (gCasa < gFora) {
                    clubes[c.fora].V++;
                    clubes[c.fora].Pts += 3;
                    clubes[c.casa].D++;
                } else {
                    clubes[c.casa].E++;
                    clubes[c.fora].E++;
                    clubes[c.casa].Pts++;
                    clubes[c.fora].Pts++;
                }
            }

            clubes[c.casa].SG = clubes[c.casa].GM - clubes[c.casa].GS;
            clubes[c.fora].SG = clubes[c.fora].GM - clubes[c.fora].GS;
        });

        // Ordenar clubes por pontos e SG
        const ranking = Object.entries(clubes)
            .sort((a,b) => b[1].Pts - a[1].Pts || b[1].SG - a[1].SG);

        ranking.forEach(([nome, stats]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nome}</td>
                <td>${stats.J}</td>
                <td>${stats.V}</td>
                <td>${stats.E}</td>
                <td>${stats.D}</td>
                <td>${stats.GM}</td>
                <td>${stats.GS}</td>
                <td>${stats.SG}</td>
                <td>${stats.Pts}</td>
            `;
            tbody.appendChild(tr);
        });

        divLiga.appendChild(tabela);
        container.appendChild(divLiga);
    });
}
