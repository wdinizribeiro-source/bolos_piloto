import { Router } from "express";
import EntregaController from "../controllers/entregaController.js";

const router = Router();

router.get("/cep/:cep", EntregaController.consultarCep);

router.post("/entregas", EntregaController.criar);
router.get("/entregas", EntregaController.listar);
router.get("/entregas/:id", EntregaController.buscarPorId);
router.put("/entregas/:id", EntregaController.atualizar); // Rota de Atualizar
router.delete("/entregas/:id", EntregaController.excluir); // Rota de Deletar

export default router;
