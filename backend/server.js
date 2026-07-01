const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const loginRoutes = require('./routes/login');
const chamadosRoutes = require('./routes/chamados');
const cepRoutes = require('./routes/cep');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/login', loginRoutes);
app.use('/chamados', chamadosRoutes);
app.use('/cep', cepRoutes);

// Rotas do frontend (SPA fallback para páginas específicas)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/admin.html'));
});
app.get('/admin/chamado/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/detalhe.html'));
});

// Inicializar banco e subir servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📋 Abertura de chamados: http://localhost:${PORT}`);
      console.log(`🔐 Área admin: http://localhost:${PORT}/admin`);
      console.log(`   Login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao inicializar banco de dados:', err);
    process.exit(1);
  });
