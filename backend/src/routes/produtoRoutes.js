import express from "express";
import produtoController from "../controllers/produtoController.js";

const router = express.Router();

// Rota para criar um novo produto
router.post("/", produtoController.criar);

// Rota para listar todos os produtos
router.get("/", produtoController.listarTodos);

// Rota para buscar produtos pelo nome (precisa vir ANTES de /:id)
router.get("/buscar", produtoController.buscarPorNome);

// Rota para buscar um produto pelo ID
router.get("/:id", produtoController.listarPorId);

// Rota para atualizar um produto existente
router.put("/:id", produtoController.atualizar);

// Rota para deletar um produto
router.delete("/:id", produtoController.deletar);

export default router;