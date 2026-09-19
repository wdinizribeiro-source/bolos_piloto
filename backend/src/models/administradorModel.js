import pool from '../database/database.js';

const AdministradorModel = {
    // Busca um administrador pelo e-mail para validar o login
    buscarPorEmail: async (email_adm) => {
        const conn = await pool.getConnection();
        try {
            const sql = `SELECT * FROM administrador WHERE email_adm = ? LIMIT 1`;
            const [rows] = await conn.query(sql, [email_adm]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            conn.release();
        }
    },

    // Busca um administrador pelo ID, usado no middleware pra confirmar que ele ainda existe
    buscarPorId: async (id_administrador) => {
        const conn = await pool.getConnection();
        try {
            const sql = `SELECT id_administrador, nome_adm, email_adm FROM administrador WHERE id_administrador = ? LIMIT 1`;
            const [rows] = await conn.query(sql, [id_administrador]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            conn.release();
        }
    }
};

export default AdministradorModel;