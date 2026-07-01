import express from "express";
import entregaController from "../controllers/entregaController.js";

const router = express.Router();

router.post("/",entregaController.criar);
router.get("/",entregaController.listarTodos);
router.put("/",entregaController.atualizar);
router.get("/",entregaController.buscarPorId);

export default router;
