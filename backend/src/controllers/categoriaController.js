import categoriaModel from '../models/categoriaModel.js';

class CategoriaController {

    // Criar categoria
    async criar(req, res) {
        try {
            const { categoria } = req.body;

            if (!categoria) {
                return res.status(400).json({ error: "Campo obrigatório" });
            }

            const novaCategoria = await categoriaModel.criar(categoria);

            return res.status(201).json({
                message: "Categoria criada com sucesso",
                categoria: novaCategoria
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Listar todas
    async listarTodos(req, res) {
        try {
            const categorias = await categoriaModel.listarTodos();

            return res.json({
                message: "Categorias listadas com sucesso",
                categorias
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Buscar por ID
    async listarPorId(req, res) {
        try {
            const { id } = req.params;

            const categoria = await categoriaModel.listarPorId(id);

            if (!categoria || categoria.length === 0) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            return res.json(categoria);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Atualizar
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { categoria } = req.body;

            if (!categoria) {
                return res.status(400).json({ error: "Campo obrigatório" });
            }

            const atualizado = await categoriaModel.atualizar(id, categoria);

            if (!atualizado) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            return res.json({
                message: "Categoria atualizada com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Deletar
    async deletar(req, res) {
        try {
            const { id } = req.params;

            const deletado = await categoriaModel.deletar(id);

            if (!deletado) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            return res.json({
                message: "Categoria deletada com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new CategoriaController();
