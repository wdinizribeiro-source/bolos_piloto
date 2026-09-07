import ConfigLojaModel from '../models/configLojaModel.js';

const configLojaController = {
    // Rota pública: qualquer cliente pode consultar se a loja está aberta
    buscarStatus: async (req, res) => {
        try {
            const status = await ConfigLojaModel.buscarStatus();
            return res.status(200).json(status);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar status da loja.', detalhes: error.message });
        }
    },

    // Rota protegida: só admin logado pode abrir/fechar a loja
    atualizarStatus: async (req, res) => {
        const { loja_aberta, mensagem_fechado } = req.body;

        if (typeof loja_aberta !== 'boolean') {
            return res.status(400).json({ error: 'O campo loja_aberta é obrigatório e deve ser true ou false.' });
        }

        try {
            const atualizado = await ConfigLojaModel.atualizarStatus(
                loja_aberta,
                mensagem_fechado || 'Estamos fechados no momento. Volte em breve!'
            );

            if (!atualizado) {
                return res.status(404).json({ error: 'Configuração da loja não encontrada.' });
            }

            return res.status(200).json({
                message: loja_aberta ? 'Loja aberta com sucesso!' : 'Loja fechada com sucesso!'
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar status da loja.', detalhes: error.message });
        }
    }
};

export default configLojaController;