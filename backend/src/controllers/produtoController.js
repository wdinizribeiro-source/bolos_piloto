import produtoModel from "../models/produtoModel.js";
import { uploadImagem, deletarImagem } from "../utils/cloudinaryUpload.js";

class ProdutoController {
    // Criar produto
     async criar(req, res) {
        try {
            const { nome_produto, preco_unit_produto, quantidade_estoque, id_categoria } = req.body;

            if (
                !nome_produto ||
                preco_unit_produto === undefined || preco_unit_produto === null ||
                quantidade_estoque === undefined || quantidade_estoque === null ||
                !id_categoria
            ) {
                return res.status(400).json({ error: "Campos obrigatórios" });
            }

            let imagem_url = null;
            let imagem_public_id = null;

            if (req.file) {
                const resultadoUpload = await uploadImagem(req.file.buffer, "clientes/erica-bolos/produtos");
                imagem_url = resultadoUpload.secure_url;
                imagem_public_id = resultadoUpload.public_id;
            }

            const novoProduto = await produtoModel.criar(
                nome_produto, preco_unit_produto, quantidade_estoque, id_categoria,
                imagem_url, imagem_public_id
            );

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

            if (
                !nome_produto ||
                preco_unit_produto === undefined || preco_unit_produto === null ||
                quantidade_estoque === undefined || quantidade_estoque === null ||
                !id_categoria
            ) {
                return res.status(400).json({ error: "Campos obrigatórios" });
            }

            const produtoAtual = await produtoModel.listarPorId(id);
            if (!produtoAtual) {
                return res.status(404).json({ error: "Produto não encontrado" });
            }

            let imagem_url = produtoAtual.imagem_url;
            let imagem_public_id = produtoAtual.imagem_public_id;

            if (req.file) {
              const resultadoUpload = await uploadImagem(req.file.buffer, "clientes/erica-bolos/produtos");
await deletarImagem(produtoAtual.imagem_public_id);
                imagem_url = resultadoUpload.secure_url;
                imagem_public_id = resultadoUpload.public_id;
            }

            const atualizado = await produtoModel.atualizar(
                id, nome_produto, preco_unit_produto, quantidade_estoque, id_categoria,
                imagem_url, imagem_public_id
            );

            if (!atualizado) {
                return res.status(404).json({ error: "Produto não encontrado" });
            }

            return res.json({ message: "Produto atualizado com sucesso" });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Deletar produto
   async deletar(req, res) {
    try {
        const { id } = req.params;

        const desativado = await produtoModel.desativar(id);

        if (!desativado) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }

        return res.json({
            message: "Produto removido com sucesso"
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
}

export default new ProdutoController();