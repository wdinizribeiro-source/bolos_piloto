import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clienteRoutes from './src/routes/ClienteRoutes.js'; 
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import entregaRoutes from './src/routes/entregaRoutes.js'; 
import produtoRoutes from './src/routes/produtoRoutes.js'; 
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import administradorRoutes from './src/routes/administradorRoutes.js';
import configLojaRoutes from './src/routes/configLojaRoutes.js';



const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use("/configLoja", configLojaRoutes);
app.use("/administrador", administradorRoutes);
app.use("/pedido", pedidoRoutes);
app.use("/clientes", clienteRoutes); 
app.use("/categoria",categoriaRoutes);
app.use("/", entregaRoutes);
app.use("/produtos", produtoRoutes); 


const PORT = process.env.PORT_SERVER || 8000;

app.listen(PORT, () => {
    console.log(`servidor rodando http://localhost:${PORT}`);
});
