import pool from '../database/database.js';

class CategoriaModel {
    // Criar categoria
    async criar(categoria, imagem_url = null, imagem_public_id = null) {
        try {
            const sql = `
                INSERT INTO categoria (categoria, imagem_url, imagem_public_id) 
                VALUES (?, ?, ?)
            `;
            const [resultado] = await pool.query(sql, [categoria, imagem_url, imagem_public_id]);
            return {
                id_categoria: resultado.insertId,
                categoria,
                imagem_url
            };
        } catch (error) {
            throw new Error('Erro ao salvar categoria no banco: ' + error.message);
        }
    }

    // Listar todas
    async listarTodos() {
        try {
            const sql = 'SELECT id_categoria, categoria, imagem_url FROM categoria';
            const [linhas] = await pool.query(sql);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar categorias: ' + error.message);
        }
    }

    // Buscar por nome
    async buscarPorNome(categoria) {
        try {
            const sql = `
                SELECT id_categoria, categoria, imagem_url
                FROM categoria
                WHERE categoria LIKE CONCAT('%', ?, '%')
            `;
            const [linhas] = await pool.query(sql, [categoria]);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar categoria por nome: ' + error.message);
        }
    }

    async listarPorId(id) {
        try {
            const sql = `
                SELECT id_categoria, categoria, imagem_url, imagem_public_id
                FROM categoria
                WHERE id_categoria = ?
            `;
            const [linhas] = await pool.query(sql, [id]);
            return linhas[0]; // objeto único, igual ao padrão do produtoModel
        } catch (error) {
            throw new Error('Erro ao buscar categoria por ID: ' + error.message);
        }
    }

    // Atualizar categoria
    async atualizar(id, categoria, imagem_url, imagem_public_id) {
        try {
            const sql = `
                UPDATE categoria
                SET categoria = ?, imagem_url = ?, imagem_public_id = ?
                WHERE id_categoria = ?
            `;
            const [resultado] = await pool.query(sql, [categoria, imagem_url, imagem_public_id, id]);
            return resultado.affectedRows > 0;
        } catch (error) {
            throw new Error('Erro ao atualizar categoria: ' + error.message);
        }
    }

    // Deletar categoria
    async deletar(id) {
        try {
            const sql = `
                DELETE FROM categoria
                WHERE id_categoria = ?
            `;
            const [resultado] = await pool.query(sql, [id]);
            return resultado.affectedRows > 0;
        } catch (error) {
            throw new Error('Erro ao deletar categoria: ' + error.message);
        }
    }
}

export default new CategoriaModel();