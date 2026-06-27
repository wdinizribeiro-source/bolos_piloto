// Atualizar valor
function atualizarValor(cardId) {
    const select = document.getElementById("produto" + cardId);
    const valor = document.getElementById("valor" + cardId);

    valor.value = "R$ " + select.value;
    atualizarTotal(cardId);
}

// Atualizar total
function atualizarTotal(cardId) {
    const select = document.getElementById("produto" + cardId);
    const quantidade = document.getElementById("quantidade" + cardId).value;
    const total = document.getElementById("total" + cardId);

    const resultado = select.value * quantidade;
    total.value = "R$ " + resultado.toFixed(2);
}

// Inicializar valores
for (let i = 1; i <= 4; i++) {
    if (document.getElementById("produto" + i)) {
        atualizarValor(i);
    }
}

// Carrinho
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function adicionarAoCarrinho(nome, quantidade, preco) {
    quantidade = parseInt(quantidade);

    let itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            nome,
            quantidade,
            preco
        });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Botão
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("addToCart1").addEventListener("click", function () {
        let select = document.getElementById("produto1");
        let nome = select.options[select.selectedIndex]?.text;
        let preco = parseFloat(select.value);
        let quantidade = document.getElementById("quantidade1").value;

        if (!nome || quantidade <= 0) {
            alert("Selecione um produto e quantidade!");
            return;
        }

        adicionarAoCarrinho(nome, quantidade, preco);
        atualizarContador ();

        document.addEventListener("DOMContentLoaded", function () {
            atualizarContador();
        });

        alert("✅ Produto adicionado ao carrinho!");
    });

});

function atualizarContador() {
    let contador = document.getElementById("contadorCarrinho");
    let totalItens = 0;

    carrinho.forEach(item => {
        totalItens += item.quantidade;
    });

    contador.innerText = totalItens;
}


