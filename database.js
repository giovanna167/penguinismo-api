const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'penguinismo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('✅ Banco de dados SQLite conectado com sucesso!');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_perfil TEXT NOT NULL,
            nome_completo TEXT NOT NULL,
            cpf TEXT NOT NULL,
            ciptea_registro TEXT,
            especialidade TEXT,
            apelido TEXT NOT NULL,
            nome_usuario TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    `);
});

module.exports = db;
