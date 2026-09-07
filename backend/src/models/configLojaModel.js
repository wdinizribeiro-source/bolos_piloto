import pool from '../database/database.js';

const ConfigLojaModel = {
    // Busca o status atual da loja (sempre o registro id=1)
    buscarStatus: async () => {
        const conn = await pool.getConnection();
        try {
            const sql = `SELECT loja_aberta, mensagem_fechado FROM config_loja WHERE id = 1`;
            const [rows] = await conn.query(sql);
            return rows[0];
        } finally {
            conn.release();
        }
    },

    // Atualiza o status (abre ou fecha a loja)
    atualizarStatus: async (lojaAberta, mensagemFechado) => {
        const conn = await pool.getConnection();
        try {
            const sql = `UPDATE config_loja SET loja_aberta = ?, mensagem_fechado = ? WHERE id = 1`;
            const [result] = await conn.query(sql, [lojaAberta, mensagemFechado]);
            return result.affectedRows > 0;
        } finally {
            conn.release();
        }
    }
};

export default ConfigLojaModel;