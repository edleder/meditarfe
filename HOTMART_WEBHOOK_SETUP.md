# 🔗 Configuração do Webhook da Hotmart

Este guia explica como configurar o webhook da Hotmart para que os pagamentos sejam processados automaticamente e as assinaturas sejam ativadas no sistema.

## 📋 Pré-requisitos

- ✅ Conta Hotmart com acesso ao painel de controle
- ✅ Servidor rodando em produção (HTTPS)
- ✅ Domínio configurado corretamente
- ✅ Variáveis de ambiente configuradas:
  ```env
  SMTP_HOST=seu-smtp-host.com
  SMTP_PORT=587
  SMTP_USER=seu-email@example.com
  SMTP_PASS=sua-senha-smtp
  SMTP_FROM=noreply@meditarfe.com
  DOMAIN=https://www.meditarfe.com
  ```

## 🚀 Passos de Configuração

### 1. Acessar Painel da Hotmart

1. Faça login em [hotmart.com](https://hotmart.com)
2. Clique em **Minha Conta** (canto superior direito)
3. Selecione **Meus Produtos**

### 2. Adicionar Webhook

1. Selecione o produto **"Devocional Juntos na Fé"**
2. Clique em **Editar Produto**
3. Role até a seção **Integrações**
4. Procure por **"Webhooks"** ou **"Notificações"**
5. Clique em **Adicionar Webhook**

### 3. Configurar Webhook

Preencha os campos conforme abaixo:

**URL do Webhook:**
```
https://www.meditarfe.com/api/webhook/hotmart
```

**Método:** POST

**Eventos:**
- ✅ Compra realizada
- ✅ Pagamento confirmado
- (Opcional) Compra reembolsada

**Headers (se necessário):**
```
Content-Type: application/json
```

### 4. Testar Webhook

1. Clique em **Testar** ou **Test Webhook**
2. Você deve receber uma resposta com status `200 OK`
3. Exemplo de resposta esperada:
```json
{
  "sucesso": true,
  "token": "abc123...",
  "message": "Assinatura ativada com sucesso"
}
```

### 5. Salvar Configuração

1. Clique em **Salvar** ou **Save**
2. Você verá uma confirmação: "Webhook salvo com sucesso"

## 📝 Dados Enviados pelo Webhook

Quando um cliente realiza uma compra, a Hotmart enviará os seguintes dados:

```json
{
  "buyer_email": "cliente@example.com",
  "email": "cliente@example.com",
  "purchase_id": "12345678",
  "id": "12345678",
  "plano": "1mes"  // Necessário enviar via URL param ao redirecionar
}
```

## 🔄 Fluxo Completo do Pagamento

```
1. Cliente clica em "Comprar Agora"
   ↓
2. Abre página da Hotmart em nova aba
   ↓
3. Cliente completa pagamento na Hotmart
   ↓
4. Hotmart envia dados para /api/webhook/hotmart
   ↓
5. Sistema cria assinatura no banco de dados
   ↓
6. Email de confirmação é enviado para cliente
   ↓
7. (Opcional) Cliente é redirecionado para /sucesso
   ↓
8. Cliente tem acesso ao devocional desbloqueado
```

## 📧 Emails Automáticos

O sistema envia 2 tipos de emails automaticamente:

### Email 1: Confirmação de Pagamento
- **Quando:** Imediatamente após receber webhook
- **Conteúdo:**
  - Plano contratado
  - Data de expiração
  - Link para acessar devocional
- **Para:** Email do cliente

### Email 2: Lembrete de Expiração
- **Quando:** Diariamente às 9:00 (Brasília) para assinaturas vencendo em até 7 dias
- **Conteúdo:**
  - Dias restantes
  - Data de expiração
  - Link para renovar
- **Para:** Email do cliente

## 🧪 Testando com Modo Sandbox da Hotmart

A Hotmart oferece um ambiente de testes:

1. Acesse [sandbox.hotmart.com](https://sandbox.hotmart.com)
2. Use uma conta de teste
3. Configure o webhook com a mesma URL
4. Realize compras de teste (nenhum dinheiro real é debitado)
5. Verifique se os dados chegam no servidor

## 🔍 Monitorando Webhooks

### Verificar Logs

```bash
# Ver últimos webhooks recebidos
tail -f /var/log/meditarfe/server.log | grep webhook

# Ou no código (server.js)
console.log(`📧 Email de confirmação enviado para: ${email}`);
```

### Banco de Dados

```sql
-- Verificar assinaturas ativadas
SELECT email, plano, data_expiracao, ativo 
FROM assinaturas 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar assinatura específica
SELECT * FROM assinaturas 
WHERE email = 'cliente@example.com' 
ORDER BY created_at DESC;
```

## ❌ Resolvendo Problemas

### Webhook não é chamado

**Problema:** Nenhum dado é recebido após pagamento

**Soluções:**
1. ✅ Verifique se a URL está correta: `https://www.meditarfe.com/api/webhook/hotmart`
2. ✅ Certifique-se que o domínio está acessível (HTTPS válido)
3. ✅ Verifique se o firewall não está bloqueando a conexão
4. ✅ Teste o webhook manualmente com curl:
```bash
curl -X POST https://www.meditarfe.com/api/webhook/hotmart \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","plano":"1mes"}'
```

### Email não é enviado

**Problema:** Cliente não recebe email de confirmação

**Soluções:**
1. ✅ Verifique credenciais SMTP no `.env`:
   ```bash
   # Teste conexão SMTP
   node -e "const nodemailer = require('nodemailer'); console.log('nodemailer loaded')"
   ```
2. ✅ Verifique logs: `tail -f logs.txt | grep "Email de confirmação"`
3. ✅ Verifique se email está na pasta de spam do cliente
4. ✅ Certifique-se que `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` estão corretos

### Assinatura não é criada

**Problema:** Webhook recebe dados mas assinatura não aparece no banco

**Soluções:**
1. ✅ Verifique se banco de dados está funcionando:
   ```bash
   sqlite3 database.db "SELECT COUNT(*) FROM assinaturas;"
   ```
2. ✅ Verifique logs de erro: `grep ERROR server.log`
3. ✅ Teste inserção manualmente no banco de dados

## 🔐 Segurança

### Validação de Requisições

Atualmente, o webhook aceita todas as requisições. Para produção, considere adicionar:

```javascript
// Adicionar header de autenticação
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET;

app.post('/api/webhook/hotmart', (req, res) => {
  const signature = req.headers['x-hotmart-signature'];
  
  // Validar assinatura
  if (!validarAssinatura(req.body, signature, HOTMART_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Assinatura inválida' });
  }
  
  // Processar webhook...
});
```

### Variáveis de Ambiente

Nunca commit credenciais! Use `.env`:

```env
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@example.com
SMTP_PASS=sua-senha-muito-secreta
SMTP_FROM=noreply@meditarfe.com
DOMAIN=https://www.meditarfe.com
HOTMART_WEBHOOK_SECRET=sua-chave-secreta
```

## 📞 Suporte

Se tiver problemas:

1. Consulte documentação oficial da Hotmart: https://docs.hotmart.com/webhooks
2. Verifique logs do servidor
3. Teste com modo sandbox primeiro
4. Entre em contato com suporte Hotmart

---

**Última atualização:** 2026-07-03
