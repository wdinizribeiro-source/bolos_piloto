import express from 'express';
import pedidoController from '../controllers/pedidoController.js';
import verificarToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', pedidoController.criar);                    // Criar pedido (Público)
router.get('/adm/listar',verificarToken, pedidoController.listar);          // Listar todos (ADM)
router.get('/adm/:id',verificarToken, pedidoController.buscarPorId);        // Buscar um único pedido por ID (ADM)
router.put('/adm/:id/status', verificarToken, pedidoController.atualizarStatus); // Atualizar status (ADM)
router.delete('/adm/:id', verificarToken, pedidoController.deletar);         // Deletar pedido (ADM)

export default router;
