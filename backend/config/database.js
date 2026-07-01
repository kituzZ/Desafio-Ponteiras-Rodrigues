const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // Tabela de administradores
    await conn.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de chamados
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chamados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        setor VARCHAR(100) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT NOT NULL,
        prioridade ENUM('Baixa', 'Média', 'Alta', 'Urgente') NOT NULL DEFAULT 'Média',
        status ENUM('Aberto', 'Em Atendimento', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Aberto',
        cep VARCHAR(10),
        rua VARCHAR(200),
        numero VARCHAR(20),
        complemento VARCHAR(100),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(50),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Inserir admin padrão se não existir
    const bcrypt = require('bcryptjs');
    const [rows] = await conn.query('SELECT id FROM administradores WHERE email = ?', [process.env.ADMIN_EMAIL]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await conn.query(
        'INSERT INTO administradores (nome, email, senha) VALUES (?, ?, ?)',
        ['Administrador', process.env.ADMIN_EMAIL, hash]
      );
      console.log(`✅ Admin criado: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    }

    console.log('✅ Banco de dados inicializado com sucesso.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDatabase };
