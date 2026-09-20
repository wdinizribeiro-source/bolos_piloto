// ===== Carrinho de compras =====

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
