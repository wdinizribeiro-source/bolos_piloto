import jwt from 'jsonwebtoken';
import AdministradorModel from '../models/administradorModel.js';

const verificarToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token de segurança não fornecido.' });
    }

    // 1) Valida a assinatura e a validade do token
    let verificado;
    try {
        verificado = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // 2) Confirma que o admin do token ainda existe no banco
    try {
        const admin = await AdministradorModel.buscarPorId(verificado.id_administrador);
        if (!admin) {
            return res.status(401).json({ error: 'Administrador não encontrado. Faça login novamente.' });
        }

        req.admin = verificado;
        next();
    } catch (error) {
        // Falha de banco não é problema de sessão: não desloga o usuário por isso
        console.error('Erro ao validar administrador no banco:', error);
        return res.status(500).json({ error: 'Erro ao validar a sessão. Tente novamente.' });
    }
};

export default verificarToken;