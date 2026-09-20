// ===== Ponto único de inicialização da página =====
// Reúne tudo que precisa rodar assim que o HTML termina de carregar.
// Este arquivo precisa ser o ÚLTIMO da lista de <script>, depois de todos os outros.

document.addEventListener("DOMContentLoaded", function () {
    // Status da loja (o botão em si só existe no admin, mas a checagem aqui é inofensiva)
    carregarStatusLoja();
    const btnToggle = document.getElementById("btnToggleLoja");
    if (btnToggle) {
        btnToggle.addEventListener("click", alternarStatusLoja);
    }

    // Verifica se a loja está aberta e bloqueia o botão de finalizar pedido se estiver fechada
    verificarStatusLoja();

    // Recalcula o carrinho toda vez que o modal dele é aberto
    const modalCarrinhoEl = document.getElementById("modalCarrinho");
    if (modalCarrinhoEl) {
        modalCarrinhoEl.addEventListener("show.bs.modal", renderizarCarrinho);
    }

    // Carregamento inicial de produtos e do contador do carrinho
    carregarProdutos();
    atualizarContador();

    // Ativa a busca automática de endereço pelo CEP
    inicializarBuscaCep();

    // Botão "Limpar carrinho"
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

    // Botão "Finalizar pedido" -> abre o modal de confirmação
    const btnFinalizar = document.getElementById("btnFinalizarPedido");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", abrirConfirmacaoPedido);
    }

    // Botão "Confirmar e enviar" dentro do modal de confirmação -> envia de fato
    const btnConfirmarEnviar = document.getElementById("btnConfirmarEnviarPedido");
    if (btnConfirmarEnviar) {
        btnConfirmarEnviar.addEventListener("click", enviarPedidoConfirmado);
    }
});
