import pool from "../database/database.js";

class EntregaModel {
    // 1. CREATE
    async criar(id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega) {
        try {
            const sql = `
                INSERT INTO entrega (id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [resultado] = await pool.query(sql, [
                id_pedido,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                data_entrega
            ]);

            return {
                id_entrega: resultado.insertId,
                id_pedido,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                data_entrega
            };

        } catch (erro) {
            console.error("Erro ao criar entrega:", erro);
            throw erro;
        }
    }

    // 2. READ ALL
    async listarTodos() {
        try {
            const sql = 'SELECT id_entrega, id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega FROM entrega';
            const [linhas] = await pool.query(sql);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar entregas: ' + error.message);
        }
    }

    // 3. READ BY ID
    async buscarPorID(id) {
        try {
            if (!id) {
                throw new Error("ID não informado");
            }
    
            const sql = `
                SELECT id_entrega, id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega
                FROM entrega
                WHERE id_entrega = ?
            `;
    
            const [linhas] = await pool.query(sql, [id]);
            return linhas.length > 0 ? linhas[0] : null; // Retorna o objeto direto se achar
    
        } catch (error) {
            throw new Error('Erro ao buscar entrega por ID: ' + error.message);
        }
    }

    // 4. UPDATE
    async atualizar(id, id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega) {
        try {
            if (!id) {
                throw new Error("ID não informado");
            }
    
            const sql = `
                UPDATE entrega
                SET id_pedido = ?, cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, data_entrega = ?
                WHERE id_entrega = ?
            `;
    
            // Ajustado: parâmetros limpos e na ordem correta das interrogações do SQL
            const [resultado] = await pool.query(sql, [
                id_pedido,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                data_entrega,
                id
            ]);
    
            if (resultado.affectedRows === 0) {
                return null; 
            }
    
            return {
                id_entrega: id,
                id_pedido,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                data_entrega
            };
    
        } catch (error) {
            throw new Error("Erro ao atualizar entrega: " + error.message);
        }
    }

    // 5. DELETE
    async excluir(id) {
        try {
            if (!id) {
                throw new Error("ID não informado");
            }
    
            const sql = `DELETE FROM entrega WHERE id_entrega = ?`;
            const [resultado] = await pool.query(sql, [id]);
    
            return resultado.affectedRows > 0;
    
        } catch (error) {
            throw new Error("Erro ao excluir entrega: " + error.message);
        }
    }
}

export default new EntregaModel();
