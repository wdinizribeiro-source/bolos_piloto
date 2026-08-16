import entregaModel from "../models/entregaModel.js";

class EntregaController {
    async criar(req, res) {
        try {
            const { cep, data_entrega, endereco_entrega } = req.body;

            if (!cep || !data_entrega || !endereco_entrega) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            const novaEntrega = await entregaModel.criar(cep, data_entrega, endereco_entrega);
            return res.status(201).json({
                message: 'Entrega criada com sucesso',
                Entrega: novaEntrega
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async listarTodos(req, res) {
        try {
            const entregas = await entregaModel.listarTodos();
            return res.json({
                message: 'Entregas listadas com sucesso',
                Entregas: entregas
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const entrega = await entregaModel.buscarPorID(id);

            if (!entrega) {
                return res.status(404).json({ error: 'Entrega não encontrada' });
            }

            return res.json(entrega);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { cep, endereco_entrega, data_entrega } = req.body;

            const entregaExistente = await entregaModel.buscarPorID(id);

            if (!entregaExistente) {
                return res.status(404).json({ error: 'Entrega não encontrada' });
            }

            if (!cep || !endereco_entrega || !data_entrega) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            const entregaAtualizada = await entregaModel.atualizar(id, cep, endereco_entrega, data_entrega);
            return res.status(200).json({
                message: "Entrega atualizada com sucesso",
                Entrega: entregaAtualizada
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new EntregaController();