const URL_LOGIN = `${API_URL}/administrador/login`;

document.getElementById("form-login").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;
    const mensagemErro = document.getElementById("mensagem-erro");

    try {
        const resposta = await fetch(URL_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Inclui cookies na requisição
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Erro ao fazer login");
        }

        
        localStorage.setItem("admin", JSON.stringify(dados.admin));

        if (dados.precisaTrocarSenha) {
            window.location.href = "trocar-senha.html";
        }else {
            window.location.href = "admin.html";
        }

       

    } catch (erro) {
        console.error("Erro no login:", erro);
        mensagemErro.textContent = erro.message;
        mensagemErro.classList.remove("d-none");
    }
});