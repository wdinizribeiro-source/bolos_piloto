import ClienteModel from "../models/ClienteModel.js"; // Adicionado o .js aqui

class ClienteController {
    // Controlador para criar um novo cliente
    async criar(req, res) {
        try {
            const { cpf, nome_cliente, email_cliente, telefone_cliente } = req.body;

            if (!cpf || !nome_cliente || !email_cliente || !telefone_cliente) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }
            const novoCliente = await ClienteModel.criar(cpf, nome_cliente, email_cliente, telefone_cliente);
            return res.status(201).json({
                message: 'Cliente criado com sucesso',
                Cliente: novoCliente
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }   
    } // <-- Fechamento correto da função criar()

    // Controlador para listar todos os clientes
    async listarTodos(req, res) {
        try {
            const clientes = await ClienteModel.listarTodos();
            return res.json({
                message: 'Clientes listados com sucesso',
                Clientes: clientes
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }       
    }    

    // Controlador para buscar um cliente por ID
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;      
            const cliente = await ClienteModel.buscarPorId(id);
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            
            return res.json(cliente);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async buscarPorNome(req, res) {
        try {
            const { nome } = req.params;      
            const cliente = await ClienteModel.buscarPorNome(nome);

            if (!cliente || cliente.length === 0) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }   
            return res.json(cliente);
        }   catch (error) {
            return res.status(500).json({ error: error.message });
        }   
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { cpf, nome_cliente, email_cliente, telefone_cliente } = req.body;
            const clienteExistente = await ClienteModel.buscarPorId(id);

            if (!clienteExistente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }   
            if (!cpf || !nome_cliente || !email_cliente || !telefone_cliente) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }
            const clienteAtualizado = await ClienteModel.atualizar(id, cpf, nome_cliente, email_cliente, telefone_cliente);
            return res.status(200).json({
                message:"cliente Atualizado com sucesso",
                Cliente: clienteAtualizado});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
       
    }  
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const clienteExistente = await ClienteModel.buscarPorId(id);
            if (!clienteExistente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }   
            await ClienteModel.deletar(id);
            return res.json({ message: 'Cliente deletado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }  
    } 
} // <-- Fechamento da classe ClienteController

export default new ClienteController(); 