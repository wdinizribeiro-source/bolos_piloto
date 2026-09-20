// ===== Fluxo de finalização de pedido: validação, confirmação e envio =====

// Etapa 1: valida os campos do formulário e, se estiver tudo certo, abre o modal de confirmação
function abrirConfirmacaoPedido() {
    if (!lojaAberta) {
        alert("🚫 A loja está fechada no momento. Não é possível finalizar pedidos.");
        return;
    }
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // Captura os valores dos elementos do modal
    const nome = document.getElementById("checkoutNome")?.value.trim();
    const telefone = document.getElementById("checkoutTelefone")?.value.trim();
    const cepRaw = document.getElementById("checkoutCep")?.value || "";
    const logradouro = document.getElementById("checkoutLogradouro")?.value.trim();
    const numero = document.getElementById("checkoutNumero")?.value.trim();
    const complemento = document.getElementById("checkoutComplemento")?.value.trim();
    const bairro = document.getElementById("checkoutBairro")?.value.trim();
    const cidade = document.getElementById("checkoutCidade")?.value.trim();
    const estado = document.getElementById("checkoutEstado")?.value.trim();
    const pagamento = document.getElementById("checkoutPagamento")?.value;
    const observacao = document.getElementById("checkoutObservacao")?.value.trim();

    // Remove traços do CEP
    const cepLimpo = cepRaw.replace(/\D/g, "");
    const cepValido = cepLimpo === "" || cepLimpo.length === 8;

    // Validação básica do lado do cliente
    if (!cepValido) {
        alert("CEP inválido. Digite os 8 números ou deixe o campo em branco.");
        return;
    }

    if (!nome || !telefone || !logradouro || !numero || !bairro || !cidade || !estado || !pagamento) {
        alert("Por favor, preencha todos os campos obrigatórios corretamente.");
        return;
    }

    // ESTRUTURAÇÃO EXATA: Alinhada perfeitamente com as exigências do PedidoController
    // Guardado em variável global (state.js), só é enviado de fato quando o cliente confirmar no modal
    dadosPedidoPendente = {
        cliente: {
            nome_cliente: nome,
            telefone_cliente: telefone
        },
        status: "confirmado", // Define um status inicial permitido pelo back-end
        entrega: {
            cep: cepLimpo || null, // Permite null se o CEP não for fornecido
            logradouro: logradouro,
            numero: numero,
            complemento: complemento || null,
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            observacao: observacao || null
        },
        forma_pagamento: pagamento,
        itens: carrinho
    };

    // Monta o resumo visual e abre o modal de confirmação (por cima do modal do carrinho)
    const body = document.getElementById("confirmacaoPedidoBody");
    body.innerHTML = montarResumoConfirmacao(dadosPedidoPendente);

    const modal = new bootstrap.Modal(document.getElementById("modalConfirmarPedido"));
    modal.show();
}

// Monta o HTML do resumo mostrado no modal de confirmação
function montarResumoConfirmacao(dados) {
    const linhasItens = dados.itens.map(item => {
        const subtotal = (item.quantidade * item.preco_unitario_ped).toFixed(2);
        return `
            <tr>
                <td>${item.quantidade}x</td>
                <td>${escapeHtml(item.nome_produto)}</td>
                <td class="text-end">R$ ${subtotal}</td>
            </tr>
        `;
    }).join("");

    const totalGeral = dados.itens.reduce(
        (soma, item) => soma + (item.quantidade * item.preco_unitario_ped),
        0
    );

    return `
        <div class="mb-2">
            <strong>Cliente:</strong> ${escapeHtml(dados.cliente.nome_cliente)}<br>
            <strong>Telefone:</strong> ${escapeHtml(dados.cliente.telefone_cliente)}
        </div>
        <div class="mb-2">
            <strong>Endereço de entrega:</strong><br>
            ${escapeHtml(dados.entrega.logradouro)}, ${escapeHtml(dados.entrega.numero)}
            ${dados.entrega.complemento ? "- " + escapeHtml(dados.entrega.complemento) : ""}<br>
            ${escapeHtml(dados.entrega.bairro)} - ${escapeHtml(dados.entrega.cidade)}/${escapeHtml(dados.entrega.estado)}
            ${dados.entrega.cep ? `<br>CEP: ${escapeHtml(dados.entrega.cep)}` : ""}
            ${dados.entrega.observacao ? `<br><strong>Obs.:</strong> ${escapeHtml(dados.entrega.observacao)}` : ""}
        </div>
        <div class="mb-2">
            <strong>Forma de pagamento:</strong> ${escapeHtml(dados.forma_pagamento)}
        </div>
        <hr>
        <table class="table table-sm">
            <thead>
                <tr><th>Qtd</th><th>Item</th><th class="text-end">Subtotal</th></tr>
            </thead>
            <tbody>
                ${linhasItens}
            </tbody>
        </table>
        <hr>
        <div class="d-flex justify-content-between">
            <strong>TOTAL:</strong>
            <strong>R$ ${totalGeral.toFixed(2)}</strong>
        </div>
    `;
}

// Etapa 2: envio de fato, só chamado quando o cliente clica em "Confirmar e enviar"
async function enviarPedidoConfirmado() {
    if (!dadosPedidoPendente) return;

    const btnConfirmar = document.getElementById("btnConfirmarEnviarPedido");
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Enviando...";

    console.log("Enviando payload estruturado:", dadosPedidoPendente);

    try {
        const resposta = await fetch(URL_API_PEDIDO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosPedidoPendente)
        });

        if (resposta.ok) {
            const modalConfirmarEl = document.getElementById("modalConfirmarPedido");
            const modalConfirmarInstance = bootstrap.Modal.getInstance(modalConfirmarEl);
            if (modalConfirmarInstance) modalConfirmarInstance.hide();

            alert("🎉 Pedido finalizado e enviado com sucesso!");
            carrinho = [];
            salvarCarrinho();
            document.getElementById("checkoutNome").value = "";
            document.getElementById("checkoutTelefone").value = "";
            document.getElementById("checkoutCep").value = "";
            document.getElementById("checkoutLogradouro").value = "";
            document.getElementById("checkoutNumero").value = "";
            document.getElementById("checkoutComplemento").value = "";
            document.getElementById("checkoutBairro").value = "";
            document.getElementById("checkoutCidade").value = "";
            document.getElementById("checkoutEstado").value = "";
            document.getElementById("checkoutPagamento").value = "";
            document.getElementById("checkoutObservacao").value = "";
            atualizarContador();
            renderizarCarrinho();

            const modalCarrinhoEl = document.getElementById("modalCarrinho");
            const modalCarrinhoInstance = bootstrap.Modal.getInstance(modalCarrinhoEl);
            if (modalCarrinhoInstance) modalCarrinhoInstance.hide();

            dadosPedidoPendente = null;
        } else {
            const erroServer = await resposta.json();
            // Exibe a mensagem de validação real enviada pela API (ex: erro.error)
            alert(`Erro no servidor: ${erroServer.error || "Não foi possível cadastrar seu pedido."}`);
        }
    } catch (erro) {
        console.error("Erro na comunicação com a API de Pedidos:", erro);
        alert("Falha de conexão com o servidor ao tentar finalizar o pedido.");
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = textoOriginal;
    }
}
