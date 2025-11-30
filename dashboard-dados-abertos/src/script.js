/* ============================================================
   CARREGAMENTO DOS DADOS (JSON local)
   ============================================================ */

/**
 * Carrega o arquivo JSON contendo os dados públicos do IBGE.
 * O caminho é relativo à pasta /data.
 */
async function carregarDados() {
    const resposta = await fetch("./data/exemplo_ibge.json");

    // Se der erro no carregamento, interrompe e exibe status no console.
    if (!resposta.ok) {
        throw new Error("Falha ao carregar dados: " + resposta.status);
    }

    return resposta.json();
}

// Armazena todos os dados carregados para uso global.
let dadosGlobais = [];


/* ============================================================
   INICIALIZAÇÃO DO DASHBOARD
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const dados = await carregarDados();
        dadosGlobais = dados;

        preencherFiltros(dados);    // Preenche selects de região e ano
        atualizarVisualizacao();    // Renderiza gráficos + insights iniciais
        adicionarListeners();       // Ativa eventos de interação do usuário

    } catch (err) {
        console.error(err);
        document.getElementById("insights").textContent =
            "Erro ao carregar dados.";
    }
});


/* ============================================================
   PREENCHIMENTO DINÂMICO DOS FILTROS
   ============================================================ */

/**
 * Preenche automaticamente os filtros de Região e Ano com base no JSON.
 * Remove duplicados usando Set e adiciona opção vazia ("Todas").
 */
function preencherFiltros(dados) {

    const regioes = ["", ...new Set(dados.map(d => d.regiao))]
        .map(r => ({ value: r, label: r || "Todas" }));

    const anos = ["", ...new Set(dados.map(d => d.ano))]
        .sort()
        .map(a => ({ value: a, label: a || "Todos" }));

    document.getElementById("filtro-regiao").innerHTML =
        regioes.map(r => `<option value="${r.value}">${r.label}</option>`).join("");

    document.getElementById("filtro-ano").innerHTML =
        anos.map(a => `<option value="${a.value}">${a.label}</option>`).join("");
}


/* ============================================================
   EVENTOS DE ALTERAÇÃO DOS FILTROS
   ============================================================ */

/**
 * Registra listeners para disparar atualização quando o usuário
 * altera região, ano ou indicador.
 */
function adicionarListeners() {
    ["filtro-regiao", "filtro-ano", "filtro-indicador"].forEach(id => {
        document.getElementById(id).addEventListener("change", atualizarVisualizacao);
    });
}


/* ============================================================
   FILTRAGEM DOS DADOS
   ============================================================ */

/**
 * Filtra os dados globais com base nas seleções feitas pelo usuário.
 * Também define o campo "valor", que abstrai qual indicador está ativo.
 */
function obterDadosFiltrados() {

    const regiao = document.getElementById("filtro-regiao").value;
    const ano = document.getElementById("filtro-ano").value;
    const indicador = document.getElementById("filtro-indicador").value;

    return dadosGlobais
        .filter(d => {

            // Filtro por região
            if (regiao && d.regiao !== regiao) return false;

            // Filtro por ano
            if (ano && String(d.ano) !== String(ano)) return false;

            return true;
        })
        .map(d => ({
            ...d, // mantém estado, regiao, ano, população e renda
            valor: indicador === "renda" ? d.renda : d.populacao
        }));
}


/* ============================================================
   ATUALIZAÇÃO VISUAL (GRÁFICOS + INSIGHTS)
   ============================================================ */

/**
 * Renderiza novamente os gráficos e os insights sempre que
 * os filtros forem alterados.
 */
function atualizarVisualizacao() {
    const dadosFiltrados = obterDadosFiltrados();

    atualizarGrafico(dadosFiltrados);   // Gráfico principal (barra/linha)
    atualizarScatter(dadosFiltrados);   // Gráfico de dispersão
    gerarInsights(dadosFiltrados);      // Análises estatísticas e descritivas
}


/* ============================================================
   INSIGHTS / ANÁLISE DESCRITIVA
   ============================================================ */

/**
 * Gera análises básicas para o painel de "insights".
 * Aqui entram elementos de:
 *  - análise descritiva
 *  - análise comparativa
 *  - heurísticas de interpretação de dados
 */
function gerarInsights(dados) {

    const container = document.getElementById("insights");

    if (!dados.length) {
        container.textContent =
            "Nenhum dado disponível para os filtros selecionados.";
        return;
    }

    // Ordena por renda para identificar extremos
    const porRenda = [...dados].sort((a, b) => b.renda - a.renda);
    const maior = porRenda[0];
    const menor = porRenda[porRenda.length - 1];

    // Média de renda da amostra filtrada
    const mediaRenda = Math.round(
        (dados.reduce((s, d) => s + d.renda, 0) / dados.length) * 100
    ) / 100;

    // Saída estruturada para leitura rápida
    container.innerHTML = `
        <p><strong>Maior renda:</strong> ${maior.estado} — R$ ${maior.renda} (${maior.ano})</p>
        <p><strong>Menor renda:</strong> ${menor.estado} — R$ ${menor.renda} (${menor.ano})</p>
        <p><strong>Média de renda (conjunto filtrado):</strong> R$ ${mediaRenda}</p>
    `;
}
