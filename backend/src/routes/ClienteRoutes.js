import express from 'express';
import ClienteController from '../controllers/ClienteController.js';

// Usando o Express diretamente para criar o roteador
const router = express.Router();

// 1. Rota para cadastrar um novo cliente
router.post('/', ClienteController.criar);

// 2. Rota para listar todos os clientes
router.get('/', ClienteController.listarTodos);

// 3. Rota para buscar um cliente pelo ID único
router.get('/:id', ClienteController.buscarPorId); 

// 4. Rota para buscar clientes pelo nome
router.get('/nome/:nome', ClienteController.buscarPorNome); 

// 5. Rota para atualizar os dados de um cliente existente
router.put('/:id', ClienteController.atualizar); 

// 6. Rota para deletar um cliente do sistema
router.delete('/:id', ClienteController.deletar); 

// Exporta o roteador para o arquivo server.js utilizar
export default router;
