import express from 'express';
import configLojaController from '../controllers/configLojaController.js';
import verificarToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota pública: o cliente consulta se a loja está aberta
router.get('/status', configLojaController.buscarStatus);


// Rota protegida: só admin logado pode abrir/fechar a loja
router.put('/status', verificarToken, configLojaController.atualizarStatus);

export default router;