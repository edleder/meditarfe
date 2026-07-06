// ── Sistema de Teste de Trial ────────────────────────────────────────────

function initTrialTester() {
  const panel = document.createElement('div');
  panel.id = 'trial-tester-panel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(255, 107, 53, 0.95);
    color: #fff;
    padding: 16px;
    border-radius: 12px;
    font-size: 12px;
    font-family: monospace;
    z-index: 9999;
    max-width: 280px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  `;

  const getTrialInfo = () => {
    const trialInicio = localStorage.getItem('trial_inicio');
    if (!trialInicio) return 'Trial não iniciado';

    const dataInicio = new Date(trialInicio);
    const agora = new Date();
    const diasPassados = Math.floor((agora - dataInicio) / (1000 * 60 * 60 * 24));
    const diasRestantes = 7 - diasPassados;

    return `
      Início: ${dataInicio.toLocaleString('pt-BR')}
      Dias passados: ${diasPassados}
      Dias restantes: ${diasRestantes > 0 ? diasRestantes : 'EXPIRADO'}
    `;
  };

  panel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; color: #ffe0d0;">⚙️ TESTE DE TRIAL</div>
    <div id="trial-info" style="margin-bottom: 10px; white-space: pre; font-size: 11px; color: #ffe0d0;">
      ${getTrialInfo()}
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <button onclick="resetarTrial()" style="padding: 6px 8px; background: #ff4500; border: none; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px; font-weight: bold;">Reset Trial</button>
      <button onclick="simularDias(1)" style="padding: 6px 8px; background: #e55100; border: none; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px;">+1 dia</button>
      <button onclick="simularDias(3)" style="padding: 6px 8px; background: #e55100; border: none; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px;">+3 dias</button>
      <button onclick="simularDias(7)" style="padding: 6px 8px; background: #d94500; border: none; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px;">+7 dias (EXPIRAR)</button>
      <button onclick="verificarTrial(); atualizarInfo();" style="padding: 6px 8px; background: #4ade80; border: none; border-radius: 4px; color: #000; cursor: pointer; font-size: 11px; font-weight: bold;">Verificar Trial</button>
    </div>
  `;

  document.body.appendChild(panel);

  window.resetarTrial = () => {
    localStorage.removeItem('trial_inicio');
    console.log('Trial resetado');
    atualizarInfo();
  };

  window.simularDias = (dias) => {
    const trialInicio = localStorage.getItem('trial_inicio');
    if (!trialInicio) {
      alert('Inicie o trial primeiro clicando em "Reset Trial" ou "Verificar Trial"');
      return;
    }
    const dataInicio = new Date(trialInicio);
    dataInicio.setDate(dataInicio.getDate() - dias);
    localStorage.setItem('trial_inicio', dataInicio.toISOString());
    console.log(`Simulado: avançado ${dias} dias`);
    atualizarInfo();
  };

  window.atualizarInfo = () => {
    document.getElementById('trial-info').textContent = getTrialInfo();
  };
}

// Inicia o painel se estivermos no staging
if (window.location.pathname === '/staging') {
  document.addEventListener('DOMContentLoaded', initTrialTester);
}
