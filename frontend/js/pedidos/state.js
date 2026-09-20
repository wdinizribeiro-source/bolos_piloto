// ===== Estado global e utilitários compartilhados entre os arquivos da tela de Pedidos =====
// Este arquivo precisa ser carregado ANTES dos outros (logo depois do config.js).

const URL_API_PRODUTOS = `${API_URL}/produtos`;
const URL_API_PEDIDO = `${API_URL}/pedido`;
const URL_API_ENTREGAS = `${API_URL}/entregas`;
const URL_API_CATEGORIAS = `${API_URL}/categoria`;

let produtosDisponiveis = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let dadosPedidoPendente = null; // guarda o pedido montado, aguardando confirmação no modal
let lojaAberta = true; // valor padrão, será atualizado pela API

// Escapa HTML pra evitar XSS ao exibir dados digitados pelo cliente
function escapeHtml(valor) {
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
}
