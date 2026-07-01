const API = '';

function showAlert(msg, type) {
  const el = document.getElementById('loginAlert');
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  el.style.display = 'block';
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  const btn = document.getElementById('btnLogin');

  if (!email || !senha) {
    showAlert('Preencha e-mail e senha.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Credenciais inválidas.', 'error');
      return;
    }

    localStorage.setItem('pr_token', data.token);
    localStorage.setItem('pr_admin', JSON.stringify(data.admin));
    window.location.href = '/admin';
  } catch (err) {
    showAlert('Erro de conexão. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Redirecionar se já logado
  const token = localStorage.getItem('pr_token');
  if (token) window.location.href = '/admin';

  document.getElementById('btnLogin').addEventListener('click', doLogin);
  document.getElementById('loginSenha').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doLogin();
  });
});
