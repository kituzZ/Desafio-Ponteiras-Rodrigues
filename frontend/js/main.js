const API = '';

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

function showAlert(containerId, msg, type) {
  const el = document.getElementById(containerId);
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  el.style.display = 'block';
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('input, select, textarea').forEach(e => e.classList.remove('error'));
}

function fieldError(fieldId, errId) {
  const f = document.getElementById(fieldId);
  const e = document.getElementById(errId);
  if (f) f.classList.add('error');
  if (e) e.classList.add('show');
}

function validateForm() {
  clearErrors();
  let valid = true;
  const campos = [
    { id: 'nome',      err: 'err-nome' },
    { id: 'email',     err: 'err-email' },
    { id: 'telefone',  err: 'err-telefone' },
    { id: 'setor',     err: 'err-setor' },
    { id: 'titulo',    err: 'err-titulo' },
    { id: 'descricao', err: 'err-descricao' },
    { id: 'prioridade',err: 'err-prioridade' },
  ];
  campos.forEach(function(c) {
    const el = document.getElementById(c.id);
    if (!el || !el.value.trim()) { fieldError(c.id, c.err); valid = false; }
  });
  const email = document.getElementById('email');
  if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldError('email', 'err-email'); valid = false;
  }
  return valid;
}

async function buscarCep() {
  const cepInput = document.getElementById('cep');
  const cep = cepInput.value.replace(/\D/g, '');
  const btn = document.getElementById('btnBuscarCep');
  const statusEl = document.getElementById('cepStatus');
  const enderecoFields = document.getElementById('enderecoFields');

  if (cep.length !== 8) {
    statusEl.innerHTML = '<div class="alert alert-error" style="margin-top:10px;">Digite um CEP válido com 8 dígitos.</div>';
    statusEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Buscando...';
  statusEl.style.display = 'none';

  try {
    const res = await fetch(API + '/cep/' + cep);
    const data = await res.json();

    if (!res.ok) {
      statusEl.innerHTML = '<div class="alert alert-error" style="margin-top:10px;">' + (data.error || 'CEP não encontrado.') + '</div>';
      statusEl.style.display = 'block';
      enderecoFields.style.display = 'none';
      return;
    }

    document.getElementById('rua').value    = data.rua    || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('cidade').value = data.cidade || '';
    document.getElementById('estado').value = data.estado || '';
    enderecoFields.style.display = 'grid';
    document.getElementById('numero').focus();

    statusEl.innerHTML = '<div class="alert alert-success" style="margin-top:10px;">Endereço encontrado: ' + data.rua + ', ' + data.bairro + ' – ' + data.cidade + '/' + data.estado + '</div>';
    statusEl.style.display = 'block';
  } catch (err) {
    statusEl.innerHTML = '<div class="alert alert-error" style="margin-top:10px;">Erro ao consultar o CEP. Verifique sua conexão.</div>';
    statusEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Buscar endereço';
  }
}

function resetForm() {
  document.getElementById('formChamado').reset();
  ['rua','bairro','cidade','estado','numero','complemento'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('enderecoFields').style.display = 'none';
  document.getElementById('cepStatus').style.display = 'none';
  document.getElementById('alertGlobal').style.display = 'none';
  clearErrors();
}

async function submitChamado(e) {
  e.preventDefault();

  if (!validateForm()) {
    var firstError = document.querySelector('.field-error.show');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Confirmação antes de registrar (requisito 9.1)
  var nome   = document.getElementById('nome').value.trim();
  var titulo = document.getElementById('titulo').value.trim();
  var prio   = document.getElementById('prioridade').value;

  var confirma = confirm(
    'Confirmar abertura do chamado?\n\n' +
    'Solicitante: ' + nome + '\n' +
    'Título: ' + titulo + '\n' +
    'Prioridade: ' + prio + '\n\n' +
    'Clique em OK para registrar.'
  );
  if (!confirma) return;

  var btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  var payload = {
    nome:        document.getElementById('nome').value.trim(),
    email:       document.getElementById('email').value.trim(),
    telefone:    document.getElementById('telefone').value.trim(),
    setor:       document.getElementById('setor').value.trim(),
    titulo:      document.getElementById('titulo').value.trim(),
    descricao:   document.getElementById('descricao').value.trim(),
    prioridade:  document.getElementById('prioridade').value,
    cep:         document.getElementById('cep').value.trim(),
    rua:         document.getElementById('rua').value.trim(),
    numero:      document.getElementById('numero').value.trim(),
    complemento: document.getElementById('complemento').value.trim(),
    bairro:      document.getElementById('bairro').value.trim(),
    cidade:      document.getElementById('cidade').value.trim(),
    estado:      document.getElementById('estado').value.trim(),
  };

  try {
    var res = await fetch(API + '/chamados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var data = await res.json();

    if (!res.ok) {
      showAlert('alertGlobal', data.error || 'Erro ao abrir o chamado.', 'error');
      document.getElementById('alertGlobal').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Tela de sucesso
    document.getElementById('formChamado').style.display = 'none';
    document.getElementById('alertGlobal').style.display = 'none';
    var wrap = document.getElementById('formWrap');
    wrap.innerHTML =
      '<div class="success-wrap">' +
        '<div class="success-card">' +
          '<div class="success-icon-wrap">' +
            '<svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>' +
            '</svg>' +
          '</div>' +
          '<h2>Chamado registrado!</h2>' +
          '<p>Sua solicitação foi salva com sucesso.<br>Nossa equipe entrará em contato em breve.</p>' +
          '<div class="ticket-id-display">#' + String(data.id).padStart(4, '0') + '</div>' +
          '<div class="ticket-id-label">Número do seu chamado — guarde para acompanhamento</div>' +
          '<a href="/" class="btn btn-primary btn-lg" style="width:100%; margin-top:8px;">Abrir outro chamado</a>' +
        '</div>' +
      '</div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    showAlert('alertGlobal', 'Erro de conexão. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar chamado';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('formChamado').addEventListener('submit', submitChamado);
  document.getElementById('btnBuscarCep').addEventListener('click', buscarCep);
  document.getElementById('cep').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); buscarCep(); }
  });
});
