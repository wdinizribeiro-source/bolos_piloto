// ===== Busca automática de endereço a partir do CEP =====

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
