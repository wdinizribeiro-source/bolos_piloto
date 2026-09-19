import pool from "../database/database.js";

class ProdutoModel {
    // Criar produto
    // Criar produto
async criar(nome_produto, preco_unit_produto, quantidade_estoque, id_categoria, imagem_url = null, imagem_public_id = null) {
    try {
        const sql = `
      INSERT INTO produto (nome_produto, preco_unit_produto, quantidade_estoque, id_categoria, imagem_url, imagem_public_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [resultado] = await pool.query(sql, [
            nome_produto,
            preco_unit_produto,
            quantidade_estoque,
            id_categoria,
            imagem_url,
            imagem_public_id,
        ]);
        return {
            id_produto: resultado.insertId,
            nome_produto,
            preco_unit_produto,
            quantidade_estoque,
            id_categoria,
            imagem_url,
        };
    } catch (error) {
        throw new Error("Erro ao salvar produto no banco: " + error.message);
    }
}

// Listar todos (adicionar p.imagem_url no SELECT)
async listarTodos() {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, p.imagem_url, c.categoria 
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

// listarPorId (adicionar p.imagem_url e p.imagem_public_id no SELECT)
async listarPorId(id_produto) {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, p.imagem_url, p.imagem_public_id, c.categoria 
            FROM produto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_produto = ? AND p.ativo = TRUE
        `;
        const [linhas] = await pool.query(sql, [id_produto]);
        return linhas[0];
    } catch (error) {
        throw new Error("Erro ao buscar produto por id: " + error.message);
    }
}

// buscarPorNome (adicionar p.imagem_url no SELECT)
async buscarPorNome(nome_produto) {
    try {
        const sql = `
            SELECT p.id_produto, p.nome_produto, p.preco_unit_produto, p.quantidade_estoque, p.id_categoria, p.imagem_url, c.categoria 
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

// Atualizar produto
async atualizar(id_produto, nome_produto, preco_unit_produto, quantidade_estoque, id_categoria, imagem_url, imagem_public_id) {   
    try {
        const sql = `
      UPDATE produto 
      SET nome_produto = ?, preco_unit_produto = ?, quantidade_estoque = ?, id_categoria = ?, imagem_url = ?, imagem_public_id = ?
      WHERE id_produto = ?
    `;
        const [resultado] = await pool.query(sql, [
            nome_produto,
            preco_unit_produto,
            quantidade_estoque,
            id_categoria,
            imagem_url,
            imagem_public_id,
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
