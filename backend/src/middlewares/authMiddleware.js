import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
    // 1. Busca o token no cabeçalho (Header) da requisição
    const authHeader = req.headers['authorization'];
    
    // O padrão de mercado envia o token assim: "Bearer COdigoDoTOkenAqui..."
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Se nenhum token for enviado, barra o acesso imediatamente
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token de segurança não fornecido.' });
    }

    try {
        // 3. Valida se o token é verdadeiro usando a nossa chave secreta do .env
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Salva os dados do admin dentro da requisição para uso futuro se precisar
        req.admin = verificado; 
        
        // Libera para a rota continuar para o Controller
        next(); 
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

export default verificarToken;
