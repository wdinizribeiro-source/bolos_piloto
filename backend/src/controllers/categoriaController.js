import categoriamodel from '../models/categoriaModel.js';

class CategoriaController {
    // Controlador para criar uma nova categoria
    async criar(req, res) {
        try {
            const { categoria } = req.body;
            if (!categoria) {
                return res.status(400).json({ error: 'O campo categoria é obrigatório.' });
            }   
        const novaCategoria = await categoriamodel.criar(categoria);
            res.status(201).json(novaCategoria);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }   

    }