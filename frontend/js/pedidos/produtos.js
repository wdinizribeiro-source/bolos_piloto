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
