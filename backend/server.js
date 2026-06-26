import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clienteRoutes from './src/routes/clienteRoutes.js'; 

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use(clienteRoutes); 

const PORT = process.env.PORT_SERVER || 6000;

app.listen(PORT, () => {
    console.log(`servidor rodando http://localhost:${PORT}`);
});
