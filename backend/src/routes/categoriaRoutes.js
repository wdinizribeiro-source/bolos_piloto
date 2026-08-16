import express from "express";
import categoriaController from "../controllers/categoriaController.js";


const router = express.Router();

router.get("/", categoriaController.listarTodos);
router.get("/:id", categoriaController.listarPorId);
router.post("/", categoriaController.criar);
router.put("/:id", categoriaController.atualizar);
router.delete("/:id", categoriaController.deletar);

export default router;


