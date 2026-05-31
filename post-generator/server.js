import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

const TEMPLATES_KNOWLEDGE = `
## TEMPLATES DE POSTS (BASE DE CONHECIMENTO)

### ESTRUTURA REELS:
1. Chamada com Gatilho — gancho direto, curioso e concreto
   Ex: "Essa startup virou um dos maiores unicórnios do mundo… por causa de três colchões infláveis."
2. Marca Forte — contexto rápido
   Ex: "Em 2007, dois designers e um amigo estavam com dificuldade de pagar o aluguel em São Francisco e decidiram testar algo improvável."
3. Plot Twist — o truque/reviravolra
   Ex: "Não era falta de ideia… O truque foi enxergar que hotel estava lotado e ninguém tinha opção barata... Então eles colocaram três colchões de ar na sala e alugaram para participantes de uma conferência."
4. Lição de Moral — aprendizado aplicável
   Ex: "A lição é simples: Não crie produto pensando em ser gigante. Crie produto que resolve uma necessidade real hoje. Eles testaram um problema real, ajustaram a solução, e *o Airbnb nasceu disso."
5. Fechamento — CTA curto e eficaz (não precisa sempre ter clique)
   Ex: "Aqui eu analiso decisões como essa — de produto, crescimento e estratégia. Me segue pra não perder o próximo."

### TEMPLATE: CARROSSEL DE IMAGENS
- Slide 1 (Capa): Título impactante + subtítulo
- Slides intermediários: Um conceito/item por slide, linguagem direta
- Último slide: CTA com "Me segue para não perder a próxima" + nome e handle

### TEMPLATE: POST TWITTER/TEXTO (branco ou preto)
- Com capa: TÍTULO EM CAPS + subtítulo descritivo
- Corpo: Hook forte → contexto → lista de pontos com • → resultado/conclusão
- Formato Twitter: frases curtas, quebras de linha estratégicas, emojis como marcadores
- CTA: "👉 Resultado: [benefício]"

### TEMPLATE: POST ONE PAGE (Infográfico / Post único rico)
Estrutura baseada nos melhores exemplos:
- Título BOLD e grande no topo (geralmente 2-3 linhas, fonte grande, impactante)
- Subtítulo contextual abaixo do título
- Elemento visual descritivo (tabela, lista numerada, pirâmide, radar, grid, diagrama)
  → Descreva o visual com clareza: "VISUAL: [diagrama de pirâmide com 5 níveis...]"
- Dados/estatística de impacto quando disponível (ex: "56% dos CEOs não usam IA no dia a dia")
- Lista de itens com numeração ou ícones (máx 5-7 itens por seção)
- Fonte dos dados quando aplicável
- Handle e CTA final

Exemplos de one-page de sucesso:
- "Os 5 Níveis de Maturidade em IA" — pirâmide com dados + lista de níveis + CTA
- "Radar de Oportunidades com IA" — quadrantes (Front Office, Back Office, Capacidades Centrais, Produtos)
- "O Novo Processo de Aquisição de Clientes" — modelo funil Alcance→Autoridade→Audiência→Receita→Retenção→Indicação
- "Uso de IA na População Mundial" — visual com quadrados representando milhões de pessoas + dados

Instrução especial: Para one-page, descreva detalhadamente como o visual deve ser feito pelo designer, inclua todos os textos que devem aparecer no post, e finalize com CTA.

### TEMPLATE: POST REELS/VÍDEO (roteiro)
- Abertura (0-3s): gancho visual + frase de impacto
- Desenvolvimento (3-25s): 3 movimentos/passos rápidos
- Fechamento (25-30s): CTA direto

### CALENDÁRIO SEMANAL:
- Segunda: Reels seriado (alcance e crescimento)
- Terça: Carrossel de Gestão (share e autoridade)
- Quarta: Stories + Post "Frase da Semana com IA" (engajamento)
- Quinta: Carrossel de IA (share e autoridade)
- Sexta: Post "Frase da Semana envolvendo Gestão" (leveza + reflexão)
- Sábado: Carrossel de News (fonte confiável)
- Domingo: Stories pessoais bastidores (conexão e humanizar)

## PILARES DE CONTEÚDO

### PILAR 1 — AUTORIDADE (6 ideias):
- Erro mais comum do seu nicho
- Mito que todo mundo acredita
- Antes e depois de um cliente
- Bastidor de um resultado
- Sua opinião polêmica sobre [tema do nicho]
- O que você faria se começasse hoje

### PILAR 2 — CONEXÃO (6 ideias):
- História pessoal que ensina algo do nicho
- "Eu também já fui assim..."
- Rotina mostrando você fazendo o trabalho
- O lado difícil que ninguém mostra
- Carta pra sua versão de 1 ano atrás
- Por que você faz o que faz

### PILAR 3 — ENSINO (6 ideias):
- Passo a passo de algo simples
- "Como eu faço X em [tempo curto]"
- Ferramenta/gatilho que poucos usam
- Checklist antes de [ação importante do nicho]
- Comparativo: jeito errado vs. jeito certo
- Dicionário do nicho pra iniciante

### PILAR 4 — DESEJO (6 ideias):
- Transformação visível de cliente/resultado
- "A vida depois de resolver [problema]"
- Demonstração de resultado em números reais
- Prova social com contexto emocional
- "Imagina se você pudesse..."
- Antes/depois com narrativa de mudança

### PILAR 5 — CONVERSÃO (6 ideias):
- Quebra de objeção mais comum
- "Pra quem é / pra quem NÃO é"
- Comparativo: fazer sozinho vs. com método
- Resposta pública a uma pergunta do direct
- Convite direto: "se você está [dor], vem"
- Prova social + chamada pro próximo passo

## ESTRUTURA DE TÍTULOS/CAPAS (padrão afirmações provocativas ou perguntas curtas com tensão):
- Afirmação provocativa: "ELE FOI PRESO E CRIOU UMA EMPRESA DE US$ 162 MILHÕES."
- Curiosidade factual: "O CELULAR DE R$ 27 MIL USADO POR VIRGINIA"
- Pergunta com tensão: "A AMAZON NÃO QUER MAIS VENDER PRODUTOS?"
- Pergunta de custo: "QUANTO CUSTA UMA EXPERIÊNCIA RUIM?"
- Statement curto tenso: "A FERRARI PERDEU O RONCO DO MOTOR"
- Declaração polêmica: "O FIM DOS CHEFES?"
`;

app.post('/api/generate', upload.array('images', 5), async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(400).json({ error: 'API key obrigatória. Configure nas Configurações.' });
  }

  const client = new Anthropic({ apiKey });

  const {
    topic,
    platform,
    contentType,
    template,
    instructions,
    profile,
    themes,
  } = req.body;

  const profileData = profile ? JSON.parse(profile) : {};
  const themesData = themes ? JSON.parse(themes) : {};

  const platformInstructions = platform === 'linkedin'
    ? `PLATAFORMA: LinkedIn
- Tom mais profissional mas ainda direto e humano
- Posts mais longos são aceitos (até 3.000 caracteres)
- Use hashtags relevantes ao final (5-10 hashtags)
- Primeira linha é crucial (aparece antes do "ver mais")
- Formato: texto corrido com quebras de linha estratégicas
- Emojis: use com moderação (1-2 por parágrafo no máximo)
- Foco em insights de negócios, liderança, gestão`
    : `PLATAFORMA: Instagram
- Tom direto, visual, dinâmico
- Para carrosséis: texto por slide (cada slide máx 150 palavras)
- Para reels: roteiro com timing em segundos
- Use emojis estrategicamente
- Hashtags ao final quando for post de feed (15-25 hashtags)
- Stories: linguagem casual, interativa
- Foco em conteúdo visual e narrativo`;

  const profileContext = profileData.name
    ? `## PERFIL DO CRIADOR:
Nome: ${profileData.name}
Handle: ${profileData.handle || ''}
Bio/Especialidade: ${profileData.bio || ''}
Nicho: ${profileData.niche || ''}
Tom de voz: ${profileData.toneOfVoice || ''}
Missão/Proposta: ${profileData.mission || ''}
Público-alvo: ${profileData.audience || ''}`
    : '';

  const themesContext = themesData.topics?.length
    ? `## TEMAS E FONTES:
Tópicos principais: ${themesData.topics.join(', ')}
Fontes de referência: ${themesData.sources || ''}
Contexto de mercado: ${themesData.marketContext || ''}`
    : '';

  const contentPillarMap = {
    autoridade: 'PILAR 1 — AUTORIDADE',
    conexao: 'PILAR 2 — CONEXÃO',
    ensino: 'PILAR 3 — ENSINO',
    desejo: 'PILAR 4 — DESEJO',
    conversao: 'PILAR 5 — CONVERSÃO',
  };

  const templateMap = {
    reels: 'ESTRUTURA REELS (5 partes: Chamada com Gatilho → Marca Forte → Plot Twist → Lição de Moral → Fechamento)',
    carrossel: 'CARROSSEL DE IMAGENS (slide a slide, com capa impactante)',
    twitter_capa: 'POST TWITTER COM CAPA (título em caps + corpo em texto)',
    twitter_sem_capa: 'POST TWITTER SEM CAPA (começa direto no hook)',
    one_page: 'POST ONE PAGE (conteúdo completo em um único post)',
    video_roteiro: 'ROTEIRO REELS/VÍDEO (com timing e direção de cena)',
  };

  const messages = [];

  // Add reference images if provided
  const files = req.files || [];
  if (files.length > 0) {
    const imageContents = [];
    for (const file of files) {
      const imageData = fs.readFileSync(file.path);
      const base64 = imageData.toString('base64');
      imageContents.push({
        type: 'image',
        source: { type: 'base64', media_type: file.mimetype, data: base64 },
      });
      fs.unlinkSync(file.path);
    }
    imageContents.push({
      type: 'text',
      text: 'Estas são imagens de referência para o contexto do post. Use-as como inspiração visual e de conteúdo.',
    });
    messages.push({ role: 'user', content: imageContents });
    messages.push({ role: 'assistant', content: 'Entendi as imagens de referência. Vou usá-las como contexto.' });
  }

  const userPrompt = `
${TEMPLATES_KNOWLEDGE}

${profileContext}

${themesContext}

---

TAREFA: Crie um post completo para ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}.

PILAR DE CONTEÚDO: ${contentPillarMap[contentType] || contentType}
TEMPLATE A USAR: ${templateMap[template] || template}
${platformInstructions}

TÓPICO/IDEIA DO POST:
${topic}

${instructions ? `INSTRUÇÕES ADICIONAIS:\n${instructions}` : ''}

---

INSTRUÇÕES GERAIS OBRIGATÓRIAS:
1. Siga RIGOROSAMENTE a estrutura do template escolhido
2. O conteúdo deve refletir o perfil e tom de voz definido
3. Use a estrutura de títulos provocativos quando aplicável (caps, tensão, curiosidade)
4. O copy deve ser nativo da plataforma escolhida
5. Inclua todos os elementos do template (capa, slides, CTA etc.)
6. Se for carrossel, numere cada slide claramente [SLIDE 1], [SLIDE 2] etc.
7. Se for reels, use marcadores de tempo e etapas
8. CTA sempre presente e alinhado ao perfil
9. Linguagem direta, sem floreios, foco no valor

Retorne SOMENTE o copy do post, estruturado e pronto para uso, sem explicações adicionais.
`;

  messages.push({ role: 'user', content: userPrompt });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: `Você é um especialista em criação de conteúdo para redes sociais, com foco em LinkedIn e Instagram.
Você domina copywriting, storytelling e os algoritmos dessas plataformas.
Você cria conteúdo que gera autoridade, conexão e conversão.
Sempre siga os templates e estruturas fornecidas com precisão.
Seu output é direto: apenas o copy final, sem meta-comentários.`,
      messages,
    });

    const generatedText = response.content[0].text;
    res.json({ content: generatedText, platform, template, contentType });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar conteúdo' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
