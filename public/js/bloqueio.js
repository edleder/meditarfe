// ── Sistema de Bloqueio de Acesso ────────────────────────────────────────────

// Verifica e gerencia trial de 7 dias para página casal
function verificarTrial() {
  // Só aplica trial na página /casal
  if (window.location.pathname !== '/casal') {
    return true;
  }

  const trialInicio = localStorage.getItem('trial_inicio');
  const agora = new Date().getTime();

  if (!trialInicio) {
    // Primeira vez acessando - inicia trial
    const dataInicio = new Date();
    localStorage.setItem('trial_inicio', dataInicio.toISOString());
    mostrarPopupTrial(7);
    return true;
  }

  // Calcula quantos dias se passaram
  const dataInicio = new Date(trialInicio).getTime();
  const diasPassados = Math.floor((agora - dataInicio) / (1000 * 60 * 60 * 24));
  const diasRestantes = 7 - diasPassados;

  if (diasRestantes > 0) {
    // Trial ainda ativo
    mostrarPopupTrial(diasRestantes);
    return true;
  } else {
    // Trial expirado - redireciona para planos
    window.location.href = '/planos';
    return false;
  }
}

function mostrarPopupTrial(diasRestantes) {
  // Remove popup anterior se existir
  const popupAnterior = document.getElementById('popup-trial');
  if (popupAnterior) popupAnterior.remove();

  const popup = document.createElement('div');
  popup.id = 'popup-trial';
  popup.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(201, 169, 110, 0.95);
    color: #0a0806;
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    max-width: 300px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 1000;
    backdrop-filter: blur(8px);
    animation: slideIn 0.3s ease-out;
  `;

  const mensagem = diasRestantes === 1
    ? '⏰ Último dia de teste!'
    : `⏰ Teste: ${diasRestantes} dias restantes`;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
      <span>${mensagem}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(0,0,0,0.2);
        border: none;
        color: #0a0806;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
      ">✕</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Adiciona animação CSS
  if (!document.getElementById('style-popup-trial')) {
    const style = document.createElement('style');
    style.id = 'style-popup-trial';
    style.innerHTML = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

async function verificarAcesso() {
  // Token admin especial (acesso livre)
  const TOKEN_ADMIN = '0pt1pl3x';
  const tokenAdmin = localStorage.getItem('meu_devocional_token');
  if (tokenAdmin === TOKEN_ADMIN) {
    return true;
  }

  // Verifica se está na página de planos ou sucesso
  if (window.location.pathname === '/planos' || window.location.pathname === '/sucesso') {
    return true;
  }

  // Verifica trial de 7 dias para página casal
  if (window.location.pathname === '/casal') {
    const trialValido = verificarTrial();
    if (!trialValido) {
      return false;
    }
    // Trial ativo - permite acesso sem precisar de assinatura
    return true;
  }

  // Verifica token temporário na query string
  const params = new URLSearchParams(window.location.search);
  const tokenTemp = params.get('token');
  if (tokenTemp) {
    try {
      const response = await fetch(`/api/validar-token/${tokenTemp}`);
      if (response.ok) {
        const dados = await response.json();
        if (dados.valido) {
          // Token temporário válido
          localStorage.setItem('temp_token', tokenTemp);
          // Remove o token da URL para não aparecer no histórico
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
      }
    } catch (e) {
      console.warn('Erro ao validar token:', e);
    }
  }

  // Verifica se tem token temporário válido no localStorage
  const tokenTemporario = localStorage.getItem('temp_token');
  if (tokenTemporario) {
    try {
      const response = await fetch(`/api/validar-token/${tokenTemporario}`);
      if (response.ok) {
        const dados = await response.json();
        if (dados.valido) {
          return true;
        } else {
          localStorage.removeItem('temp_token');
        }
      }
    } catch (e) {
      console.warn('Erro ao validar token temporário:', e);
      return true; // Fallback
    }
  }

  // Verifica se tem token de assinatura válido no localStorage
  const tokenAssinatura = localStorage.getItem('assinatura_token');
  const dataExpiracao = localStorage.getItem('assinatura_expira');

  if (!tokenAssinatura || !dataExpiracao) {
    // Sem assinatura = bloquear
    bloqueiaAcesso();
    return false;
  }

  // Verifica se expirou localmente
  const agora = new Date().getTime();
  const expira = new Date(dataExpiracao).getTime();

  if (agora > expira) {
    // Expirou = bloquear e limpar
    localStorage.removeItem('assinatura_token');
    localStorage.removeItem('assinatura_expira');
    bloqueiaAcesso();
    return false;
  }

  // Valida com servidor (mais robusto)
  try {
    const response = await fetch(`/api/assinatura/validar/${tokenAssinatura}`);
    if (response.ok) {
      const dados = await response.json();
      if (dados.valido) {
        // Assinatura válida no servidor
        return true;
      }
    }
  } catch (e) {
    console.warn('Erro ao validar com servidor, usando localStorage:', e);
    // Se houver erro na validação do servidor, usa localStorage como fallback
    return true;
  }

  // Se chegou aqui, assinatura não é válida
  localStorage.removeItem('assinatura_token');
  localStorage.removeItem('assinatura_expira');
  bloqueiaAcesso();
  return false;
}

function bloqueiaAcesso() {
  // Redireciona para página de validação de token
  window.location.href = '/validar-token';
}

// ── Ativa assinatura (chamado pela Hotmart após pagamento) ──────────────────
async function ativarAssinatura(duracao, email) {
  try {
    // Chama webhook para registrar no servidor
    const response = await fetch('/api/webhook/hotmart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email || 'usuario@example.com',
        plano: duracao
      })
    });

    const dados = await response.json();

    if (dados.sucesso && dados.token) {
      // Guarda o token no localStorage
      const agora = new Date();
      let expiracao = new Date(agora);

      // duracao pode ser: '1mes', '3meses', '6meses', '1ano'
      switch(duracao) {
        case '3meses':
          expiracao.setMonth(expiracao.getMonth() + 3);
          break;
        case '6meses':
          expiracao.setMonth(expiracao.getMonth() + 6);
          break;
        case '1ano':
          expiracao.setFullYear(expiracao.getFullYear() + 1);
          break;
        case '1mes':
        default:
          expiracao.setMonth(expiracao.getMonth() + 1);
      }

      localStorage.setItem('assinatura_token', dados.token);
      localStorage.setItem('assinatura_expira', expiracao.toISOString());

      console.log('✅ Assinatura ativada até:', expiracao);
      return true;
    } else {
      console.error('❌ Erro ao ativar assinatura:', dados);
      return false;
    }
  } catch (e) {
    console.error('❌ Erro ao chamar webhook:', e);
    return false;
  }
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
