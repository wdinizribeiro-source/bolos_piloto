import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clienteRoutes from './src/routes/clienteRoutes.js'; 
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import entregaRoutes from './src/routes/entregaRoutes.js'; // Importe as rotas de categoria

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use("/clientes", clienteRoutes); 
app.use("/categoria",categoriaRoutes);
app.use("/entrega",entregaRoutes);// Adicione esta linha para as rotas de categoria


const PORT = process.env.PORT_SERVER || 6000;

app.listen(PORT, () => {
    console.log(`servidor rodando http://localhost:${PORT}`);
});
