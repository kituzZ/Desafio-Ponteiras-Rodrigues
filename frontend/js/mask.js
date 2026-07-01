// Máscara para telefone
function maskTelefone(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d*)$/, '($1) $2');
    }
    this.value = v;
  });
}

// Máscara para CEP
function maskCep(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d*)$/, '$1-$2');
    this.value = v;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const tel = document.getElementById('telefone');
  const cep = document.getElementById('cep');
  if (tel) maskTelefone(tel);
  if (cep) maskCep(cep);
});
