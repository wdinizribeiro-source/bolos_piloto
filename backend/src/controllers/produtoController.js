import produtoModel from "../models/produtoModel.js";

class ProdutoController {
    // Criar produto
    async criar(req, res) {
        try {
            const { nome_produto, preco_unit_produto, quantidade_estoque, id_categoria } = req.body;

            if (!nome_produto || !preco_unit_produto || !quantidade_estoque || !id_categoria) {
                return res.status(400).json({ error: "Campos obrigatórios" });
            }

            const novoProduto = await produtoModel.criar(nome_produto, preco_unit_produto, quantidade_estoque, id_categoria);

            return res.status(201).json({
                message: "Produto criado com sucesso",
                produto: novoProduto
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Listar todos os produtos
    async listarTodos(req, res) {
        try {
            const produtos = await produtoModel.listarTodos();

            return res.json({
                message: "Produtos listados com sucesso",
                produtos
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Buscar produto por ID
    async listarPorId(req, res) {
        try {
            const { id } = req.params;

            const produto = await produtoModel.listarPorId(id);

            if (!produto || produto.length === 0) {
                return res.status(404).json({ error: "Produto não encontrado" });
            }

            return res.json(produto);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Buscar produto por nome
    async buscarPorNome(req, res) {
        try {
            const { nome_produto } = req.query;

            if (!nome_produto) {
                return res.status(400).json({ error: "Campo obrigatório" });
            }

            const produtos = await produtoModel.buscarPorNome(nome_produto);

            return res.json({
                message: "Produtos buscados com sucesso",
                produtos
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Atualizar produto
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome_produto, preco_unit_produto, quantidade_estoque, id_categoria } = req.body;

            if (!nome_produto || !preco_unit_produto || !quantidade_estoque || !id_categoria) {
                return res.status(400).json({ error: "Campos obrigatórios" });
            }

            const atualizado = await produtoModel.atualizar(id, nome_produto, preco_unit_produto, quantidade_estoque, id_categoria);

            if (!atualizado) {
                return res.status(404).json({ error: "Produto não encontrado" });
            }

            return res.json({
                message: "Produto atualizado com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Deletar produto
    async deletar(req, res) {
        try {
            const { id } = req.params;

            const deletado = await produtoModel.deletar(id);

            if (!deletado) {
                return res.status(404).json({ error: "Produto não encontrado" });
            }

            return res.json({
                message: "Produto deletado com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new ProdutoController();