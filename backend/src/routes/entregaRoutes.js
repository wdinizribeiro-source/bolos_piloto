import { Router } from "express";
import EntregaController from "../controllers/EntregaController.js";

const router = Router();

router.post("/entregas", EntregaController.criar);
router.get("/entregas", EntregaController.listar);
router.get("/entregas/:id", EntregaController.buscarPorId);
router.put("/entregas/:id", EntregaController.atualizar); // Rota de Atualizar
router.delete("/entregas/:id", EntregaController.excluir); // Rota de Deletar

export default router;
