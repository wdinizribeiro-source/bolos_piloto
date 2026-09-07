import express from 'express';
import administradorController from '../controllers/administradorController.js';
import verificarToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota protegida: só um admin já logado (com token válido) pode criar outro admin
router.post('/cadastrar', verificarToken, administradorController.cadastrar);

// Rota POST para o administrador fazer login
router.post('/login', administradorController.login);

export default router;