const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// POST /chamados — Criar chamado (público)
router.post('/', async (req, res) => {
  const {
    nome, email, telefone, setor, titulo, descricao, prioridade,
    cep, rua, numero, complemento, bairro, cidade, estado
  } = req.body;

  if (!nome || !email || !telefone || !setor || !titulo || !descricao || !prioridade) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  const prioridadesValidas = ['Baixa', 'Média', 'Alta', 'Urgente'];
  if (!prioridadesValidas.includes(prioridade)) {
    return res.status(400).json({ error: 'Prioridade inválida.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO chamados 
        (nome, email, telefone, setor, titulo, descricao, prioridade, cep, rua, numero, complemento, bairro, cidade, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, telefone, setor, titulo, descricao, prioridade,
       cep || null, rua || null, numero || null, complemento || null,
       bairro || null, cidade || null, estado || null]
    );

    res.status(201).json({
      message: 'Chamado aberto com sucesso!',
      id: result.insertId
    });
  } catch (err) {
    console.error('Erro ao criar chamado:', err);
    res.status(500).json({ error: 'Erro ao salvar o chamado.' });
  }
});

// GET /chamados — Listar chamados (protegido)
router.get('/', authMiddleware, async (req, res) => {
  const { status, prioridade, busca } = req.query;

  let query = 'SELECT * FROM chamados WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (prioridade) {
    query += ' AND prioridade = ?';
    params.push(prioridade);
  }
  if (busca) {
    query += ' AND (nome LIKE ? OR titulo LIKE ? OR email LIKE ?)';
    const like = `%${busca}%`;
    params.push(like, like, like);
  }

  query += ' ORDER BY criado_em DESC';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar chamados:', err);
    res.status(500).json({ error: 'Erro ao buscar chamados.' });
  }
});

// GET /chamados/:id — Buscar por ID (protegido)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chamados WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar chamado:', err);
    res.status(500).json({ error: 'Erro ao buscar chamado.' });
  }
});

// PUT /chamados/:id — Atualizar chamado (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  const { status, prioridade, titulo, descricao, setor } = req.body;

  const statusValidos = ['Aberto', 'Em Atendimento', 'Finalizado', 'Cancelado'];
  const prioridadesValidas = ['Baixa', 'Média', 'Alta', 'Urgente'];

  if (status && !statusValidos.includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  if (prioridade && !prioridadesValidas.includes(prioridade)) {
    return res.status(400).json({ error: 'Prioridade inválida.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM chamados WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    const fields = [];
    const values = [];

    if (status) { fields.push('status = ?'); values.push(status); }
    if (prioridade) { fields.push('prioridade = ?'); values.push(prioridade); }
    if (titulo) { fields.push('titulo = ?'); values.push(titulo); }
    if (descricao) { fields.push('descricao = ?'); values.push(descricao); }
    if (setor) { fields.push('setor = ?'); values.push(setor); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE chamados SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Chamado atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar chamado:', err);
    res.status(500).json({ error: 'Erro ao atualizar chamado.' });
  }
});

// DELETE /chamados/:id — Excluir chamado (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM chamados WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }
    res.json({ message: 'Chamado excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir chamado:', err);
    res.status(500).json({ error: 'Erro ao excluir chamado.' });
  }
});

module.exports = router;
