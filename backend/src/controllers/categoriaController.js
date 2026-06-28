import categoriamodel from '../models/categoriaModel.js';

class CategoriaController {
    // Controlador para criar uma nova categoria
    async criar(req, res) {
        try {
            const { categoria } = req.body;
            