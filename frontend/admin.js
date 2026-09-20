

document.getElementById("btn-sair").addEventListener("click", async function (e) {
    e.preventDefault();

    try {
        await fetch(`${API_URL}/administrador/logout`, {
            method: "POST",
            credentials: "include"
        });
    } catch (erro) {
        console.error("Erro ao encerrar sessão no servidor:", erro);
    }

    localStorage.removeItem("admin");
    window.location.href = "login.html";
});

// Escapa HTML pra evitar XSS ao exibir dados vindos de fora (cliente, formulários públicos)
function escapeHtml(valor) {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
}
// Exibe uma mensagem tipo "toast" (verde = sucesso, vermelho = erro)
function mostrarMensagem(texto, tipo = "sucesso") {
    const toastEl = document.getElementById("toast-mensagem");
    const toastTexto = document.getElementById("toast-texto");
    toastTexto.textContent = texto;
    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(tipo === "sucesso" ? "bg-success" : "bg-danger");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

let pedidosCompletos = []; // guarda a lista inteira, sem filtro, na memória

async function carregarPedidos() {
   const URL_API = `${API_URL}/pedido/adm/listar`;

    try {
        const resposta = await fetch(URL_API, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!resposta.ok) {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

        pedidosCompletos = await resposta.json();
        aplicarFiltros(); // já desenha a tabela, respeitando os filtros ativos (se houver)

    } catch (erro) {
        console.error("Erro na integração:", erro);
        const tabela = document.getElementById("tabela-pedidos");
        tabela.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Erro ao carregar pedidos. Verifique a conexão.</td></tr>`;
    }
}

function linkWhatsapp(telefone) {
    return telefone ? `https://wa.me/${telefone}` : null;
}

function renderizarTabelaPedidos(lista) {
    const tabela = document.getElementById("tabela-pedidos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Nenhum pedido encontrado.</td></tr>`;
        return;
    }

    lista.forEach(pedido => {
        const linha = document.createElement("tr");

       linha.innerHTML = `
    <td><strong>#${pedido.id_pedido}</strong></td>
    <td>${escapeHtml(pedido.nome_cliente) || "Cliente"}</td>
    <td>${escapeHtml(pedido.resumo_produtos) || "Nenhum item"}</td>
    <td>R$ ${parseFloat(pedido.total_pedido || 0).toFixed(2)}</td>
    <td>
        <span class="badge ${badgeStatus(pedido.status)}">
            ${escapeHtml(pedido.status) || "confirmado"}
        </span>
    </td>
    <td>
        <select class="form-select form-select-sm select-status" data-id="${pedido.id_pedido}">
            <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            <option value="preparando" ${pedido.status === 'preparando' ? 'selected' : ''}>Preparando</option>
            <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="finalizado" ${pedido.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
            <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
    </td>
    <td>
        <button class="btn btn-sm btn-outline-secondary btn-ver-pedido" data-id="${pedido.id_pedido}">
            👁️ Visualizar
        </button>
    </td>
`;

        tabela.appendChild(linha);
    });
}

function badgeStatus(status) {
    switch (status?.toLowerCase()) {
        case 'confirmado': return 'bg-primary';
        case 'preparando': return 'bg-warning text-dark';
        case 'enviado': return 'bg-info text-dark';
        case 'finalizado': return 'bg-success';
        case 'cancelado': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

document.addEventListener("DOMContentLoaded", carregarPedidos);

function aplicarFiltros() {
    const status = document.getElementById("filtroStatus").value;
    const cliente = document.getElementById("filtroCliente").value.trim().toLowerCase();
    const dataInicio = document.getElementById("filtroDataInicio").value;
    const dataFim = document.getElementById("filtroDataFim").value;

    const filtrados = pedidosCompletos.filter(pedido => {
        // Filtro de status: só aplica se algo foi selecionado
        if (status && pedido.status?.toLowerCase() !== status.toLowerCase()) return false;

        // Filtro de cliente: busca parcial, sem diferenciar maiúsculo/minúsculo
        if (cliente && !(pedido.nome_cliente || "").toLowerCase().includes(cliente)) return false;

        // Filtro de período: compara só a parte da data (sem horário)
        if (pedido.data_pedido) {
            const dataPedido = pedido.data_pedido.substring(0, 10); // pega "AAAA-MM-DD"
            if (dataInicio && dataPedido < dataInicio) return false;
            if (dataFim && dataPedido > dataFim) return false;
        }

        return true;
    });

    renderizarTabelaPedidos(filtrados);
}
document.getElementById("filtroStatus").addEventListener("change", aplicarFiltros);
document.getElementById("filtroCliente").addEventListener("input", aplicarFiltros);
document.getElementById("filtroDataInicio").addEventListener("change", aplicarFiltros);
document.getElementById("filtroDataFim").addEventListener("change", aplicarFiltros);

document.getElementById("btnLimparFiltros").addEventListener("click", function () {
    document.getElementById("filtroStatus").value = "";
    document.getElementById("filtroCliente").value = "";
    document.getElementById("filtroDataInicio").value = "";
    document.getElementById("filtroDataFim").value = "";
    aplicarFiltros();
});

async function atualizarStatusPedido(id, novoStatus) {
    
    
      try {
        const resposta = await fetch(`${API_URL}/pedido/adm/${id}/status`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: novoStatus })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao atualizar status");
        }

        carregarPedidos();
        mostrarMensagem(`Status atualizado com sucesso!`, "sucesso");

    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        mostrarMensagem("Erro ao atualizar status: " + erro.message, "erro");
    }
}

document.getElementById("tabela-pedidos").addEventListener("change", function (e) {
    if (e.target.classList.contains("select-status")) {
        const id = e.target.dataset.id;
        const novoStatus = e.target.value;

        const confirmar = confirm(`Confirma alterar o status do pedido #${id} para "${novoStatus}"?`);

        if (confirmar) {
            atualizarStatusPedido(id, novoStatus);
        } else {
            carregarPedidos();
        }
    }
});

// ===== NOVO: Modal de detalhe do pedido (estilo cupom) =====

// Busca o detalhe completo do pedido e mostra no modal
async function abrirDetalhePedido(id) {
    
    const modalBody = document.getElementById("cupomBody");
    document.getElementById("cupomId").textContent = id;

    modalBody.innerHTML = `<p class="text-center text-muted">Carregando...</p>`;

    const modal = new bootstrap.Modal(document.getElementById("modalDetalhePedido"));
    modal.show();

    try {
        const resposta = await fetch(`${API_URL}/pedido/adm/${id}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

        const pedido = await resposta.json();
        modalBody.innerHTML = montarHtmlCupom(pedido);

    } catch (erro) {
        console.error("Erro ao buscar detalhe do pedido:", erro);
        modalBody.innerHTML = `<p class="text-center text-danger">Erro ao carregar o pedido.</p>`;
    }
}


// Monta o HTML do cupom a partir dos dados do pedido
function montarHtmlCupom(pedido) {
    const linhasItens = (pedido.itens || []).map(item => {
        const subtotal = (item.quantidade * item.preco_unitario_ped).toFixed(2);
        return `
            <tr>
                <td>${item.quantidade}x</td>
                <td>${escapeHtml(item.nome_produto)}</td>
                <td class="text-end">R$ ${subtotal}</td>
            </tr>
        `;
    }).join("");

    return `
        <div id="cupomImpressao">
            <div class="text-center mb-2">
                <strong>ERICA BOLOS</strong><br>
                Rua Guimarães, 9 - Parada de Lucas<br>
                Rio de Janeiro - RJ<br>
                Tel: (21) 96418-9059
            </div>
            <hr>
            <div class="mb-2">
                <strong>Pedido:</strong> #${pedido.id_pedido}<br>
                <strong>Cliente:</strong> ${escapeHtml(pedido.nome_cliente) || "-"}<br>
                <strong>Telefone:</strong> ${
                    linkWhatsapp(pedido.telefone_cliente)
                        ? `<a href="${linkWhatsapp(pedido.telefone_cliente)}" target="_blank">${escapeHtml(pedido.telefone_cliente)} 💬</a>`
                        : (escapeHtml(pedido.telefone_cliente) || "-")
                }
            </div>
            <div class="mb-2">
                <strong>Endereço de entrega:</strong><br>
                ${escapeHtml(pedido.logradouro)}, ${escapeHtml(pedido.numero)} ${pedido.complemento ? "- " + escapeHtml(pedido.complemento) : ""}<br>
                ${escapeHtml(pedido.bairro)} - ${escapeHtml(pedido.cidade)}/${escapeHtml(pedido.estado)}<br>
                CEP: ${escapeHtml(pedido.cep) || "-"}
                ${pedido.observacao ? `<br><strong>Obs.:</strong> ${escapeHtml(pedido.observacao)}` : ""}
            </div>
            <div class="mb-2">
                <strong>Forma de pagamento:</strong> ${escapeHtml(pedido.forma_pagamento) || "-"}
            </div>
            <hr>
            <table class="table table-sm">
                <thead>
                    <tr><th>Qtd</th><th>Item</th><th class="text-end">Subtotal</th></tr>
                </thead>
                <tbody>
                    ${linhasItens || `<tr><td colspan="3" class="text-center text-muted">Nenhum item</td></tr>`}
                </tbody>
            </table>
            <hr>
            <div class="d-flex justify-content-between">
                <strong>TOTAL:</strong>
                <strong>R$ ${parseFloat(pedido.total || 0).toFixed(2)}</strong>
            </div>
        </div>
    `;
}
// Delegação de evento pro botão "Visualizar"
document.getElementById("tabela-pedidos").addEventListener("click", function (e) {
    const botao = e.target.closest(".btn-ver-pedido");
    if (botao) {
        const id = botao.dataset.id;
        abrirDetalhePedido(id);
    }
});


// Botão de imprimir o cupom
document.getElementById("btnImprimirCupom").addEventListener("click", function () {
    window.print();
});

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

    const estaAberta = btn.textContent.includes("Aberta");
    const novoStatus = !estaAberta;

    try {
        const resposta = await fetch(`${API_URL}/configLoja/status`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
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
async function carregarCategorias() {
    const select = document.getElementById("produtoCategoria");
    const selectFiltro = document.getElementById("filtroCategoriaProduto");

    try {
        const resposta = await fetch(`${API_URL}/categoria`);
        const dados = await resposta.json();
        const categorias = dados.categorias || [];

        select.innerHTML = `<option value="">Selecione uma categoria</option>`;
        selectFiltro.innerHTML = `<option value="">Todas</option>`;

        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id_categoria;
            option.textContent = cat.categoria;
            select.appendChild(option);

            // clona a mesma option pro select de filtro
            selectFiltro.appendChild(option.cloneNode(true));
        });

        // opção especial só no select do modal
        const optionNova = document.createElement("option");
        optionNova.value = "__nova__";
        optionNova.textContent = "+ Criar nova categoria...";
        select.appendChild(optionNova);

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        select.innerHTML = `<option value="">Erro ao carregar categorias</option>`;
        selectFiltro.innerHTML = `<option value="">Erro ao carregar categorias</option>`;
    }
}
let produtosCompletos = []; // guarda a última lista vinda da API (já filtrada por nome, se houver)

async function carregarProdutos(nomeBusca = "") {
    const tabela = document.getElementById("tabela-produtos");
    const URL_API = nomeBusca
        ? `${API_URL}/produtos/buscar?nome_produto=${encodeURIComponent(nomeBusca)}`
        : `${API_URL}/produtos`;

    tabela.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Carregando produtos...</td></tr>`;

    try {
        const resposta = await fetch(URL_API);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || `Erro no servidor: ${resposta.status}`);
        }

        produtosCompletos = dados.produtos || [];
        aplicarFiltroCategoriaProduto(); // aplica o filtro de categoria (em memória) e renderiza

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        tabela.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar produtos.</td></tr>`;
    }
}

function renderizarTabelaProdutos(lista) {
    const tabela = document.getElementById("tabela-produtos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    lista.forEach(produto => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
    <td>${produto.id_produto}</td>
    <td>${escapeHtml(produto.nome_produto)}</td>
    <td>${escapeHtml(produto.categoria)}</td>
    <td>R$ ${parseFloat(produto.preco_unit_produto).toFixed(2)}</td>
    <td>${produto.quantidade_estoque}</td>
    <td>
        <button class="btn btn-sm btn-outline-secondary btn-editar-produto" data-id="${produto.id_produto}">✏️ Editar</button>
        <button class="btn btn-sm btn-outline-danger btn-excluir-produto" data-id="${produto.id_produto}">🗑️ Excluir</button>
    </td>
`;
        tabela.appendChild(linha);
    });
}

function aplicarFiltroCategoriaProduto() {
    const idCategoria = document.getElementById("filtroCategoriaProduto").value;

    const filtrados = idCategoria
        ? produtosCompletos.filter(p => String(p.id_categoria) === String(idCategoria))
        : produtosCompletos;

    renderizarTabelaProdutos(filtrados);
}
async function salvarProduto() {
    const id = document.getElementById("produtoId").value;
    const nome_produto = document.getElementById("produtoNome").value.trim();
    const preco_unit_produto = document.getElementById("produtoPreco").value;
    const quantidade_estoque = document.getElementById("produtoEstoque").value;
    const id_categoria = document.getElementById("produtoCategoria").value;
    const arquivoImagem = document.getElementById("produtoImagem").files[0];

    if (!nome_produto || !preco_unit_produto || !quantidade_estoque || !id_categoria) {
        mostrarMensagem("Preencha todos os campos.", "erro");
        return;
    }

    const formData = new FormData();
    formData.append("nome_produto", nome_produto);
    formData.append("preco_unit_produto", preco_unit_produto);
    formData.append("quantidade_estoque", quantidade_estoque);
    formData.append("id_categoria", id_categoria);
    if (arquivoImagem) {
        formData.append("imagem", arquivoImagem);
    }

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;

    const btnSalvar = document.getElementById("btnSalvarProduto");
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            credentials: "include",
            body: formData
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao salvar produto");
        }

        mostrarMensagem(id ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!", "sucesso");

        bootstrap.Modal.getInstance(document.getElementById("modalProduto")).hide();
        carregarProdutos(document.getElementById("filtroNomeProduto").value.trim());

    } catch (erro) {
        console.error("Erro ao salvar produto:", erro);
        mostrarMensagem("Erro ao salvar produto: " + erro.message, "erro");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = textoOriginal;
    }
}

async function abrirEdicaoProduto(id) {
    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`);
        const produto = await resposta.json();

        document.getElementById("produtoId").value = produto.id_produto;
        document.getElementById("produtoNome").value = produto.nome_produto;
        document.getElementById("produtoPreco").value = produto.preco_unit_produto;
        document.getElementById("produtoEstoque").value = produto.quantidade_estoque;
        document.getElementById("produtoCategoria").value = produto.id_categoria;

        document.getElementById("produtoImagem").value = "";
        const preview = document.getElementById("produtoImagemPreview");
        if (produto.imagem_url) {
            preview.src = produto.imagem_url;
            preview.classList.remove("d-none");
        } else {
            preview.src = "";
            preview.classList.add("d-none");
        }

        document.getElementById("modalProdutoTitulo").textContent = "Editar Produto";

        const modal = new bootstrap.Modal(document.getElementById("modalProduto"));
        modal.show();

    } catch (erro) {
        console.error("Erro ao buscar produto:", erro);
        mostrarMensagem("Erro ao carregar dados do produto.", "erro");
    }
}

async function excluirProduto(id) {
   
    const confirmar = confirm(`Tem certeza que deseja excluir o produto #${id}?`);
    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao excluir produto");
        }

        mostrarMensagem("Produto excluído com sucesso!", "sucesso");
        carregarProdutos(document.getElementById("filtroNomeProduto").value.trim());

    } catch (erro) {
        console.error("Erro ao excluir produto:", erro);
        mostrarMensagem("Erro ao excluir produto: " + erro.message, "erro");
    }
}
// Delegação de evento: escuta cliques na tabela inteira,
// e verifica se foi num botão de editar ou excluir
document.getElementById("tabela-produtos").addEventListener("click", function (e) {
    const botaoEditar = e.target.closest(".btn-editar-produto");
    const botaoExcluir = e.target.closest(".btn-excluir-produto");

    if (botaoEditar) {
        abrirEdicaoProduto(botaoEditar.dataset.id);
    }
    if (botaoExcluir) {
        excluirProduto(botaoExcluir.dataset.id);
    }
});

// Botão "Salvar" do modal
document.getElementById("btnSalvarProduto").addEventListener("click", salvarProduto);

document.getElementById("produtoImagem").addEventListener("change", function () {
    const arquivo = this.files[0];
    const preview = document.getElementById("produtoImagemPreview");

    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove("d-none");
        };
        leitor.readAsDataURL(arquivo);
    } else {
        preview.src = "";
        preview.classList.add("d-none");
    }
});
document.getElementById("btnNovoProduto").addEventListener("click", function () {
    document.getElementById("formProduto").reset();
    document.getElementById("produtoId").value = "";
    document.getElementById("modalProdutoTitulo").textContent = "Novo Produto";

    const preview = document.getElementById("produtoImagemPreview");
    preview.src = "";
    preview.classList.add("d-none");
});
// Carregamento inicial: assim que a página abre, busca categorias e produtos
document.addEventListener("DOMContentLoaded", function () {
    carregarCategorias();
    carregarProdutos();
});
function renderizarTabelaCategorias(lista) {
    const tabela = document.getElementById("tabela-categorias");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhuma categoria encontrada.</td></tr>`;
        return;
    }

    lista.forEach(categoria => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
    <td>${categoria.id_categoria}</td>
    <td>
        ${categoria.imagem_url
            ? `<img src="${categoria.imagem_url}" alt="${escapeHtml(categoria.categoria)}" style="height: 50px; width: 50px; object-fit: cover; border-radius: 4px;">`
            : `<span class="text-muted">Sem imagem</span>`
        }
    </td>
    <td>${escapeHtml(categoria.categoria)}</td>
    <td>
        <button class="btn btn-sm btn-outline-secondary btn-editar-categoria" data-id="${categoria.id_categoria}">✏️ Editar</button>
        <button class="btn btn-sm btn-outline-danger btn-excluir-categoria" data-id="${categoria.id_categoria}">🗑️ Excluir</button>
    </td>
`;
        tabela.appendChild(linha);
    });
}

async function carregarListaCategorias() {
    const tabela = document.getElementById("tabela-categorias");
    tabela.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Carregando categorias...</td></tr>`;

    try {
        const resposta = await fetch(`${API_URL}/categoria`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao carregar categorias");
        }

        renderizarTabelaCategorias(dados.categorias || []);

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        tabela.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Erro ao carregar categorias.</td></tr>`;
    }
}

async function salvarCategoria() {
    const id = document.getElementById("categoriaId").value;
    const categoria = document.getElementById("categoriaNome").value.trim();
    const arquivoImagem = document.getElementById("categoriaImagem").files[0];

    if (!categoria) {
        mostrarMensagem("Preencha o nome da categoria.", "erro");
        return;
    }

    const formData = new FormData();
    formData.append("categoria", categoria);
    if (arquivoImagem) {
        formData.append("imagem", arquivoImagem);
    }

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/categoria/${id}` : `${API_URL}/categoria`;

    const btnSalvar = document.getElementById("btnSalvarCategoria");
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            credentials: "include",
            body: formData
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao salvar categoria");
        }

        mostrarMensagem(id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!", "sucesso");

        bootstrap.Modal.getInstance(document.getElementById("modalCategoria")).hide();
        carregarListaCategorias();
        carregarCategorias();

    } catch (erro) {
        console.error("Erro ao salvar categoria:", erro);
        mostrarMensagem("Erro ao salvar categoria: " + erro.message, "erro");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = textoOriginal;
    }
}

async function abrirEdicaoCategoria(id) {
    try {
        const resposta = await fetch(`${API_URL}/categoria/${id}`);
        const categoria = await resposta.json();

        document.getElementById("categoriaId").value = categoria.id_categoria;
        document.getElementById("categoriaNome").value = categoria.categoria;

        document.getElementById("categoriaImagem").value = "";
        const preview = document.getElementById("categoriaImagemPreview");
        if (categoria.imagem_url) {
            preview.src = categoria.imagem_url;
            preview.classList.remove("d-none");
        } else {
            preview.src = "";
            preview.classList.add("d-none");
        }

        document.getElementById("modalCategoriaTitulo").textContent = "Editar Categoria";

        const modal = new bootstrap.Modal(document.getElementById("modalCategoria"));
        modal.show();

    } catch (erro) {
        console.error("Erro ao buscar categoria:", erro);
        mostrarMensagem("Erro ao carregar dados da categoria.", "erro");
    }
}
async function excluirCategoria(id) {
    const confirmar = confirm(`Tem certeza que deseja excluir esta categoria? Os produtos associados a ela podem ficar sem categoria.`);
    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/categoria/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao excluir categoria");
        }

        mostrarMensagem("Categoria excluída com sucesso!", "sucesso");
        carregarListaCategorias();
        carregarCategorias();

    } catch (erro) {
        console.error("Erro ao excluir categoria:", erro);
        mostrarMensagem("Erro ao excluir categoria: " + erro.message, "erro");
    }
}
document.getElementById("tabela-categorias").addEventListener("click", function (e) {
    const botaoEditar = e.target.closest(".btn-editar-categoria");
    const botaoExcluir = e.target.closest(".btn-excluir-categoria");

    if (botaoEditar) {
        abrirEdicaoCategoria(botaoEditar.dataset.id);
    }
    if (botaoExcluir) {
        excluirCategoria(botaoExcluir.dataset.id);
    }
});

document.getElementById("btnSalvarCategoria").addEventListener("click", salvarCategoria);

document.getElementById("btnNovaCategoria").addEventListener("click", function () {
    document.getElementById("formCategoria").reset();
    document.getElementById("categoriaId").value = "";
    document.getElementById("modalCategoriaTitulo").textContent = "Nova Categoria";

    const preview = document.getElementById("categoriaImagemPreview");
    preview.src = "";
    preview.classList.add("d-none");
});

document.getElementById("categoriaImagem").addEventListener("change", function () {
    const arquivo = this.files[0];
    const preview = document.getElementById("categoriaImagemPreview");

    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove("d-none");
        };
        leitor.readAsDataURL(arquivo);
    } else {
        preview.src = "";
        preview.classList.add("d-none");
    }
});

document.addEventListener("DOMContentLoaded", carregarListaCategorias);


// ===== Atalho de criar categoria dentro do formulário de produto =====

document.getElementById("produtoCategoria").addEventListener("change", function () {
    const box = document.getElementById("novaCategoriaBox");
    if (this.value === "__nova__") {
        box.classList.remove("d-none");
        document.getElementById("novaCategoriaNome").focus();
    } else {
        box.classList.add("d-none");
    }
});

async function criarCategoriaRapida() {
    const nome = document.getElementById("novaCategoriaNome").value.trim();

    if (!nome) {
        mostrarMensagem("Digite um nome para a categoria.", "erro");
        return;
    }

  
        try {
        const resposta = await fetch(`${API_URL}/categoria`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ categoria: nome })
        });


        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao criar categoria");
        }

        mostrarMensagem("Categoria criada com sucesso!", "sucesso");

        await carregarCategorias();

        document.getElementById("produtoCategoria").value = dados.categoria.id_categoria;

        document.getElementById("novaCategoriaBox").classList.add("d-none");
        document.getElementById("novaCategoriaNome").value = "";

    } catch (erro) {
        console.error("Erro ao criar categoria:", erro);
        mostrarMensagem("Erro ao criar categoria: " + erro.message, "erro");
    }
}

document.getElementById("btnCriarCategoria").addEventListener("click", criarCategoriaRapida);

document.getElementById("btnCancelarCategoria").addEventListener("click", function () {
    document.getElementById("novaCategoriaBox").classList.add("d-none");
    document.getElementById("novaCategoriaNome").value = "";
    document.getElementById("produtoCategoria").value = "";
});

// ===== Filtros da tabela de Produtos =====

// Debounce simples: espera 400ms sem digitar antes de chamar a API
let timeoutBuscaProduto = null;
document.getElementById("filtroNomeProduto").addEventListener("input", function () {
    clearTimeout(timeoutBuscaProduto);
    const termo = this.value.trim();
    timeoutBuscaProduto = setTimeout(() => carregarProdutos(termo), 400);
});

document.getElementById("filtroCategoriaProduto").addEventListener("change", aplicarFiltroCategoriaProduto);

document.getElementById("btnLimparFiltrosProdutos").addEventListener("click", function () {
    document.getElementById("filtroNomeProduto").value = "";
    document.getElementById("filtroCategoriaProduto").value = "";
    carregarProdutos();
});