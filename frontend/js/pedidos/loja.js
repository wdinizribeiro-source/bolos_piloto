// ===== Status da loja (aberta/fechada) =====
// Observação: o botão #btnToggleLoja é do painel admin e não existe nesta página pública.
// As funções abaixo continuam seguras mesmo assim, pois sempre checam se o botão existe antes de agir.

async function carregarStatusLoja() {
    const btn = document.getElementById("btnToggleLoja");
    if (!btn) return;

    try {
        const resposta = await fetch(`${API_URL}/configLoja/status`);
        const dados = await resposta.json();
        const aberta = Boolean(dados.loja_aberta);

        atualizarVisualBotao(aberta);
    } catch (erro) {
        console.error("Erro ao carregar status da loja:", erro);
    }
}

function atualizarVisualBotao(aberta) {
    const btn = document.getElementById("btnToggleLoja");
    if (!btn) return;

    if (aberta) {
        btn.textContent = "Loja Aberta";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-success");
    } else {
        btn.textContent = "Loja Fechada";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-danger");
    }
}

async function alternarStatusLoja() {
    const btn = document.getElementById("btnToggleLoja");
    if (!btn) return;

    // Descobre o estado atual pelo texto do botão, e decide o oposto
    const estaAberta = btn.textContent.includes("Aberta");
    const novoStatus = !estaAberta;

    const token = localStorage.getItem("token"); // ajuste a chave se você salva o token com outro nome

    try {
        const resposta = await fetch(`${API_URL}/configLoja/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                loja_aberta: novoStatus,
                mensagem_fechado: "Estamos fechados no momento. Volte em breve!"
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert(erro.error || "Erro ao atualizar status da loja.");
            return;
        }

        atualizarVisualBotao(novoStatus);
    } catch (erro) {
        console.error("Erro ao alternar status da loja:", erro);
        alert("Falha de conexão ao tentar atualizar o status da loja.");
    }
}

async function verificarStatusLoja() {
    const aviso = document.getElementById("avisoLojaFechada");
    const btnFinalizar = document.getElementById("btnFinalizarPedido");
    if (!aviso) return;

    try {
        const resposta = await fetch(`${API_URL}/configLoja/status`);
        if (!resposta.ok) throw new Error("Erro ao consultar status da loja.");

        const dados = await resposta.json();
        lojaAberta = Boolean(dados.loja_aberta); // converte 0/1 do MySQL em true/false

        if (!lojaAberta) {
            aviso.textContent = dados.mensagem_fechado || "Estamos fechados no momento.";
            aviso.classList.remove("d-none");

            if (btnFinalizar) {
                btnFinalizar.disabled = true;
                btnFinalizar.textContent = "Loja Fechada";
            }
        } else {
            aviso.classList.add("d-none");
            if (btnFinalizar) {
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = "Finalizar Pedido";
            }
        }
    } catch (erro) {
        console.error("Erro ao verificar status da loja:", erro);
        // Em caso de falha na consulta, deixamos a loja "aberta" por padrão,
        // para não bloquear pedidos por um erro técnico momentâneo.
    }
}
