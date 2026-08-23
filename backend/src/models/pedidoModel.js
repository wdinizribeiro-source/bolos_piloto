import pool from '../database/database.js';

const PedidoModel = {
    // 1. CREATE - Criar pedido completo com cliente e entrega
    criarPedidoCompleto: async (dadosCliente, statusPedido, dadosEntrega, itens, formaPagamento) => {
        const conn = await pool.getConnection(); 
        try {
            await conn.beginTransaction();

            // Busca ou insere o cliente
            const sqlBuscaCliente = `SELECT id_cliente FROM cliente WHERE nome_cliente = ? AND telefone_cliente = ? LIMIT 1`;
            const [rows] = await conn.query(sqlBuscaCliente, [dadosCliente.nome_cliente, dadosCliente.telefone_cliente]);
            
            let idCliente;
            if (rows.length > 0) {
                idCliente = rows[0].id_cliente;
            } else {
                const sqlInsertCliente = `INSERT INTO cliente (nome_cliente, telefone_cliente) VALUES (?, ?)`;
                const [resCliente] = await conn.query(sqlInsertCliente, [dadosCliente.nome_cliente, dadosCliente.telefone_cliente]);
                idCliente = resCliente.insertId;
            }

            // Calcula o total do pedido a partir dos itens (quantidade x preço unitário)
            const totalPedido = itens.reduce((soma, item) => {
                return soma + (item.quantidade * item.preco_unitario_ped);
            }, 0);

            // Insere o pedido (agora já com o total calculado)
            const sqlPedido = `INSERT INTO pedido (id_cliente, status, total) VALUES (?, ?, ?)`;
            const [resPedido] = await conn.query(sqlPedido, [idCliente, statusPedido || 'confirmado', totalPedido]);
            const idPedido = resPedido.insertId;

            // Insere a entrega vinculada ao id_pedido
            // Insere a entrega vinculada ao id_pedido
const sqlEntrega = `INSERT INTO entrega (id_pedido, cep, logradouro, numero, complemento, bairro, cidade, estado, data_entrega, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
await conn.query(sqlEntrega, [
    idPedido,
    dadosEntrega.cep,
    dadosEntrega.logradouro,
    dadosEntrega.numero,
    dadosEntrega.complemento || null,
    dadosEntrega.bairro,
    dadosEntrega.cidade,
    dadosEntrega.estado,
    dadosEntrega.data_entrega || null,
    dadosEntrega.observacao || null
]);
// Insere o registro de pagamento vinculado ao id_pedido
const sqlPagamento = `INSERT INTO pagamento (id_pedido, forma_pagamento, status) VALUES (?, ?, ?)`;
await conn.query(sqlPagamento, [idPedido, formaPagamento, 'pendente']);


            // Insere os itens do pedido
            const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario_ped) VALUES ?`;
            const valoresItens = itens.map(item => [
                idPedido, 
                item.id_produto, 
                item.quantidade, 
                item.preco_unitario_ped
            ]);
            
            await conn.query(sqlItem, [valoresItens]);

            await conn.commit();
            return idPedido;

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    
    // 2. READ (Lista) - Busca todos os pedidos detalhados para o ADM ver na tela
    listarTodosParaAdm: async () => {
        const conn = await pool.getConnection();
        try {
            const sql = `
                SELECT 
                    p.id_pedido, 
                    ANY_VALUE(p.status) AS status, 
                    ANY_VALUE(p.data_pedido) AS data_pedido,
                    ANY_VALUE(c.nome_cliente) AS nome_cliente, 
                    ANY_VALUE(c.telefone_cliente) AS telefone_cliente,
                    ANY_VALUE(e.cep) AS cep, 
                    ANY_VALUE(e.logradouro) AS logradouro, 
                    ANY_VALUE(e.data_entrega) AS data_entrega,
                    GROUP_CONCAT(
                        CONCAT(pr.nome_produto, ' (x', ip.quantidade, ')') 
                        SEPARATOR ', '
                    ) AS resumo_produtos,
                    SUM(ip.quantidade * ip.preco_unitario_ped) AS total_pedido
                FROM pedido p
                INNER JOIN cliente c ON p.id_cliente = c.id_cliente
                LEFT JOIN entrega e ON p.id_pedido = e.id_pedido
                INNER JOIN item_pedido ip ON p.id_pedido = ip.id_pedido
                INNER JOIN produto pr ON ip.id_produto = pr.id_produto
                GROUP BY p.id_pedido
                ORDER BY p.id_pedido DESC
            `;
            const [rows] = await conn.query(sql);
            return rows;
        } finally {
            conn.release();
        }
    },

    // 3. UPDATE - Altera o ENUM do status (confirmado -> preparando -> enviado etc.)
    atualizarStatus: async (id_pedido, novoStatus) => {
        const conn = await pool.getConnection();
        try {
            const sql = `UPDATE pedido SET status = ? WHERE id_pedido = ?`;
            const [result] = await conn.query(sql, [novoStatus, id_pedido]);
            return result.affectedRows > 0;
        } finally {
            conn.release();
        }
    },

    // 4. READ (Individual) - Buscar um pedido específico pelo ID
    buscarPorId: async (id_pedido) => {
        const conn = await pool.getConnection();
        try {
            // 1ª consulta: dados do pedido, cliente e entrega
            const sql = `
                SELECT p.*, c.nome_cliente, c.telefone_cliente, 
                e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.data_entrega, e.observacao,
                pg.forma_pagamento
            FROM pedido p
            INNER JOIN cliente c ON p.id_cliente = c.id_cliente
            LEFT JOIN entrega e ON p.id_pedido = e.id_pedido
            LEFT JOIN pagamento pg ON p.id_pedido = pg.id_pedido
            WHERE p.id_pedido = ?
            `;
            const [rows] = await conn.query(sql, [id_pedido]);

            if (rows.length === 0) {
                return null;
            }

            const pedido = rows[0];

            // 2ª consulta: itens do pedido
            const sqlItens = `
                SELECT pr.nome_produto, ip.quantidade, ip.preco_unitario_ped
                FROM item_pedido ip
                INNER JOIN produto pr ON ip.id_produto = pr.id_produto
                WHERE ip.id_pedido = ?
            `;
            const [itens] = await conn.query(sqlItens, [id_pedido]);

            // Junta os itens dentro do objeto do pedido
            pedido.itens = itens;

            // Recalcula o total a partir dos itens, garantindo consistência
            // (cobre pedidos antigos com total desatualizado ou zerado no banco)
            pedido.total = itens.reduce((soma, item) => {
                return soma + (item.quantidade * item.preco_unitario_ped);
            }, 0);

            return pedido;
        } finally {
            conn.release();
        }
    },

    // 5. DELETE - Deletar um pedido do sistema
    deletar: async (id_pedido) => {
        const conn = await pool.getConnection();
        try {
            const sql = `DELETE FROM pedido WHERE id_pedido = ?`;
            const [result] = await conn.query(sql, [id_pedido]);
            return result.affectedRows > 0;
        } finally {
            conn.release();
        }
    }
};

export default PedidoModel;