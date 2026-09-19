import express from "express";
import produtoController from "../controllers/produtoController.js";
import verificarToken from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadImagem.js";

const router = express.Router();

router.get("/", produtoController.listarTodos);
router.get("/buscar", produtoController.buscarPorNome);
router.get("/:id", produtoController.listarPorId);

router.post("/", verificarToken, upload.single("imagem"), produtoController.criar);
router.put("/:id", verificarToken, upload.single("imagem"), produtoController.atualizar);
router.delete("/:id", verificarToken, produtoController.deletar);

export default router;