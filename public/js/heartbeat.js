// ── Sistema de Heartbeat para ratrear usuários online ──────────────────────

(function() {
  // Gera ou recupera ID de sessão
  function obterSessaoId() {
    let sessaoId = localStorage.getItem('sessao_id');
    if (!sessaoId) {
      sessaoId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessao_id', sessaoId);
    }
    return sessaoId;
  }

  // Envia heartbeat ao servidor
  function enviarHeartbeat() {
    const sessaoId = obterSessaoId();
    const pagina = window.location.pathname;

    fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessao_id: sessaoId, pagina: pagina })
    }).catch(e => console.log('Heartbeat enviado:', e.message));
  }

  // Envia heartbeat imediatamente
  enviarHeartbeat();

  // Envia heartbeat a cada 30 segundos
  setInterval(enviarHeartbeat, 30000);

  // Limpa sessão ao sair da página
  window.addEventListener('beforeunload', () => {
    // Opcional: enviar "offline" se quiser
  });
})();
