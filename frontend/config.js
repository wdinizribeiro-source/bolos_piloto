// config.js
// Ponto único de configuração da URL da API.
// Detecta automaticamente se estamos rodando local (localhost/127.0.0.1)
// ou em produção, e ajusta a URL sem precisar mexer em nada na hora do deploy.

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000"
    : "http://vps71668.publiccloud.com.br"; // <-- trocar quando a hospedagem estiver pronta

 
