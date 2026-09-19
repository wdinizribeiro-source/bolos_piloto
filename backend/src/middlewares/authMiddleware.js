import jwt from 'jsonwebtoken';
import AdministradorModel from '../models/administradorModel.js';

const verificarToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token de segurança não fornecido.' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);

        // Confirma que o admin do token ainda existe no banco
        const admin = await AdministradorModel.buscarPorId(verificado.id_administrador);
        if (!admin) {
            return res.status(401).json({ error: 'Administrador não encontrado. Faça login novamente.' });
        }

        req.admin = verificado;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

export default verificarToken;