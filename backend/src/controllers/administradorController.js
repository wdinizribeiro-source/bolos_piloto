import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AdministradorModel from '../models/administradorModel.js';
import pool from '../database/database.js'; 

const administradorController = {
    // 1. Método temporário para cadastrar com o hash correto
    cadastrarTeste: async (req, res) => {
        const { nome, cpf, email, senha } = req.body;
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(senha, salt);

            const conn = await pool.getConnection();
            const sql = `INSERT INTO administrador (nome_adm, cpf_adm, email_adm, senha_hash) VALUES (?, ?, ?, ?)`;
            await conn.query(sql, [nome, cpf, email, hash]);
            conn.release();

            return res.status(201).json({ message: 'Administrador criado com hash do bcrypt perfeito!' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }, // <-- ESTA VÍRGULA AQUI É O QUE FALTAVA PARA NÃO QUEBRAR O SERVIDOR!

    // 2. Método de Login oficial
    login: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        try {
            const admin = await AdministradorModel.buscarPorEmail(email);
            if (!admin) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }

            const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
            }

            const token = jwt.sign(
                { id_administrador: admin.id_administrador, email_adm: admin.email_adm },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                token,
                admin: {
                    id: admin.id_administrador,
                    nome: admin.nome_adm,
                    email: admin.email_adm
                }
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro interno ao processar o login.', detalhes: error.message });
        }
    }
};

export default administradorController;
