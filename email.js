const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const nomesDosPlanos = {
  '1mes': 'Plano Mensal',
  '3meses': 'Plano Trimestral',
  '6meses': 'Plano Semestral',
  '1ano': 'Plano Anual'
};

function formatarData(dataIso) {
  return new Date(dataIso).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function enviarEmailConfirmacao(email, plano, dataExpiracao, token) {
  try {
    const dataFormatada = formatarData(dataExpiracao);
    const nomeDoPlano = nomesDosPlanos[plano] || plano;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; color: #c9a96e; margin-bottom: 30px; }
          .header h1 { font-size: 2em; margin: 0; font-weight: 300; letter-spacing: 1px; }
          .content { background: #f9f5f0; padding: 20px; border-radius: 8px; border-left: 4px solid #c9a96e; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .info-label { font-weight: bold; color: #1a1a1a; }
          .cta-button {
            display: inline-block;
            background: #c9a96e;
            color: #1a1a1a;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { text-align: center; color: #999; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💕 Juntos na Fé</h1>
            <p>Devocional Diário para Casais</p>
          </div>

          <h2>Pagamento Confirmado! 🎉</h2>

          <div class="content">
            <p>Obrigado por sua compra! Sua assinatura foi ativada com sucesso.</p>

            <div class="info-box">
              <p><span class="info-label">Plano:</span> ${nomeDoPlano}</p>
            </div>

            <div class="info-box">
              <p><span class="info-label">Acesso válido até:</span> ${dataFormatada}</p>
            </div>

            <div class="info-box">
              <p><span class="info-label">Email de acesso:</span> ${email}</p>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://www.meditarfe.com/mensagem" class="cta-button">Acessar Devocional Agora</a>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 5px; border-left: 4px solid #c9a96e;">
            <p><strong>O que você vai encontrar:</strong></p>
            <ul>
              <li>✓ Devocional diário atualizado</li>
              <li>✓ Meditações guiadas</li>
              <li>✓ Reflexões espirituais</li>
              <li>✓ Áudio relaxante para momento de oração</li>
            </ul>
          </div>

          <div class="footer">
            <p>💕 Juntos na Fé - Fortaleça sua fé e relacionamento</p>
            <p style="font-size: 0.8em; color: #ccc;">Se você não realizou esta compra, ignore este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@meditarfe.com',
      to: email,
      subject: '✅ Pagamento Confirmado - Juntos na Fé',
      html: html
    });

    console.log(`📧 Email de confirmação enviado para: ${email}`);
    return true;
  } catch (e) {
    console.error(`❌ Erro ao enviar email: ${e.message}`);
    return false;
  }
}

async function enviarEmailLembreteExpiracao(email, plano, diasRestantes, dataExpiracao) {
  try {
    const dataFormatada = formatarData(dataExpiracao);
    const nomeDoPlano = nomesDosPlanos[plano] || plano;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; color: #c9a96e; margin-bottom: 30px; }
          .header h1 { font-size: 2em; margin: 0; font-weight: 300; letter-spacing: 1px; }
          .alert { background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 20px 0; }
          .cta-button {
            display: inline-block;
            background: #c9a96e;
            color: #1a1a1a;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { text-align: center; color: #999; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💕 Juntos na Fé</h1>
          </div>

          <h2>⚠️ Sua Assinatura está Expirando!</h2>

          <div class="alert">
            <p>Sua assinatura <strong>${nomeDoPlano}</strong> expira em <strong>${diasRestantes} dias</strong> (${dataFormatada}).</p>
            <p>Não perca acesso ao devocional diário. Renove agora e continue sua jornada espiritual conosco!</p>
          </div>

          <div style="text-align: center;">
            <a href="https://www.meditarfe.com/planos" class="cta-button">Renovar Assinatura</a>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 5px; border-left: 4px solid #c9a96e;">
            <p><strong>Planos Disponíveis:</strong></p>
            <ul>
              <li>📅 1 Mês - R$ 19,90</li>
              <li>📅 3 Meses - R$ 49,90 (16% OFF)</li>
              <li>📅 6 Meses - R$ 89,90 (25% OFF)</li>
              <li>📅 1 Ano - R$ 149,90 (37% OFF)</li>
            </ul>
          </div>

          <div class="footer">
            <p>💕 Juntos na Fé - Fortaleça sua fé e relacionamento</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@meditarfe.com',
      to: email,
      subject: `⚠️ Sua Assinatura expira em ${diasRestantes} dias`,
      html: html
    });

    console.log(`📧 Email de lembrete enviado para: ${email}`);
    return true;
  } catch (e) {
    console.error(`❌ Erro ao enviar email de lembrete: ${e.message}`);
    return false;
  }
}

module.exports = {
  enviarEmailConfirmacao,
  enviarEmailLembreteExpiracao
};
