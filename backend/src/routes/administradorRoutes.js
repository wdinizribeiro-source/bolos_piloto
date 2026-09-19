import express from 'express';
import administradorController from '../controllers/administradorController.js';
import verificarToken from '../middlewares/authMiddleware.js';
import loginRateLimiter from '../middlewares/loginRateLimiter.js';

const router = express.Router();

// Rota protegida: só um admin já logado (com token válido) pode criar outro admin
router.post('/cadastrar', verificarToken, administradorController.cadastrar);
router.post('/login', loginRateLimiter, administradorController.login);
router.post('/login', administradorController.login);
router.post('/logout', administradorController.logout);
router.put('/trocar-senha', verificarToken, administradorController.trocarSenha);

export default router;