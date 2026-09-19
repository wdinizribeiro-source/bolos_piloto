document.getElementById("form-trocar-senha").addEventListener("submit", async function (e) {
    e.preventDefault();

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const mensagemErro = document.getElementById("mensagem-erro");

    if (novaSenha !== confirmarSenha) {
        mensagemErro.textContent = "As senhas novas não coincidem.";
        mensagemErro.classList.remove("d-none");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:8000/administrador/trocar-senha", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtual, novaSenha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao trocar senha");
        }

        window.location.href = "admin.html";

    } catch (erro) {
        console.error("Erro ao trocar senha:", erro);
        mensagemErro.textContent = erro.message;
        mensagemErro.classList.remove("d-none");
    }
});