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
  const map = { 'Aberto':'aberto', 'Em Atendimento':'atendimento', 'Finalizado':'finalizado', 'Cancelado':'cancelado' };
  return `<span class="pill pill-${map[status]||'aberto'}">${status}</span>`;
}

function prioBarClass(prio) {
  const map = { 'Baixa':'baixa','Média':'media','Alta':'alta','Urgente':'urgente' };
  return map[prio] || 'media';
}

function prioPill(prio) {
  const map = { 'Baixa':'baixa','Média':'media','Alta':'alta','Urgente':'urgente' };
  return `<span class="pill pill-${map[prio]||'media'}">${prio}</span>`;
}

function formatDate(str) {
  if (!str) return '–';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadChamados() {
  const token = getToken();
  if (!token) return;

  const status     = document.getElementById('filterStatus').value;
  const prioridade = document.getElementById('filterPrioridade').value;
  const busca      = document.getElementById('filterBusca').value;

  const params = new URLSearchParams();
  if (status)     params.set('status', status);
  if (prioridade) params.set('prioridade', prioridade);
  if (busca)      params.set('busca', busca);

  try {
    const res = await fetch(`${API}/chamados?${params}`, { headers: authHeaders() });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('pr_token');
      window.location.href = '/pages/login.html';
      return;
    }
    const data = await res.json();
    renderTable(data);
    updateStats(data);
  } catch {
    document.getElementById('tabelaChamados').innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <p style="color:var(--p-urgente);">Erro ao carregar chamados. Verifique a conexão.</p>
        </div>
      </td></tr>`;
  }
}

function updateStats(data) {
  document.getElementById('statTotal').textContent      = data.length;
  document.getElementById('statAbertos').textContent    = data.filter(c => c.status === 'Aberto').length;
  document.getElementById('statAtendimento').textContent= data.filter(c => c.status === 'Em Atendimento').length;
  document.getElementById('statUrgentes').textContent   = data.filter(c => c.prioridade === 'Urgente').length;
}

function renderTable(chamados) {
  const tbody = document.getElementById('tabelaChamados');
  if (!chamados.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3>Nenhum chamado encontrado</h3>
          <p>Ajuste os filtros ou aguarde novos chamados.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = chamados.map(c => `
    <tr onclick="window.location.href='/pages/detalhe.html?id=${c.id}'">
      <td><span class="ticket-mono-id">#${String(c.id).padStart(4,'0')}</span></td>
      <td>
        <div class="ticket-name">${escHtml(c.nome)}</div>
        <div class="ticket-email">${escHtml(c.email)}</div>
      </td>
      <td>
        <div class="ticket-title" title="${escHtml(c.titulo)}">${escHtml(c.titulo)}</div>
      </td>
      <td style="color:var(--gray-600); font-size:13px;">${escHtml(c.setor)}</td>
      <td>
        <div class="prio-bar-row">
          <div class="prio-bar ${prioBarClass(c.prioridade)}"></div>
          ${prioPill(c.prioridade)}
        </div>
      </td>
      <td>${statusPill(c.status)}</td>
      <td><span class="date-mono">${formatDate(c.criado_em)}</span></td>
    </tr>
  `).join('');
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

  document.getElementById('btnRefresh').addEventListener('click', loadChamados);

  let timer;
  ['filterBusca','filterStatus','filterPrioridade'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(loadChamados, 280);
    });
  });

  loadChamados();
});
