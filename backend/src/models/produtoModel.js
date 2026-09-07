import pool from "../database/database.js";

class ProdutoModel {
    // Criar produto
    async criar(nome_produto, preco_unit_produto, quantidade_estoque, id_categoria) {
        try {
            const sql = `
        INSERT INTO produto (nome_produto, preco_unit_produto, quantidade_estoque, id_categoria) 
        VALUES (?, ?, ?, ?)
      `;
            const [resultado] = await pool.query(sql, [
                nome_produto,
                preco_unit_produto,
                quantidade_estoque,
                id_categoria,
            ]);
            return {
                id_produto: resultado.insertId,
                nome_produto,
                preco_unit_produto,
                quantidade_estoque,
                id_categoria,
            };
        } catch (error) {
            throw new Error("Erro ao salvar produto no banco: " + error.message);
        }
    }

    // Listar todos os produtos
    

async listarTodos() {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, c.categoria 
            FROM produto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.ativo = TRUE
        `;
        const [linhas] = await pool.query(sql);
        return linhas;
    } catch (error) {
        throw new Error("Erro ao buscar produtos: " + error.message);
    }
}

async listarPorId(id_produto) {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, c.categoria 
            FROM produto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_produto = ? AND p.ativo = TRUE
        `;
        const [linhas] = await pool.query(sql, [id_produto]);
        return linhas[0]; // objeto único (ou undefined, se não encontrar)
    } catch (error) {
        throw new Error("Erro ao buscar produto por id: " + error.message);
    }
}

   async buscarPorNome(nome_produto) {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, c.categoria 
            FROM produto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.nome_produto LIKE CONCAT('%', ?, '%') AND p.ativo = TRUE
        `;
        const [linhas] = await pool.query(sql, [nome_produto]);
        return linhas;
    } catch (error) {
        throw new Error("Erro ao buscar produto por nome: " + error.message);
    }
}

    async atualizar(id_produto, nome_produto, preco_unit_produto, quantidade_estoque, id_categoria) {   
        try {
            const sql = `
        UPDATE produto 
        SET nome_produto = ?, preco_unit_produto = ?, quantidade_estoque = ?, id_categoria = ?
        WHERE id_produto = ?
      `;
            const [resultado] = await pool.query(sql, [
                nome_produto,
                preco_unit_produto,
                quantidade_estoque,
                id_categoria,
                id_produto,
            ]);
            return resultado.affectedRows > 0;
        } catch (error) {
            throw new Error("Erro ao atualizar produto no banco: " + error.message);
        }
    }

    async desativar(id_produto) {
    try {
        const sql = `
            UPDATE produto 
            SET ativo = FALSE
            WHERE id_produto = ?
        `;
        const [resultado] = await pool.query(sql, [id_produto]);
        return resultado.affectedRows > 0;
    } catch (error) {
        throw new Error("Erro ao desativar produto no banco: " + error.message);
    }
}
}

export default new ProdutoModel();
