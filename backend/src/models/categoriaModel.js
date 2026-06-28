import pool from '../database/db.js';

class CategoriaModel {
    // Método para cadastrar uma nova categoria
    async criar(categoria) {
        try {
            const sql = `
        INSERT INTO categoria (categoria) 
        VALUES (?)
    `;
            const [resultado] = await pool.query(sql, [categoria]);
            return {
                id_categoria: resultado.insertId,
                categoria
            };
        } catch (error) {
            throw new Error('Erro ao salvar categoria no banco: ' + error.message);
        }
    }

    // Método para listar todas as categorias cadastradas
    async listarTodos() {
        try {
            const sql = 'SELECT id_categoria, categoria FROM categoria';
            const [linhas] = await pool.query(sql);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar categorias: ' + error.message);
        }
    }
    async buscarPorNome(categoria) {
        try {
            const sql = `
        SELECT id_categoria, categoria 
        FROM categoria
        WHERE categoria LIKE CONCAT('%', ?, '%')
    `;
            const [linhas] = await pool.query(sql, [categoria]);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar categoria por nome: ' + error.message);
        }
    }
}
class CategoriaModel {
    // Atualizar categoria
    async atualizar(id, categoria) {
        try {
            const sql = `
        UPDATE categoria
        SET categoria = ?
        WHERE id_categoria = ?  
    `;
            const [resultado] = await pool.query(sql, [categoria, id]);
            return resultado.affectedRows > 0; // true se atualização foi bem-sucedida
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
            return resultado.affectedRows > 0; // true se exclusão foi bem-sucedida
        } catch (error) {
            throw new Error('Erro ao deletar categoria: ' + error.message);
        }
    }
}

export default new CategoriaModel();