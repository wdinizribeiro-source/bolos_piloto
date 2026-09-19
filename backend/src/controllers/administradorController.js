import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AdministradorModel from '../models/administradorModel.js';
import pool from '../database/database.js';
import { normalizarNome } from '../utils/validate/normalizarNome.js';
import { normalizarEmail } from '../utils/validate/normalizarEmail.js';

const isProd = process.env.NODE_ENV === 'production';

const administradorController = {
    
    cadastrar: async (req, res) => {
    const { nome, cpf, email, senha } = req.body;

    if (!nome || !cpf || !email || !senha) {
        return res.status(400).json({ error: 'Nome, CPF, e-mail e senha são obrigatórios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    if (senha.length < 8) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    // Normalização: depois da validação, antes de usar os dados
    const nomeNormalizado = normalizarNome(nome);
    const emailNormalizado = normalizarEmail(email);

    let conn;
    try {
        conn = await pool.getConnection();

        const [existente] = await conn.query(
            `SELECT id_administrador FROM administrador WHERE email_adm = ? OR cpf_adm = ? LIMIT 1`,
            [emailNormalizado, cpfDigits]

        );

        if (existente.length > 0) {
            return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);

        const sql = `INSERT INTO administrador (nome_adm, cpf_adm, email_adm, senha_hash,precisa_trocar_senha) VALUES (?, ?, ?, ?, TRUE)`;
        await conn.query(sql, [nomeNormalizado, cpfDigits, emailNormalizado, hash]);

        return res.status(201).json({ message: 'Administrador criado com sucesso.' });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao cadastrar administrador.',
            ...(isProd ? {} : { detalhes: error.message })
        });
    } finally {
        if (conn) conn.release();
    }
},

    // Método de login oficial
    login: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não definido nas variáveis de ambiente.');
            return res.status(500).json({ error: 'Erro de configuração do servidor.' });
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

            res.cookie('token', token, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? 'strict' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 dia
            });

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                precisaTrocarSenha:Boolean(admin.precisa_trocar_senha),
                    admin: {
                    id: admin.id_administrador,
                    nome: admin.nome_adm,
                    email: admin.email_adm
                }
            });

        } catch (error) {
            return res.status(500).json({
                error: 'Erro interno ao processar o login.',
                ...(isProd ? {} : { detalhes: error.message })
            });
        }
    },


       logout: (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax'
        });
        return res.status(200).json({ message: 'Logout realizado com sucesso.' });
    },

    trocarSenha: async (req, res) => {
        const { senhaAtual, novaSenha } = req.body;
        const idAdmin = req.admin.id_administrador;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
        }

        if (novaSenha.length < 8) {
            return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
        }

        if (novaSenha === senhaAtual) {
            return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual.' });
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const [rows] = await conn.query(
                `SELECT senha_hash FROM administrador WHERE id_administrador = ? LIMIT 1`,
                [idAdmin]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Administrador não encontrado.' });
            }

            const senhaAtualValida = await bcrypt.compare(senhaAtual, rows[0].senha_hash);
            if (!senhaAtualValida) {
                return res.status(401).json({ error: 'Senha atual incorreta.' });
            }

            const salt = await bcrypt.genSalt(10);
            const novoHash = await bcrypt.hash(novaSenha, salt);

            await conn.query(
                `UPDATE administrador SET senha_hash = ?, precisa_trocar_senha = FALSE WHERE id_administrador = ?`,
                [novoHash, idAdmin]
            );

            return res.status(200).json({ message: 'Senha atualizada com sucesso.' });

        } catch (error) {
            return res.status(500).json({
                error: 'Erro ao trocar senha.',
                ...(isProd ? {} : { detalhes: error.message })
            });
        } finally {
            if (conn) conn.release();
        }
    }
};

export default administradorController;