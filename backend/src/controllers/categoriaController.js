import categoriaModel from '../models/categoriaModel.js';
import { uploadImagem, deletarImagem } from "../utils/cloudinaryUpload.js";

class CategoriaController {

    // Criar categoria
    async criar(req, res) {
        try {
            const { categoria } = req.body;

            if (!categoria) {
                return res.status(400).json({ error: "Campo obrigatório" });
            }

            let imagem_url = null;
            let imagem_public_id = null;

            if (req.file) {
                const resultadoUpload = await uploadImagem(req.file.buffer, "clientes/erica-bolos/categorias");
                imagem_url = resultadoUpload.secure_url;
                imagem_public_id = resultadoUpload.public_id;
            }

            const novaCategoria = await categoriaModel.criar(categoria, imagem_url, imagem_public_id);

            return res.status(201).json({
                message: "Categoria criada com sucesso",
                categoria: novaCategoria
            });

        } catch (error) {
            if (error.message.includes("Duplicate entry")) {
                return res.status(409).json({ error: "Essa categoria já existe" });
            }
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

            if (!categoria) {
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

            const categoriaAtual = await categoriaModel.listarPorId(id);
            if (!categoriaAtual) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            let imagem_url = categoriaAtual.imagem_url;
            let imagem_public_id = categoriaAtual.imagem_public_id;

            if (req.file) {
                const resultadoUpload = await uploadImagem(req.file.buffer, "clientes/erica-bolos/categorias");
                await deletarImagem(categoriaAtual.imagem_public_id);
                imagem_url = resultadoUpload.secure_url;
                imagem_public_id = resultadoUpload.public_id;
            }

            const atualizado = await categoriaModel.atualizar(id, categoria, imagem_url, imagem_public_id);

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
        // Deletar
    async deletar(req, res) {
        try {
            const { id } = req.params;

            const categoriaAtual = await categoriaModel.listarPorId(id);
            if (!categoriaAtual) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            const deletado = await categoriaModel.deletar(id);

            if (!deletado) {
                return res.status(404).json({ error: "Categoria não encontrada" });
            }

            await deletarImagem(categoriaAtual.imagem_public_id);

            return res.json({
                message: "Categoria deletada com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new CategoriaController();