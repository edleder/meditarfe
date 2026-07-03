// ── Sistema de Bloqueio de Acesso ────────────────────────────────────────────

function verificarAcesso() {
  // Verifica se está na página de planos
  if (window.location.pathname === '/planos') {
    return true;
  }

  // Verifica se tem token de assinatura válido
  const tokenAssinatura = localStorage.getItem('assinatura_token');
  const dataExpiracao = localStorage.getItem('assinatura_expira');

  if (!tokenAssinatura || !dataExpiracao) {
    // Sem assinatura = bloquear
    bloqueiaAcesso();
    return false;
  }

  // Verifica se expirou
  const agora = new Date().getTime();
  const expira = new Date(dataExpiracao).getTime();

  if (agora > expira) {
    // Expirou = bloquear e limpar
    localStorage.removeItem('assinatura_token');
    localStorage.removeItem('assinatura_expira');
    bloqueiaAcesso();
    return false;
  }

  // Tem assinatura válida = libera acesso
  return true;
}

function bloqueiaAcesso() {
  // Redireciona para página de planos
  window.location.href = '/planos';
}

// ── Ativa assinatura (chamado pela Hotmart após pagamento) ──────────────────
function ativarAssinatura(duracao) {
  const agora = new Date();
  let expiracao = new Date(agora);

  // duracao pode ser: '1mes', '3meses', '6meses', '1ano'
  switch(duracao) {
    case '1mes':
      expiracao.setMonth(expiracao.getMonth() + 1);
      break;
    case '3meses':
      expiracao.setMonth(expiracao.getMonth() + 3);
      break;
    case '6meses':
      expiracao.setMonth(expiracao.getMonth() + 6);
      break;
    case '1ano':
      expiracao.setFullYear(expiracao.getFullYear() + 1);
      break;
    default:
      expiracao.setMonth(expiracao.getMonth() + 1);
  }

  // Guarda no localStorage
  localStorage.setItem('assinatura_token', 'valid-' + Date.now());
  localStorage.setItem('assinatura_expira', expiracao.toISOString());

  console.log('✅ Assinatura ativada até:', expiracao);
}

// ── Cancela assinatura ───────────────────────────────────────────────────────
function cancelarAssinatura() {
  localStorage.removeItem('assinatura_token');
  localStorage.removeItem('assinatura_expira');
  console.log('❌ Assinatura cancelada');
  bloqueiaAcesso();
}

// ── Verifica acesso ao carregar a página ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  if (!verificarAcesso()) {
    // Página já será redirecionada por bloqueiaAcesso()
  }
});
