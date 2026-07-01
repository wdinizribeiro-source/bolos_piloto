import pool from "../database/database.js";

class EntregaModel {
    async criar(cep, endereco_entrega, data_entrega) {
        try {
            const sql = `
                INSERT INTO entrega (cep, endereco_entrega, data_entrega)
                VALUES (?, ?, ?)
            `;

            const [resultado] = await pool.query(sql, [
                cep,
                endereco_entrega,
                data_entrega
            ]);

            return {
                id_entrega: resultado.insertId,
                cep,
                endereco_entrega,
                data_entrega
            };

        } catch (erro) {
            console.error("Erro ao criar entrega:", erro);
            throw erro;
        }
    }

    async listarTodos (){
        try {
            const sql = 'SELECT id_entrega, cep, endereco_entrega, data_entrega FROM entrega';
            const [linhas] = await pool.query(sql);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar entrega: ' + error.message);
        }
    }
    async buscarPorID(id) {
        try {
            if (!id) {
                throw new Error("ID não informado");
            }
    
            const sql = `
                SELECT id_entrega, cep, endereco_entrega, data_entrega
                FROM entrega
                WHERE id_entrega = ?
            `;
    
            const [linhas] = await pool.query(sql, [id]);
    
            return linhas.length > 0 ? linhas[0] : null;
    
        } catch (error) {
            throw new Error('Erro ao buscar entrega por ID: ' + error.message);
        }
    }
    async atualizar(id, cep, endereco_entrega, data_entrega) {
        try {
            if (!id) {
                throw new Error("ID não informado");
            }
    
            const sql = `
                UPDATE entrega
                SET cep = ?, endereco_entrega = ?, data_entrega = ?
                WHERE id_entrega = ?
            `;
    
            const [resultado] = await pool.query(sql, [
                cep,
                endereco_entrega,
                data_entrega,
                id
            ]);
    
            // Verifica se atualizou algum registro
            if (resultado.affectedRows === 0) {
                return null; // nenhum ID encontrado
            }
    
            return {
                id_entrega: id,
                cep,
                endereco_entrega,
                data_entrega
            };
    
        } catch (error) {
            throw new Error("Erro ao atualizar entrega: " + error.message);
        }
    }
    
    }

    export default new EntregaModel();