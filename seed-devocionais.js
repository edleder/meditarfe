const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'data', 'devocional.db'));

function dataHojeBR() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-');
}

const hoje = dataHojeBR();

// Devocional para Casal
const casal = {
  data: hoje,
  versiculo_referencia: 'Efésios 4:2-3',
  versiculo_texto: 'Com toda a humildade, mansidão e paciência, tolerando uns aos outros em amor, esforçando-vos diligentemente por manter a unidade do Espírito no vínculo da paz.',
  reflexao: `Paciência é uma palavra que ouvimos frequentemente, mas raramente entendemos seu verdadeiro peso. Não é apenas "esperar". É suportar com bondade. É escolher a graça quando a frustração bate à porta.

No casamento, você vai descobrir coisas sobre seu cônjuge que o frustrará. Hábitos irritantes. Maneiras diferentes de pensar. Velocidades diferentes de processar a vida. E aqui está a verdade incômoda: você é igualmente irritante para ele/ela.

A paciência não é tolerância passiva — é um ato agressivo de amor. É você decidindo, deliberadamente, que a pessoa ao seu lado vale mais que seu conforto imediato. Que a paz do relacionamento vale mais que estar certo. Que construir o futuro juntos vale mais que ganhar uma discussão hoje.

Quando você é paciente, você diz: "Você importa mais que meu ego."`,
  pratica: 'Escolha uma coisa específica e pratique paciência deliberada hoje.',
  tema: 'Paciência que Edifica',
  meditacao_guiada: `Sente-se em silêncio, um ao lado do outro (não frente a frente desta vez).

Pense em:
• Uma situação recente em que seu cônjuge foi paciente com você
• Como isso fez você se sentir amado
• Onde você pode ser mais paciente nos próximos dias
• Qual é o "irritante bonito" no seu parceiro — aquilo que o frustra mas que também o torna quem ele/ela é`,
  conversa: `Façam estas perguntas com vulnerabilidade:

1. "Quando eu sou impaciente, como você se sente? E o que você precisaria ouvir de mim naquele momento?"
2. "Qual é uma coisa que eu faço que testa sua paciência, mas você ainda assim escolhe me amar?"
3. "Como posso ser mais paciente com você especificamente? Há algo que você sempre desejou que eu entendesse melhor?"

Escutem sem defender. Apenas absorva o que é compartilhado.`,
  oracao: `Orem juntos, de mãos dadas:

Pai celeste,
Você foi infinitamente paciente conosco. Você nos espera. Você nos tolera. Você escolhe amor quando poderíamos receber julgamento.

Ensina-nos essa paciência tão difícil. Quando um de nós nos frustar, que lembremos que ele/ela também está aprendendo, também está ferido, também está tentando.

Que possamos dizer não com mansidão. Que possamos discordar sem desprezar. Que possamos estar cansados mas ainda escolher bondade.

E quando falhamos — e vamos falhar — que encontremos em nós a graça que você nos dá todos os dias.

Que nossa paciência um com o outro seja um testemunho vivo de tua paciência conosco.

Amém.`,
  acao: `Escolha uma coisa específica:

• Se você é naturalmente impaciente: Hoje, quando sentir irritação vindo, respire fundo e diga "Eu escolho paciência" antes de reagir.

• Se seu cônjuge é quem testa sua paciência: Hoje, reconheça o esforço dele/dela. Diga "Vejo você tentando, e isso importa."

• Juntos: Quando um de vocês ficar impaciente, em vez de discutir, abracem-se em silêncio por 30 segundos. Às vezes, paciência precisa de contato, não de palavras.`,
  versiculos_complementares: `• 1 Coríntios 13:4 — O amor é paciente
• Provérbios 14:29 — O pacífico tem grande entendimento
• Colossenses 3:12-14 — Revistam-se de paciência
• Romanos 12:12 — Alegres na esperança, pacientes na tribulação`,
};

// Devocional para Homem (Ele)
const ele = {
  data: hoje,
  versiculo_referencia: 'Provérbios 27:12',
  versiculo_texto: 'O prudente vê o perigo e se refugia; mas o simples avança e sofre as consequências.',
  reflexao: `Você é chamado para ser o provedor não apenas de recursos, mas de segurança. Isto não é fraqueza pedir ajuda. Não é fraqueza admitir quando você não sabe.

Força real é sabedoria. É você olhando à frente, vendo os perigos, e tendo a coragem de dizer "Eu preciso mudar isto." Muitos homens confundem força com invulnerabilidade. Eles carregam tudo sozinhos até que quebram.

Mas você não foi feito para carregar tudo sozinho. Você foi feito para liderar com integridade. Para amar profundamente. Para ser vulnerável o suficiente para crescer.

O homem de verdade não é aquele que nunca cai. É aquele que se levanta, aprende, e ajuda outros a fazer o mesmo.`,
  pratica: 'Peça ajuda em uma área onde você tem lutado sozinho.',
  tema: 'Força na Vulnerabilidade',
  acao: `Escolha uma coisa hoje:

• Identifique um área de sua vida onde você está fingindo estar bem quando não está. Considere contar a alguém de confiança.
• Invista tempo em aprender algo que você sempre teve medo de não ser "bom" em.
• Deixe alguém ajudá-lo. De verdade.`,
  versiculos_complementares: `• 1 Pedro 3:7 — Vivam com sabedoria em relação às mulheres
• Efésios 5:25 — Amem suas esposas
• Provérbios 22:29 — Você conhece alguém diligente?`,
};

// Devocional para Mulher (Ela)
const ela = {
  data: hoje,
  versiculo_referencia: '1 Pedro 3:3-4',
  versiculo_texto: 'O adorno de vocês não deve ser o de enfeites externos, como tranças no cabelo e jóias de ouro ou roupas finas. Em vez disso, seja o seu adorno a beleza incorruptível de um espírito gentil e tranquilo, que é de grande valor para com Deus.',
  reflexao: `A palavra "beleza" é complicada para a maioria das mulheres. Você cresceu em um mundo que mensura seu valor em aparência. Cada revista, cada anúncio, cada comentário bem-intencionado de alguém que a ama sussurra: "Você não é suficiente como está."

Mas há uma beleza que nenhum pano, nenhuma cor, nenhuma forma pode criar. É a beleza de uma mulher que conhece seu próprio valor. Que se senta em silêncio e sente a graça de estar viva. Que escolhe bondade quando poderia escolher crítica. Que ama mesmo quando foi ferida.

Esta é a beleza que nunca desaparece. Que não envelhecece. Que na verdade fica mais radiante com cada cicatriz, cada lição, cada escolha corajosa.

Você é bonita. Não porque parece um certo jeito. Mas porque você existe.`,
  pratica: 'Escolha um aspecto seu que você criticou hoje e mude a narrativa.',
  tema: 'Beleza Incorruptível',
  acao: `Escolha uma coisa hoje:

• Olhe no espelho e diga uma coisa gentil sobre você. Diga como se estivesse falando com alguém que você ama profundamente.
• Quando a autocrítica vier, pergunte: "Eu diria isto para minha amiga?" Se não, guarde isso para você.
• Repousar. Repouso é um ato de rebelião contra um mundo que diz que você nunca é suficiente.`,
  versiculos_complementares: `• Provérbios 31:30 — A beleza é vã
• Salmo 27:10 — O Senhor cuidará de você
• Efésios 1:7 — Você é redimida`,
};

try {
  // Inserir devocional de casal
  db.prepare(`
    INSERT OR REPLACE INTO devocionais_casal
    (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema, meditacao_guiada, conversa, oracao, acao, versiculos_complementares)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    casal.data, casal.versiculo_referencia, casal.versiculo_texto, casal.reflexao, casal.pratica, casal.tema,
    casal.meditacao_guiada, casal.conversa, casal.oracao, casal.acao, casal.versiculos_complementares
  );

  // Inserir devocional para homem
  db.prepare(`
    INSERT OR REPLACE INTO devocionais_ele
    (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema, acao, versiculos_complementares)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ele.data, ele.versiculo_referencia, ele.versiculo_texto, ele.reflexao, ele.pratica, ele.tema,
    ele.acao, ele.versiculos_complementares
  );

  // Inserir devocional para mulher
  db.prepare(`
    INSERT OR REPLACE INTO devocionais_ela
    (data, versiculo_referencia, versiculo_texto, reflexao, pratica, tema, acao, versiculos_complementares)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ela.data, ela.versiculo_referencia, ela.versiculo_texto, ela.reflexao, ela.pratica, ela.tema,
    ela.acao, ela.versiculos_complementares
  );

  console.log(`✅ Devocionais inseridos para ${hoje}`);
} catch (e) {
  console.error('Erro:', e.message);
}
