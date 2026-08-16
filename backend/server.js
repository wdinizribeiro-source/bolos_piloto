import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clienteRoutes from './src/routes/ClienteRoutes.js'; 
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import entregaRoutes from './src/routes/entregaRoutes.js'; 
import produtoRoutes from './src/routes/produtoRoutes.js'; 

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use("/clientes", clienteRoutes); 
app.use("/categoria",categoriaRoutes);
app.use("/entrega",entregaRoutes);
app.use("/produtos", produtoRoutes); 


const PORT = process.env.PORT_SERVER || 6000;

app.listen(PORT, () => {
    console.log(`servidor rodando http://localhost:${PORT}`);
});
