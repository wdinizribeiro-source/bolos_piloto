import express from 'express';
import administradorController from '../controllers/administradorController.js';

const router = express.Router();
router.post('/cadastrar-teste', administradorController.cadastrarTeste);
// Rota POST para o administrador fazer login
router.post('/login', administradorController.login);

export default router;
