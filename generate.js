require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const db = require('./database');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

  // Verifica se já existe
  const existente = db.prepare(`SELECT * FROM ${tabela} WHERE data = ?`).get(dataStr);
  if (existente) {
    console.log(`Devocional ${tipo} para ${dataStr} já existe.`);
    return existente;
  }

  console.log(`Gerando devocional ${tipo} para ${dataStr}...`);

  // Busca versículos recentes para evitar repetição
  const recentes = db.prepare(`SELECT versiculo_referencia FROM ${tabela} ORDER BY data DESC LIMIT 30`).all();
  const versiculosUsados = recentes.map(r => r.versiculo_referencia).join(', ');
  const avisoRepeticao = versiculosUsados
    ? `\n\nVERSÍCULOS JÁ USADOS RECENTEMENTE (NÃO repita nenhum destes): ${versiculosUsados}`
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

Fale como quem entende os desafios específicos do homem moderno: pressão para prover, dúvidas sobre liderança, luta contra vícios, medo de falhar como pai. Seja profundo mas objetivo. Não seja piegas.`,
    'ela': `Este devocional é especificamente para MULHERES cristãs. Use linguagem que reconheça sua força, dignidade e chamado único focado em:

BELEZA INCORRUPTÍVEL (1 Pedro 3:3-4): Sua verdadeira beleza vem de um espírito gentil e tranquilo, não de aparência externa. Você é valiosa não por como parece.
FORÇA E DIGNIDADE (Provérbios 31): A mulher virtuosa tem força, trabalha com suas mãos, fala com sabedoria, e é respeitada. Ela é ativa, não passiva.
SABEDORIA (Provérbios 14:1): Como a sabedoria dela edifica seu lar, sua família, suas amizades — o impacto que tem vai além do que enxerga.
MATERNIDADE E MATERNAGEM (Salmo 113:9): Seja você mãe biológica, espiritual, profissional — a capacidade de nutrir, criar e cuidar é seu dom.
VALOR INTRÍNSECO (Efésios 1:3-14): Você é escolhida, remida, amada completamente por Cristo — não por sua utilidade, beleza ou sucesso.
CORAGEM E FÉ (Ester, Débora, Maria): Mulheres da Bíblia que foram corajosas, falaram verdade, e agiram quando era preciso.
COMUNIDADE E RELACIONAMENTOS (Provérbios 27:12): Seu papel em apoiar outras mulheres, construir amizades profundas, e ser força na comunidade.

Fale como quem entende: pressão por perfeição, crítica do próprio corpo, dúvida de seu valor, culpa de mãe, medo de não ser "o suficiente". Seja empoderador mas honesto.`,
    'casal': `Este devocional é para CASAIS cristãos crescendo juntos na fé. Crie devocionais que precisam de diálogo, reflexão compartilhada e prática conjunta focado em:

AMOR SACRIFICIAL (Efésios 5:25-33): O homem amando como Cristo amou; sacrifício mútuo; entrega genuína um ao outro.
SUBMISSÃO MÚTUA (Efésios 5:21-24): Não é dominação — é submissão MÚTUA por amor, onde ambos servem ao outro.
UNIDADE (Mateus 19:6): Dois se tornam um — não perdem identidade, mas constroem uma vida juntos onde Deus é o centro.
COMUNICAÇÃO VULNERÁVEL (Efésios 4:2-3): Falar verdade com amor, ouvir sem defender, discordar sem desprezar.
PERDÃO E RECONCILIAÇÃO (Colossenses 3:12-14): Como lidar com feridas, mágoas, decepções e escolher graça repetidamente.
INTIMIDADE ESPIRITUAL (1 Pedro 3:7): Orar juntos, crescer juntos, conhecer a alma do outro além do corpo.
CONSTRUÇÃO DO LAR (Provérbios 14:1): Como criar um lar que reflete Cristo, que nutre filhos, que é refúgio.
PACIÊNCIA E TOLERÂNCIA (1 Coríntios 13:4): Suportar um ao outro em amor, escolher paciência quando é difícil.

Estruture de forma que CONVIDE ao diálogo: perguntas para conversa, meditação lado a lado, orações compartilhadas, ações práticas juntos. Um casal que ora e refllete junto cresce junto.`
  };
  const contexto = contextoMap[tipo] || 'Este devocional é para todos os membros da igreja.';

  const prompt = `Você é um pastor evangélico brasileiro criando um devocional diário. ${contexto}

Gere um devocional PROFUNDO E ESPECÍFICO para hoje (${dataStr}) com:
1. Um versículo bíblico altamente relevante (escolha com cuidado — não use o mesmo repetidamente)
2. Uma reflexão que reconheça as lutas REAIS dessa audiência (3-4 frases, desafiadora e esperançosa)
3. Uma prática/aplicação CONCRETA e ESPECÍFICA para hoje (algo que essa pessoa possa fazer nas próximas horas)
4. Um tema principal (2-3 palavras)

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
- Varie os livros bíblicos — explore TODO Antigo e Novo Testamento${avisoRepeticao}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  const content = response.text.trim();

  // Extrai o JSON da resposta
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta inválida da API: ' + content);
  }

  const devocional = JSON.parse(jsonMatch[0]);

  // Salva no banco
  db.prepare(`
    INSERT OR REPLACE INTO ${tabela} (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(dataStr, devocional.versiculo_referencia, devocional.versiculo_texto, devocional.reflexao, devocional.pratica, devocional.tema);

  console.log(`Devocional gerado com sucesso para ${dataStr}:`, devocional.versiculo_referencia);
  return devocional;
}

// Executar se chamado diretamente
if (require.main === module) {
  const data = process.argv[2]; // opcional: node generate.js 2026-04-16
  const tipo = process.argv[3] || 'geral'; // opcional: node generate.js 2026-04-16 hfc
  gerarDevocional(data, tipo)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro ao gerar devocional:', err);
      process.exit(1);
    });
}

module.exports = { gerarDevocional };
