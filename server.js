const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com Supabase usando variável de ambiente
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.facbwumptnlhtkeegisz:Penguinismo%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar ao Supabase:', err.message);
    } else {
        console.log('✅ Conectado com sucesso à base de dados do Supabase!');
        release();
    }
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    const { tipoPerfil, nome, cpf, ciptea, especialidade, apelido, senha } = req.body;

    if (!nome || !cpf || !apelido || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    let nomeUsuario = '';
    if (tipoPerfil === 'autista') {
        nomeUsuario = `usua_penguinismo_${apelido}`;
    } else {
        nomeUsuario = `espec_${especialidade}_${apelido}`;
    }

    try {
        const query = `
            INSERT INTO usuarios (tipo_perfil, nome_completo, cpf, ciptea_registro, especialidade, apelido, nome_usuario, senha)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, nome_usuario;
        `;
        const values = [tipoPerfil, nome, cpf, ciptea, especialidade, apelido, nomeUsuario, senha];
        
        const resultado = await pool.query(query, values);
        res.status(201).json({ 
            sucesso: true, 
            mensagem: "Utilizador cadastrado com sucesso!", 
            nomeUsuario: resultado.rows[0].nome_usuario 
        });
    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        res.status(500).json({ erro: "Erro ao registar utilizador. Verifique se o nome de utilizador ou CPF já existem." });
    }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { nomeUsuario, senha } = req.body;

    try {
        const query = `SELECT * FROM usuarios WHERE nome_usuario = $1 AND senha = $2`;
        const resultado = await pool.query(query, [nomeUsuario, senha]);

        if (resultado.rows.length > 0) {
            res.json({ 
                sucesso: true, 
                mensagem: "Login bem-sucedido!", 
                utilizador: resultado.rows[0].nome_usuario 
            });
        } else {
            res.status(401).json({ erro: "Nome de utilizador ou senha incorretos." });
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: "Erro ao tentar efetuar login." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API a correr na porta ${PORT}`);
});