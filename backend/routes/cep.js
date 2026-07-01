const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// GET /cep/:cep — Consultar CEP via ViaCEP
router.get('/:cep', async (req, res) => {
  const cep = req.params.cep.replace(/\D/g, '');

  if (cep.length !== 8) {
    return res.status(400).json({ error: 'CEP deve conter 8 dígitos.' });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado.' });
    }

    res.json({
      cep: data.cep,
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    });
  } catch (err) {
    console.error('Erro ao consultar CEP:', err);
    res.status(500).json({ error: 'Erro ao consultar o CEP. Tente novamente.' });
  }
});

module.exports = router;
