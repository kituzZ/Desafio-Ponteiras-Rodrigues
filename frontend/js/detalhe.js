const API = '';

function getToken() {
  const token = localStorage.getItem('pr_token');
  if (!token) { window.location.href = '/pages/login.html'; return null; }
  return token;
}
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function statusPill(status) {
  const map = { 'Aberto':'aberto','Em Atendimento':'atendimento','Finalizado':'finalizado','Cancelado':'cancelado' };
  return `<span class="pill pill-${map[status]||'aberto'}">${status}</span>`;
}
function prioPill(prio) {
  const map = { 'Baixa':'baixa','Média':'media','Alta':'alta','Urgente':'urgente' };
  return `<span class="pill pill-${map[prio]||'media'}">${prio}</span>`;
}
function prioBarClass(prio) {
  const map = { 'Baixa':'baixa','Média':'media','Alta':'alta','Urgente':'urgente' };
  return map[prio] || 'media';
}
function formatDate(str) {
  if (!str) return '–';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getChamadoId() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return params.get('id');
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

async function loadChamado() {
  const id    = getChamadoId();
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API}/chamados/${id}`, { headers: authHeaders() });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('pr_token');
      window.location.href = '/pages/login.html';
      return;
    }
    if (res.status === 404) {
      document.getElementById('loadingState').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <h3>Chamado não encontrado</h3>
          <p>O chamado #${id} não existe ou foi excluído.</p>
          <a href="/admin" class="btn btn-ghost" style="margin-top:16px;">← Voltar</a>
        </div>`;
      return;
    }
    const c = await res.json();
    renderChamado(c);
  } catch {
    document.getElementById('loadingState').innerHTML = `
      <div class="empty-state">
        <p style="color:var(--p-urgente);">Erro ao carregar o chamado.</p>
        <a href="/admin" class="btn btn-ghost" style="margin-top:16px;">← Voltar</a>
      </div>`;
  }
}

function renderChamado(c) {
  document.getElementById('loadingState').style.display  = 'none';
  document.getElementById('detailContent').style.display = 'block';

  document.getElementById('pageTitle').textContent = `Chamado #${String(c.id).padStart(4,'0')}`;
  document.getElementById('detTicketId').textContent = `#${String(c.id).padStart(4,'0')}`;

  // Barra de prioridade no topo do card
  document.getElementById('prioBar').className = `dcard-prio-bar ${prioBarClass(c.prioridade)}`;

  document.getElementById('detTitulo').textContent   = c.titulo;
  document.getElementById('detDescricao').textContent = c.descricao;
  document.getElementById('detStatus').innerHTML     = statusPill(c.status);
  document.getElementById('detPrioridade').innerHTML = prioPill(c.prioridade);
  document.getElementById('detSetor').textContent    = c.setor;
  document.getElementById('detData').textContent     = formatDate(c.criado_em);
  document.getElementById('detNome').textContent     = c.nome;
  document.getElementById('detEmail').textContent    = c.email;
  document.getElementById('detTelefone').textContent = c.telefone;

  // Endereço
  if (c.cep) {
    document.getElementById('detCep').textContent    = c.cep;
    document.getElementById('detRua').textContent    = [c.rua, c.numero].filter(Boolean).join(', ') || '–';
    document.getElementById('detBairro').textContent = c.bairro || '–';
    document.getElementById('detCidade').textContent = [c.cidade, c.estado].filter(Boolean).join(' / ') || '–';
    if (c.complemento) {
      document.getElementById('detComplemento').textContent = c.complemento;
    } else {
      document.getElementById('detComplementoRow').style.display = 'none';
    }
  } else {
    document.getElementById('cardEndereco').style.display = 'none';
  }

  // Selects
  document.getElementById('selectStatus').value     = c.status;
  document.getElementById('selectPrioridade').value = c.prioridade;

  // Histórico
  document.getElementById('histAberto').textContent     = formatDate(c.criado_em);
  document.getElementById('histAtualizado').textContent = formatDate(c.atualizado_em);
}

async function salvarAlteracoes() {
  const id         = getChamadoId();
  const status     = document.getElementById('selectStatus').value;
  const prioridade = document.getElementById('selectPrioridade').value;
  const btn        = document.getElementById('btnSalvar');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div> Salvando...';

  try {
    const res = await fetch(`${API}/chamados/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status, prioridade })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Erro ao salvar.', 'error'); return; }

    showToast('Chamado atualizado com sucesso!', 'success');

    // Atualizar pills e barra
    document.getElementById('detStatus').innerHTML     = statusPill(status);
    document.getElementById('detPrioridade').innerHTML = prioPill(prioridade);
    document.getElementById('prioBar').className       = `dcard-prio-bar ${prioBarClass(prioridade)}`;
    document.getElementById('histAtualizado').textContent = formatDate(new Date().toISOString());
  } catch {
    showToast('Erro de conexão.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar alterações';
  }
}

async function excluirChamado() {
  const id = getChamadoId();
  if (!confirm(`Tem certeza que deseja excluir o chamado #${String(id).padStart(4,'0')}?\nEsta ação não pode ser desfeita.`)) return;

  try {
    const res  = await fetch(`${API}/chamados/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Erro ao excluir.', 'error'); return; }
    showToast('Chamado excluído.', 'success');
    setTimeout(() => { window.location.href = '/admin'; }, 1000);
  } catch {
    showToast('Erro de conexão.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const token = getToken();
  if (!token) return;

  try {
    const admin = JSON.parse(localStorage.getItem('pr_admin') || '{}');
    if (admin.nome) {
      document.getElementById('adminName').textContent     = admin.nome;
      document.getElementById('avatarInitial').textContent = admin.nome[0].toUpperCase();
    }
  } catch {}

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('pr_token');
    localStorage.removeItem('pr_admin');
    window.location.href = '/pages/login.html';
  });

  document.getElementById('btnSalvar').addEventListener('click', salvarAlteracoes);
  document.getElementById('btnExcluir').addEventListener('click', excluirChamado);

  loadChamado();
});
