import PedidoModel from '../models/pedidoModel.js';

const pedidoController = {
    // 1. CREATE - Criar o pedido completo com cliente e entrega
   criar: async (req, res) => {
    const { cliente, status, entrega, itens, forma_pagamento } = req.body;

    if (!cliente || !cliente.nome_cliente || !cliente.telefone_cliente) {
        return res.status(400).json({ error: 'Nome e telefone do cliente são obrigatórios.' });
    }
    if (!entrega || !entrega.cep || !entrega.logradouro || !entrega.numero || !entrega.bairro || !entrega.cidade || !entrega.estado) {
        return res.status(400).json({ error: 'Dados de entrega são obrigatórios (cep, logradouro, numero, bairro, cidade, estado).' });
    }
    if (!itens || itens.length === 0) {
        return res.status(400).json({ error: 'O pedido precisa conter pelo menos um produto.' });
    }
    if (!forma_pagamento) {
        return res.status(400).json({ error: 'A forma de pagamento é obrigatória.' });
    }

    try {
        const idPedido = await PedidoModel.criarPedidoCompleto(cliente, status, entrega, itens, forma_pagamento);
        return res.status(201).json({ message: 'Pedido e entrega registrados com sucesso!', id_pedido: idPedido });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno ao processar o seu pedido.', detalhes: error.message });
    }
},

    // 2. READ (Lista) - Buscar todos os pedidos para o painel do ADM
    listar: async (req, res) => {
        try {
            const pedidos = await PedidoModel.listarTodosParaAdm();
            return res.status(200).json(pedidos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar pedidos.', detalhes: error.message });
        }
    },

    // 3. READ (Individual) - Buscar apenas um pedido detalhado
    buscarPorId: async (req, res) => {
        const { id } = req.params;
        try {
            const pedido = await PedidoModel.buscarPorId(id);
            if (!pedido) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }
            return res.status(200).json(pedido);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar o pedido.', detalhes: error.message });
        }
    },

    // 4. UPDATE - Atualizar o status do pedido (confirmado, preparando, etc.)
    atualizarStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const statusPermitidos = ['confirmado', 'preparando', 'enviado', 'finalizado', 'cancelado'];
        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Escolha entre: confirmado, preparando, enviado ou finalizado.' });
        }

        try {
            const atualizado = await PedidoModel.atualizarStatus(id, status);
            if (!atualizado) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }
            return res.status(200).json({ message: `Status do pedido #${id} alterado para '${status}'!` });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar status.', detalhes: error.message });
        }
    },

    // 5. DELETE - Cancelar/Excluir um pedido do sistema
    deletar: async (req, res) => {
        const { id } = req.params;
        try {
            const deletado = await PedidoModel.deletar(id);
            if (!deletado) {
                return res.status(404).json({ error: 'Pedido não encontrado para exclusão.' });
            }
            return res.status(200).json({ message: `Pedido #${id} excluído com sucesso do sistema.` });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir o pedido.', detalhes: error.message });
        }
    }
};

export default pedidoController;