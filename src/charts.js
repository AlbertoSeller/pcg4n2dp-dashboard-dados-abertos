let graficoBar;

function atualizarGrafico(dados) {
    const ctx = document.getElementById("grafico").getContext("2d");
    if (graficoBar) graficoBar.destroy();

    // Lista única de estados e anos (ordenados)
    const estados = [...new Set(dados.map(d => d.estado))];
    const anos = [...new Set(dados.map(d => d.ano))].sort();

    // Paleta de cores para cada ano
    const cores = [
        "rgba(54,162,235,0.7)",   // azul
        "rgba(255,99,132,0.7)",   // vermelho
        "rgba(75,192,192,0.7)",   // verde (extra, se houver mais anos)
        "rgba(255,206,86,0.7)"    // amarelo (extra)
    ];

    // Cria um dataset para cada ano
    const datasets = anos.map((ano, idx) => ({
        label: ano,
        data: estados.map(estado => {
            const item = dados.find(d => d.estado === estado && d.ano === ano);
            return item ? item.valor : null;
        }),
        backgroundColor: cores[idx % cores.length]
    }));

    graficoBar = new Chart(ctx, {
        type: "bar",
        data: {
            labels: estados,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: "Comparação por Estado e Ano"
                }
            },
            scales: {
                x: {
                    title: { display: true, text: "Estados" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "População / Renda" }
                }
            }
        }
    });
}
let graficoScatter;

function atualizarScatter(dados) {
    const ctx = document.getElementById("grafico-scatter").getContext("2d");
    if (graficoScatter) graficoScatter.destroy();

    // Lista única de anos (ordenados)
    const anos = [...new Set(dados.map(d => d.ano))].sort();

    // Paleta de cores para cada ano
    const cores = [
        "rgba(54,162,235,0.7)",   // azul
        "rgba(255,99,132,0.7)",   // vermelho
        "rgba(75,192,192,0.7)",   // verde
        "rgba(255,206,86,0.7)"    // amarelo
    ];

    // Cria um dataset para cada ano
    const datasets = anos.map((ano, idx) => ({
        label: `Ano ${ano}`,
        data: dados
            .filter(d => d.ano === ano)
            .map(d => ({ x: d.populacao, y: d.renda, label: d.estado })),
        backgroundColor: cores[idx % cores.length]
    }));

    graficoScatter = new Chart(ctx, {
        type: "scatter",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const p = context.raw;
                            return `${p.label} (${context.dataset.label}): Pop ${p.x.toLocaleString()} — R$ ${p.y}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: "Renda vs População por Ano"
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'População' }
                },
                y: {
                    title: { display: true, text: 'Renda média (R$)' }
                }
            }
        }
    });
}
