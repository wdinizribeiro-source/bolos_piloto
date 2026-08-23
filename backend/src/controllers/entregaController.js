import axios from "axios";
import EntregaModel from "../models/EntregaModel.js";

class EntregaController {

    // Adicione este método dentro da classe EntregaController:
async consultarCep(req, res) {
    try {
        const { cep } = req.params;
        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
            return res.status(400).json({ erro: "CEP inválido. Deve conter 8 dígitos." });
        }

        const respostaViaCep = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (respostaViaCep.data.erro) {
            return res.status(404).json({ erro: "CEP não encontrado." });
        }

        // Retorna apenas os dados de endereço necessários para o Front-end
        const { logradouro, bairro, localidade: cidade, uf: estado } = respostaViaCep.data;
        return res.status(200).json({ logradouro, bairro, cidade, estado });
    } catch (error) {
        console.error("Erro interno ao consultar o CEP:", error.message || error);
        return res.status(500).json({ erro: "Falha ao conectar ao ViaCEP ou servidor." });
    }
}

    // 1. CREATE (Criar Entrega com ViaCEP)
    async criar(req, res) {
        try {
            const { id_pedido, cep, numero, complemento, data_entrega } = req.body;
            if (!id_pedido || !cep || !numero) return res.status(400).json({ erro: "Campos obrigatórios faltando." });

            const cepLimpo = cep.replace(/\D/g, "");
            if (cepLimpo.length !== 8) return res.status(400).json({ erro: "CEP inválido. Deve conter 8 dígitos." });

            let respostaViaCep;
            try {
                respostaViaCep = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            } catch (err) {
                return res.status(404).json({ erro: "Falha ao conectar ao ViaCEP." });
            }

            if (respostaViaCep.data.erro) return res.status(404).json({ erro: "CEP não encontrado." });

            const { logradouro, bairro, localidade: cidade, uf: estado } = respostaViaCep.data;
            const dataFinalEntrega = data_entrega || new Date();

            const novaEntrega = await EntregaModel.criar(id_pedido, cepLimpo, logradouro, numero, complemento || null, bairro, cidade, estado, dataFinalEntrega);
            return res.status(201).json({ mensagem: "Entrega registrada!", dados: novaEntrega });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    // 2. READ ALL (Listar todas as entregas)
    async listar(req, res) {
        try {
            const entregas = await EntregaModel.listarTodos();
            return res.status(200).json(entregas);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    // 3. READ BY ID (Buscar entrega específica)
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const entrega = await EntregaModel.buscarPorID(id);
            if (!entrega) return res.status(404).json({ erro: "Entrega não encontrada." });
            return res.status(200).json(entrega);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    // 4. UPDATE (Atualizar entrega e reconsultar ViaCEP se o CEP mudar)
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { id_pedido, cep, numero, complemento, data_entrega } = req.body;

            if (!id_pedido || !cep || !numero) return res.status(400).json({ erro: "Campos obrigatórios faltando." });

            const cepLimpo = cep.replace(/\D/g, "");
            if (cepLimpo.length !== 8) return res.status(400).json({ erro: "CEP inválido." });

            let respostaViaCep;
            try {
                respostaViaCep = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            } catch (err) {
                return res.status(404).json({ erro: "Falha ao consultar ViaCEP no update." });
            }

            if (respostaViaCep.data.erro) return res.status(404).json({ erro: "CEP não encontrado." });

            const { logradouro, bairro, localidade: cidade, uf: estado } = respostaViaCep.data;
            const dataFinalEntrega = data_entrega || new Date();

            const entregaAtualizada = await EntregaModel.atualizar(id, id_pedido, cepLimpo, logradouro, numero, complemento || null, bairro, cidade, estado, dataFinalEntrega);
            
            if (!entregaAtualizada) return res.status(404).json({ erro: "Entrega não encontrada para atualizar." });
            return res.status(200).json({ mensagem: "Entrega atualizada com sucesso!", dados: entregaAtualizada });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    // 5. DELETE (Excluir registro de entrega)
    async excluir(req, res) {
        try {
            const { id } = req.params;
            const deletado = await EntregaModel.excluir(id);
            if (!deletado) return res.status(404).json({ erro: "Entrega não encontrada para excluir." });
            return res.status(200).json({ mensagem: "Entrega excluída com sucesso!" });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}

export default new EntregaController();
