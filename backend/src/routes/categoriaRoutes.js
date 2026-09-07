import express from "express";
import categoriaController from "../controllers/categoriaController.js";
import verificarToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rotas públicas (leitura - qualquer um pode ver as categorias)
router.get("/", categoriaController.listarTodos);
router.get("/:id", categoriaController.listarPorId);

// Rotas protegidas (só admin logado pode criar/editar/excluir)
router.post("/", verificarToken, categoriaController.criar);
router.put("/:id", verificarToken, categoriaController.atualizar);
router.delete("/:id", verificarToken, categoriaController.deletar);

export default router;