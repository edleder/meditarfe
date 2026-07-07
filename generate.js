require('dotenv').config();
const db = require('./database');

function registrarLogGeracao(tipo, status, mensagem = '') {
  try {
    db.prepare(`
      INSERT INTO logs_geracao (tipo, status, mensagem)
      VALUES (?, ?, ?)
    `).run(tipo, status, mensagem);
  } catch (e) {
    console.error('[LOG] Erro ao registrar log de geração:', e.message);
  }
}

async function chamarGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY não está configurada');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error('Erro da API Groq: ' + (error.error?.message || response.statusText));
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('Groq retornou resposta vazia');
  }

  return content;
}

async function gerarDevocionalCasal(dataStr) {
  const tabela = 'devocionais_casal';

  const existente = db.prepare(`SELECT * FROM ${tabela} WHERE data = ?`).get(dataStr);
  if (existente) {
    console.log(`Devocional casal para ${dataStr} já existe.`);
    registrarLogGeracao('casal', 'SKIPPED', `Devocional já existe para ${dataStr}`);
    return existente;
  }

  console.log(`Gerando devocional CASAL completo para ${dataStr}...`);

  const recentes = db.prepare(`SELECT versiculo_referencia FROM ${tabela} ORDER BY data DESC LIMIT 20`).all();
  const versiculosUsados = recentes.map(r => r.versiculo_referencia).join(', ');
  const avisoRepeticao = versiculosUsados ? `\n\nVERSÍCULOS JÁ USADOS (NÃO repita): ${versiculosUsados}` : '';

  const prompt = `VOCÊ ESTÁ CRIANDO UM DEVOCIONAL PARA CASAIS. GERE COM TODOS OS CAMPOS OBRIGATÓRIOS.

ESTRUTURA OBRIGATÓRIA (TODOS os 7 campos devem estar preenchidos):

1. TEMA: Um título profundo (3-4 palavras)
2. VERSÍCULO: Um versículo bíblico (formato: Livro capítulo:versículo)
3. REFLEXÃO: 4-5 frases honestas sobre casamento
4. MEDITAÇÃO GUIADA: 4 pontos com "•" para casal fazer junto
5. CONVERSA: 3 perguntas para o casal se fazer (com "1. 2. 3.")
6. ORAÇÃO: Uma oração de mãos dadas (com [nome] personalizável)
7. AÇÃO DO DIA: 2-3 ações práticas com "•"
8. VERSÍCULOS: 4-5 versículos (formato: • Livro capítulo:versículo — Tema)

RESPONDA UNICAMENTE COM ESTE JSON (sem markdown, sem explicações):
{
  "tema": "Tema Profundo em Maiúsculas",
  "versiculo_referencia": "Efésios 5:25",
  "versiculo_texto": "Versículo completo em PT-BR",
  "reflexao": "Reflexão com 4-5 frases...",
  "meditacao_guiada": "• Ponto 1\\n• Ponto 2\\n• Ponto 3\\n• Ponto 4",
  "conversa": "1. Pergunta sobre sentimentos?\\n2. Pergunta sobre necessidades?\\n3. Pergunta sobre futuro?",
  "oracao": "Pai celeste,\\nTexto da oração...\\nAmém.",
  "acao": "• Ação 1\\n• Ação 2\\n• Ação 3",
  "versiculos_complementares": "• Romanos 12:12 — Paciência\\n• 1 Coríntios 13:4 — Amor\\n• Efésios 5:21 — Submissão\\n• Colossenses 3:14 — Unidade\\n• 1 Pedro 3:7 — Respeito"
}

CRÍTICO: TODOS os 8 campos devem ter conteúdo válido. NÃO deixe nenhum campo vazio ou com null.${avisoRepeticao}`;

  const content = await chamarGroq(prompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta inválida da API: ' + content);
  }

  const devocional = JSON.parse(jsonMatch[0]);

  if (!devocional.versiculo_referencia) devocional.versiculo_referencia = 'Versículo não informado';
  if (!devocional.versiculo_texto) devocional.versiculo_texto = 'Texto não informado';
  if (!devocional.reflexao) devocional.reflexao = 'Reflexão não gerada';
  if (!devocional.tema) devocional.tema = 'Sem tema';
  if (!devocional.meditacao_guiada) devocional.meditacao_guiada = '[Aguardando geração...]';
  if (!devocional.conversa) devocional.conversa = '[Aguardando geração...]';
  if (!devocional.oracao) devocional.oracao = '[Aguardando geração...]';
  if (!devocional.acao) devocional.acao = '[Aguardando geração...]';
  if (!devocional.versiculos_complementares) devocional.versiculos_complementares = '[Aguardando geração...]';

  db.prepare(`
    INSERT OR REPLACE INTO ${tabela}
    (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema, meditacao_guiada, conversa, oracao, acao, versiculos_complementares)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    dataStr,
    devocional.versiculo_referencia,
    devocional.versiculo_texto,
    devocional.reflexao,
    devocional.reflexao,
    devocional.tema,
    devocional.meditacao_guiada,
    devocional.conversa,
    devocional.oracao,
    devocional.acao,
    devocional.versiculos_complementares
  );

  registrarLogGeracao('casal', 'SUCCESS', `Gerado com: ${devocional.versiculo_referencia}`);
  console.log(`Devocional casal gerado com sucesso para ${dataStr}:`, devocional.versiculo_referencia);
  return devocional;
}

async function gerarDevocional(data, tipo = 'geral') {
  const dataObj = data ? new Date(data + 'T12:00:00') : new Date();
  const dataStr = dataObj.toISOString().split('T')[0];

  const tabelaMap = {
    'hfc': 'devocionais_hfc',
    'ele': 'devocionais_ele',
    'ela': 'devocionais_ela',
    'casal': 'devocionais_casal'
  };
  const tabela = tabelaMap[tipo] || 'devocionais';

  if (tipo === 'casal') {
    return await gerarDevocionalCasal(dataStr);
  }

  const existente = db.prepare(`SELECT * FROM ${tabela} WHERE data = ?`).get(dataStr);
  if (existente) {
    console.log(`Devocional ${tipo} para ${dataStr} já existe.`);
    registrarLogGeracao(tipo, 'SKIPPED', `Devocional já existe para ${dataStr}`);
    return existente;
  }

  console.log(`Gerando devocional ${tipo} para ${dataStr}...`);

  const recentes = db.prepare(`SELECT versiculo_referencia, tema FROM ${tabela} ORDER BY data DESC LIMIT 30`).all();
  const versiculosUsados = recentes.map(r => r.versiculo_referencia).join(', ');
  const temasUsados = recentes.map(r => r.tema).join(', ');
  const avisoRepeticao = versiculosUsados
    ? `\n\nVERSÍCULOS JÁ USADOS (NÃO repita): ${versiculosUsados}\n\nTEMAS JÁ USADOS (NÃO repita ou varie bastante): ${temasUsados}`
    : '';

  const contextoMap = {
    'hfc': 'Este devocional é especificamente para o grupo HFC (Homens Fortes e Corajosos) — homens cristãos buscando ser líderes piedosos em suas famílias e comunidades. Aborde temas como paternidade, liderança servil, integridade, coragem e fé masculina.',
    'ele': `Este devocional é especificamente para HOMENS cristãos. Use linguagem direta, desafiadora e prática focada em:

LIDERANÇA ESPIRITUAL (Efésios 5:25-33): Como o homem é chamado a amar sua esposa sacrificialmente e liderar sua família com integridade.
PROVEDORIA E PROTEÇÃO (1 Timóteo 5:8): Responsabilidade de cuidar, prover e proteger aqueles sob seu cuidado.
INTEGRIDADE E CARÁTER (Provérbios 10:9, 20:7): Um homem de palavra que suas ações refletem seus valores, deixando legado para seus filhos.
CORAGEM ESPIRITUAL (Josué 1:9, 2 Timóteo 1:7): Força para encarar dificuldades, resistir à tentação, ser vulnerável e pedir ajuda quando preciso.
PATERNIDADE PIEDOSA (Deuteronômio 6:6-9): Como ser presença ativa na vida dos filhos, ensinando fé pelo exemplo e diálogo.
RELACIONAMENTO COM DEUS (Salmo 42:1): Sede do coração de um homem por comunhão genuína com Deus, não apenas religiosidade.

Fale como quem entende os desafios específicos do homem moderno: pressão para prover, dúvidas sobre liderança, luta contra vícios, medo de falhar como pai. Seja profundo mas objetivo. Não seja piega.`,
    'ela': `Este devocional é especificamente para MULHERES cristãs. Use linguagem que reconheça sua força, dignidade e chamado único focado em:

BELEZA INCORRUPTÍVEL (1 Pedro 3:3-4): Sua verdadeira beleza vem de um espírito gentil e tranquilo, não de aparência externa. Você é valiosa não por como parece.
FORÇA E DIGNIDADE (Provérbios 31): A mulher virtuosa tem força, trabalha com suas mãos, fala com sabedoria, e é respeitada. Ela é ativa, não passiva.
SABEDORIA (Provérbios 14:1): Como a sabedoria dela edifica seu lar, sua família, suas amizades — o impacto que tem vai além do que enxerga.
MATERNIDADE E MATERNAGEM (Salmo 113:9): Seja você mãe biológica, espiritual, profissional — a capacidade de nutrir, criar e cuidar é seu dom.
VALOR INTRÍNSECO (Efésios 1:3-14): Você é escolhida, remida, amada completamente por Cristo — não por sua utilidade, beleza ou sucesso.
CORAGEM E FÉ (Ester, Débora, Maria): Mulheres da Bíblia que foram corajosas, falaram verdade, e agiram quando era preciso.
COMUNIDADE E RELACIONAMENTOS (Provérbios 27:12): Seu papel em apoiar outras mulheres, construir amizades profundas, e ser força na comunidade.

Fale como quem entende: pressão por perfeição, crítica do próprio corpo, dúvida de seu valor, culpa de mãe, medo de não ser "o suficiente". Seja empoderador mas honesto.`,
  };
  const contexto = contextoMap[tipo] || 'Este devocional é para todos os membros da igreja.';

  const prompt = `Você é um pastor evangélico brasileiro criando um devocional PROFUNDO E ESPECÍFICO para hoje (${dataStr}) com:
1. Um versículo bíblico altamente relevante (escolha com cuidado — não use o mesmo repetidamente)
2. Uma reflexão que reconheça as lutas REAIS dessa audiência (3-4 frases, desafiadora e esperançosa)
3. Uma prática/aplicação CONCRETA e ESPECÍFICA para hoje (algo que essa pessoa possa fazer nas próximas horas)
4. Um tema principal DIFERENTE E VARIADO (2-3 palavras) — CRIATIVO e que ainda não foi usado

${contexto}

Responda APENAS com JSON válido neste formato exato:
{
  "versiculo_referencia": "Livro capítulo:versículo",
  "versiculo_texto": "Texto completo do versículo na versão NVI ou ARC",
  "reflexao": "Texto da reflexão...",
  "pratica": "Texto da prática...",
  "tema": "Tema do dia"
}

Importante:
- NÃO seja genérico. Seja específico para essa audiência.
- A reflexão deve ser honesta sobre os desafios — não evite temas difíceis.
- A reflexão deve oferecer esperança bíblica real, não só conforto vazio.
- A prática deve ser TÃO ESPECÍFICA que a pessoa saiba EXATAMENTE o que fazer.
- Escolha versículos que se conectam PROFUNDAMENTE com o tema, não superficialmente.
- Varie os livros bíblicos — explore TODO Antigo e Novo Testamento.
- **TEMA OBRIGATÓRIO**: Crie um tema COMPLETAMENTE DIFERENTE dos anteriores. Explore aspectos diferentes do cristianismo, relacionamentos, crescimento pessoal, batalhas espirituais, alegria, luto, perdão, comunidade, intimidade com Deus, etc. SER CRIATIVO!${avisoRepeticao}`;

  const content = await chamarGroq(prompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta inválida da API: ' + content);
  }

  const devocional = JSON.parse(jsonMatch[0]);

  db.prepare(`
    INSERT OR REPLACE INTO ${tabela} (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(dataStr, devocional.versiculo_referencia, devocional.versiculo_texto, devocional.reflexao, devocional.pratica, devocional.tema);

  registrarLogGeracao(tipo, 'SUCCESS', `Gerado com: ${devocional.versiculo_referencia}`);
  console.log(`Devocional gerado com sucesso para ${dataStr}:`, devocional.versiculo_referencia);
  return devocional;
}

if (require.main === module) {
  const data = process.argv[2];
  const tipo = process.argv[3] || 'geral';
  gerarDevocional(data, tipo)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro ao gerar devocional:', err);
      registrarLogGeracao(process.argv[3] || 'geral', 'ERRO', err.message);
      process.exit(1);
    });
}

module.exports = { gerarDevocional, registrarLogGeracao };
