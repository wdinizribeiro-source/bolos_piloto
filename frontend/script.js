const URL_API_PRODUTOS = `${API_URL}/produtos`;
const URL_API_PEDIDO = `${API_URL}/pedido`;
const URL_API_ENTREGAS = `${API_URL}/entregas`;
const URL_API_CATEGORIAS = `${API_URL}/categoria`;

let produtosDisponiveis = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let dadosPedidoPendente = null; // guarda o pedido montado, aguardando confirmação no modal

// Escapa HTML pra evitar XSS ao exibir dados digitados pelo cliente no resumo do pedido
function escapeHtml(valor) {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
}

// ===== Verifica se a loja está aberta ou fechada =====
let lojaAberta = true; // valor padrão, será atualizado pela API
// ===== Controle de status da loja (abrir/fechar) =====
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

document.addEventListener("DOMContentLoaded", function () {
    carregarStatusLoja();

    const btnToggle = document.getElementById("btnToggleLoja");
    if (btnToggle) {
        btnToggle.addEventListener("click", alternarStatusLoja);
    }
});
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
// ===== Carrega os produtos reais do banco e monta os cards por categoria =====
// ===== Carrega os produtos reais do banco e monta os cards por categoria =====
async function carregarProdutos() {
    const container = document.getElementById("produtosContainer");
    if (!container) return;

    try {
        const [respostaProdutos, respostaCategorias] = await Promise.all([
            fetch(URL_API_PRODUTOS),
            fetch(URL_API_CATEGORIAS)
        ]);

        if (!respostaProdutos.ok) throw new Error(`Erro no servidor: ${respostaProdutos.status}`);

        const dadosProdutos = await respostaProdutos.json();
        produtosDisponiveis = dadosProdutos.produtos || [];

        // Mapa "nome da categoria" -> imagem_url, pra exibir uma foto fixa por categoria
        const imagensPorCategoria = {};
        if (respostaCategorias.ok) {
            const dadosCategorias = await respostaCategorias.json();
            (dadosCategorias.categorias || []).forEach(cat => {
                imagensPorCategoria[cat.categoria] = cat.imagem_url;
            });
        }

        const categorias = {};
        produtosDisponiveis.forEach(produto => {
            if (!categorias[produto.categoria]) {
                categorias[produto.categoria] = [];
            }
            categorias[produto.categoria].push(produto);
        });

        container.innerHTML = "";

        Object.keys(categorias).forEach((nomeCategoria, index) => {
            const produtosDaCategoria = categorias[nomeCategoria];
            const cardId = `cat${index}`;
            const imagemCategoria = imagensPorCategoria[nomeCategoria];

            const optionsHtml = produtosDaCategoria.map(p =>
                `<option value="${p.id_produto}" data-preco="${p.preco_unit_produto}">${p.nome_produto}</option>`
            ).join("");

            const cardHtml = `
                <div class="col">
                    <div class="card h-100">
                        ${imagemCategoria
                            ? `<img src="${imagemCategoria}" class="card-img-top" alt="${nomeCategoria}" style="height: 180px; object-fit: cover;">`
                            : ""
                        }
                        <div class="card-body">
                            <h5 class="card-title mb-3">${nomeCategoria}</h5>

                            <select id="produto-${cardId}" class="form-select mb-3">
                                <option value="" selected disabled hidden>Selecione</option>
                                ${optionsHtml}
                            </select>

                            <label class="form-label">Valor Unitário</label>
                            <input type="text" id="valor-${cardId}" class="form-control mb-3" readonly>

                            <label class="form-label">Quantidade</label>
                            <input type="number" id="quantidade-${cardId}" class="form-control mb-3" min="1" value="1">

                            <label class="form-label">Total</label>
                            <input type="text" id="total-${cardId}" class="form-control mb-3" readonly>
                        </div>
                        <button id="addToCart-${cardId}" class="btn btn-add-carrinho w-100">Adicionar ao carrinho</button>
                        <br>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML("beforeend", cardHtml);

            const select = document.getElementById(`produto-${cardId}`);
            const quantidadeInput = document.getElementById(`quantidade-${cardId}`);
            const botaoAdicionar = document.getElementById(`addToCart-${cardId}`);

            select.addEventListener("change", () => atualizarValorETotal(cardId));
            quantidadeInput.addEventListener("change", () => atualizarValorETotal(cardId));

            botaoAdicionar.addEventListener("click", () => {
                const idProduto = parseInt(select.value);
                const quantidade = parseInt(quantidadeInput.value);

                if (!idProduto || !quantidade || quantidade <= 0) {
                    alert("Selecione um produto e uma quantidade válida!");
                    return;
                }

                const produto = produtosDisponiveis.find(p => p.id_produto === idProduto);
                adicionarAoCarrinho(produto, quantidade);
                alert("✅ Produto adicionado ao carrinho!");
            });
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        container.innerHTML = `<p class="text-center text-danger">Erro ao carregar produtos. Verifique a conexão com o servidor.</p>`;
    }
}
function atualizarValorETotal(cardId) {
    const select = document.getElementById(`produto-${cardId}`);
    const valorInput = document.getElementById(`valor-${cardId}`);
    const quantidadeInput = document.getElementById(`quantidade-${cardId}`);
    const totalInput = document.getElementById(`total-${cardId}`);

    const opcaoSelecionada = select.options[select.selectedIndex];
    const preco = parseFloat(opcaoSelecionada?.dataset.preco || 0);
    const quantidade = parseInt(quantidadeInput.value) || 0;

    valorInput.value = "R$ " + preco.toFixed(2);
    totalInput.value = "R$ " + (preco * quantidade).toFixed(2);
}

// ===== Carrinho =====
function adicionarAoCarrinho(produto, quantidade) {
    const itemExistente = carrinho.find(item => item.id_produto === produto.id_produto);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id_produto: produto.id_produto,
            nome_produto: produto.nome_produto,
            preco_unitario_ped: parseFloat(produto.preco_unit_produto),
            quantidade: quantidade
        });
    }

    salvarCarrinho();
    atualizarContador();
}

function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarContador() {
    const contador = document.getElementById("contadorCarrinho");
    if (!contador) return;
    const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    contador.innerText = totalItens;
}

function renderizarCarrinho() {
    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");

    if (carrinho.length === 0) {
        cartItemsDiv.innerHTML = `<p class="text-muted text-center">Seu carrinho está vazio.</p>`;
        cartTotalEl.innerText = "R$ 0,00";
        return;
    }

    let totalGeral = 0;

    cartItemsDiv.innerHTML = carrinho.map((item, index) => {
        const subtotal = item.quantidade * item.preco_unitario_ped;
        totalGeral += subtotal;
        return `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${item.nome_produto}</strong><br>
                    <small>${item.quantidade}x R$ ${item.preco_unitario_ped.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <strong>R$ ${subtotal.toFixed(2)}</strong>
                    <button class="btn btn-sm btn-outline-danger btn-remover-item" data-index="${index}">✕</button>
                </div>
            </div>
        `;
    }).join("");

    cartTotalEl.innerText = "R$ " + totalGeral.toFixed(2);

    document.querySelectorAll(".btn-remover-item").forEach(botao => {
        botao.addEventListener("click", function () {
            const index = parseInt(this.dataset.index);
            carrinho.splice(index, 1);
            salvarCarrinho();
            atualizarContador();
            renderizarCarrinho();
        });
    });
}

// ===== Função dedicada para buscar o CEP e preencher os campos automaticamente =====

function inicializarBuscaCep() {
    const inputCep = document.getElementById('checkoutCep');
    const inputLogradouro = document.getElementById('checkoutLogradouro');
    const inputBairro = document.getElementById('checkoutBairro');
    const inputCidade = document.getElementById('checkoutCidade');
    const inputEstado = document.getElementById('checkoutEstado');

    if (!inputCep) return;

    inputCep.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                // Chama a rota que funcionou perfeitamente no Thunder Client
                const resposta = await fetch(`${API_URL}/cep/${cep}`);
                
                if (resposta.ok) {
                    const dados = await resposta.json();
                    
                    // IMPRIME NO CONSOLE: Ajuda a ver se as propriedades vieram com letras maiúsculas ou minúsculas
                    console.log("Dados recebidos da API:", dados);
                    
                    // Injeta os valores diretamente nos campos da tela
                    if (inputLogradouro) inputLogradouro.value = dados.logradouro || '';
                    if (inputBairro) inputBairro.value = dados.bairro || '';
                    if (inputCidade) inputCidade.value = dados.cidade || '';
                    if (inputEstado) inputEstado.value = dados.estado || '';
                    
                } else {
                    const erroDados = await resposta.json();
                    alert(erroDados.erro || "CEP não encontrado.");
                    limparCamposEndereco();
                }
            } catch (erro) {
                console.error("Erro na comunicação com o servidor:", erro);
                alert("Falha ao consultar o CEP no servidor local.");
            }
        }
    });

    function limparCamposEndereco() {
        if (inputLogradouro) inputLogradouro.value = '';
        if (inputBairro) inputBairro.value = '';
        if (inputCidade) inputCidade.value = '';
        if (inputEstado) inputEstado.value = '';
    }
}


// ===== Modificamos o evento de inicialização para escutar o CEP =====
document.addEventListener("DOMContentLoaded", function () {
    verificarStatusLoja(); // <-- ADICIONADO AQUI: Verifica se a loja está aberta ou fechada
    const modalCarrinhoEl = document.getElementById("modalCarrinho");
    if (modalCarrinhoEl) {
        modalCarrinhoEl.addEventListener("show.bs.modal", renderizarCarrinho);
    }

    carregarProdutos();
    atualizarContador();
    inicializarBuscaCep(); // <-- ADICIONADO AQUI: Ativa a escuta do campo CEP assim que a página abre

    const btnLimpar = document.getElementById("clearCart");
    if (btnLimpar) {
        btnLimpar.addEventListener("click", function () {
            const confirmar = confirm("Tem certeza que deseja limpar o carrinho?");
            if (confirmar) {
                carrinho = [];
                salvarCarrinho();
                atualizarContador();
                renderizarCarrinho();
            }
        });
    }

    const btnFinalizar = document.getElementById("btnFinalizarPedido");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", abrirConfirmacaoPedido);
    }

    const btnConfirmarEnviar = document.getElementById("btnConfirmarEnviarPedido");
    if (btnConfirmarEnviar) {
        btnConfirmarEnviar.addEventListener("click", enviarPedidoConfirmado);
    }
});


// ===== Etapa 1: validar os campos e abrir o modal de confirmação =====
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
    // Guardado em variável global, só é enviado de fato quando o cliente confirmar no modal
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

// ===== Etapa 2: envio de fato, só chamado quando o cliente clica em "Confirmar e enviar" =====
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