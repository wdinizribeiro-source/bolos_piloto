import pool from '../database/database.js';

class ClienteModel {
    // Método para cadastrar um novo cliente
    async criar(cpf, nome_cliente, email_cliente, telefone_cliente) {
        try {
            const sql = `
        INSERT INTO cliente (cpf, nome_cliente, email_cliente, telefone_cliente) 
        VALUES (?, ?, ?, ?)
      `;
            const [resultado] = await pool.query(sql, [cpf, nome_cliente, email_cliente, telefone_cliente]);

            return {
                id_cliente: resultado.insertId,
                cpf,
                nome_cliente,
                email_cliente,
                telefone_cliente
            };
        } catch (error) {
            throw new Error('Erro ao salvar cliente no banco: ' + error.message);
        }
    }

    // Método para listar todos os clientes cadastrados
    async listarTodos() {
        try {
            const sql = 'SELECT id_cliente, cpf, nome_cliente, email_cliente, telefone_cliente FROM cliente';
            const [linhas] = await pool.query(sql);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar clientes: ' + error.message);
        }
    }

    // Método para buscar um cliente específico pelo ID
    async buscarPorId(id) {
        try {
            const sql = 'SELECT id_cliente, cpf, nome_cliente, email_cliente, telefone_cliente FROM cliente WHERE id_cliente = ?';
            const [linhas] = await pool.query(sql, [id]);

            // Como o SELECT retorna um array, pegamos a primeira posição se houver dados
            return linhas.length > 0 ? linhas[0] : null;
        } catch (error) {
            throw new Error('Erro ao buscar cliente por ID: ' + error.message);
        }
    }
    // Método para buscar clientes que contenham parte do nome
    async buscarPorNome(nome) {
        try {
            // O 'LIKE' busca aproximações, e o CONCAT coloca os % ao redor do nome digitado
            const sql = `
        SELECT id_cliente, cpf, nome_cliente, email_cliente, telefone_cliente 
        FROM cliente 
        WHERE nome_cliente LIKE CONCAT('%', ?, '%')
      `;
            const [linhas] = await pool.query(sql, [nome]);
            return linhas;
        } catch (error) {
            throw new Error('Erro ao buscar cliente por nome: ' + error.message);
        }
    }
    // Método para atualizar os dados de um cliente existente
    async atualizar(id_cliente, cpf, nome_cliente, email_cliente, telefone_cliente) {
        try {
            const sql = `
        UPDATE cliente 
        SET cpf = ?, nome_cliente = ?, email_cliente = ?, telefone_cliente = ? 
        WHERE id_cliente = ?
      `;
            await pool.query(sql, [cpf, nome_cliente, email_cliente, telefone_cliente, id_cliente]);

            // Retorna os dados já atualizados para o Controller
            return { id_cliente, cpf, nome_cliente, email_cliente, telefone_cliente };
        } catch (error) {
            throw new Error('Erro ao atualizar cliente no banco: ' + error.message);
        }
    }

    // Método para deletar um cliente do banco de dados
    async deletar(id) {
        try {
            const sql = 'DELETE FROM cliente WHERE id_cliente = ?';
            const [resultado] = await pool.query(sql, [id]);

            // Retorna true se alguma linha foi afetada (deletada) ou false se não
            return resultado.affectedRows > 0;
        } catch (error) {
            throw new Error('Erro ao deletar cliente no banco: ' + error.message);
        }
    }



}


// Exportamos uma INSTÂNCIA da classe para manter o padrão usado no Controller
export default new ClienteModel();
