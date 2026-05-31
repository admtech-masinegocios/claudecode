const TEMPLATES_KNOWLEDGE = `
## TEMPLATES DE POSTS (BASE DE CONHECIMENTO)

### ESTRUTURA REELS:
1. Chamada com Gatilho — gancho direto, curioso e concreto
   Ex: "Essa startup virou um dos maiores unicórnios do mundo… por causa de três colchões infláveis."
2. Marca Forte — contexto rápido
   Ex: "Em 2007, dois designers e um amigo estavam com dificuldade de pagar o aluguel em São Francisco e decidiram testar algo improvável."
3. Plot Twist — a reviravolta/truque
   Ex: "Não era falta de ideia… O truque foi enxergar que hotel estava lotado e ninguém tinha opção barata... Então eles colocaram três colchões de ar na sala e alugaram para participantes de uma conferência."
4. Lição de Moral — aprendizado aplicável
   Ex: "A lição é simples: Não crie produto pensando em ser gigante. Crie produto que resolve uma necessidade real hoje. Eles testaram um problema real, ajustaram a solução, e *o Airbnb nasceu disso."
5. Fechamento — CTA curto e eficaz
   Ex: "Aqui eu analiso decisões como essa — de produto, crescimento e estratégia. Me segue pra não perder o próximo."

### TEMPLATE: CARROSSEL DE IMAGENS
- Slide 1 (Capa): Título impactante + subtítulo
- Slides intermediários: Um conceito/item por slide, linguagem direta
- Último slide: CTA com "Me segue para não perder a próxima" + nome e handle

### TEMPLATE: POST TWITTER/TEXTO COM CAPA
- Capa: TÍTULO EM CAPS + subtítulo descritivo
- Corpo: Hook forte → contexto → lista de pontos com • → resultado/conclusão
- Formato: frases curtas, quebras de linha estratégicas, emojis como marcadores
- CTA: "👉 Resultado: [benefício]"

### TEMPLATE: POST TEXTO SEM CAPA
- Começa direto no hook, sem título separado
- Primeira linha é o gancho que prende (aparece antes do "ver mais")
- Desenvolvimento com lista ou numeração
- CTA ao final

### TEMPLATE: POST ONE PAGE (Infográfico / Post único rico)
- Título BOLD e grande no topo (2-3 linhas, impactante)
- Subtítulo contextual
- Elemento visual descritivo: descreva com "VISUAL: [pirâmide com 5 níveis / radar com 4 quadrantes / tabela / grid...]"
- Dados/estatística de impacto (ex: "56% dos CEOs não usam IA no dia a dia")
- Lista de itens numerados ou com ícones (máx 5-7 itens)
- Fonte dos dados quando aplicável
- Handle e CTA final

Exemplos reais de one-page de sucesso:
- "Os 5 Níveis de Maturidade em IA" — pirâmide + dados + lista de níveis + CTA
- "Radar de Oportunidades com IA" — 4 quadrantes (Front Office, Back Office, Capacidades Centrais, Produtos)
- "O Novo Processo de Aquisição de Clientes" — funil Alcance→Autoridade→Audiência→Receita→Retenção→Indicação
- "Uso de IA na População Mundial" — visual waffle chart com dados concretos

### TEMPLATE: ROTEIRO REELS/VÍDEO
- [0-3s] Gancho visual + frase de impacto na tela
- [3-8s] Contexto / problema
- [8-20s] Desenvolvimento em 3 movimentos/passos
- [20-28s] Resultado / aprendizado
- [28-30s] CTA direto na câmera

## CALENDÁRIO SEMANAL:
- Segunda: Reels seriado (alcance e crescimento)
- Terça: Carrossel de Gestão (share e autoridade)
- Quarta: Stories + Post "Frase da Semana com IA" (engajamento)
- Quinta: Carrossel de IA (share e autoridade)
- Sexta: Post "Frase da Semana envolvendo Gestão" (leveza + reflexão)
- Sábado: Carrossel de News (fonte confiável)
- Domingo: Stories pessoais bastidores (conexão e humanizar)

## PILARES DE CONTEÚDO

### PILAR 1 — AUTORIDADE:
- Erro mais comum do seu nicho
- Mito que todo mundo acredita
- Antes e depois de um cliente
- Bastidor de um resultado
- Sua opinião polêmica sobre [tema do nicho]
- O que você faria se começasse hoje

### PILAR 2 — CONEXÃO:
- História pessoal que ensina algo do nicho
- "Eu também já fui assim..."
- Rotina mostrando você fazendo o trabalho
- O lado difícil que ninguém mostra
- Carta pra sua versão de 1 ano atrás
- Por que você faz o que faz

### PILAR 3 — ENSINO:
- Passo a passo de algo simples
- "Como eu faço X em [tempo curto]"
- Ferramenta/gatilho que poucos usam
- Checklist antes de [ação importante do nicho]
- Comparativo: jeito errado vs. jeito certo
- Dicionário do nicho pra iniciante

### PILAR 4 — DESEJO:
- Transformação visível de cliente/resultado
- "A vida depois de resolver [problema]"
- Demonstração de resultado em números reais
- Prova social com contexto emocional
- "Imagina se você pudesse..."
- Antes/depois com narrativa de mudança

### PILAR 5 — CONVERSÃO:
- Quebra de objeção mais comum
- "Pra quem é / pra quem NÃO é"
- Comparativo: fazer sozinho vs. com método
- Resposta pública a uma pergunta do direct
- Convite direto: "se você está [dor], vem"
- Prova social + chamada pro próximo passo

## ESTRUTURA DE TÍTULOS/CAPAS:
- Afirmação provocativa: "ELE FOI PRESO E CRIOU UMA EMPRESA DE US$ 162 MILHÕES."
- Curiosidade factual: "O CELULAR DE R$ 27 MIL USADO POR VIRGINIA"
- Pergunta com tensão: "A AMAZON NÃO QUER MAIS VENDER PRODUTOS?"
- Pergunta de custo: "QUANTO CUSTA UMA EXPERIÊNCIA RUIM?"
- Statement curto tenso: "A FERRARI PERDEU O RONCO DO MOTOR"
- Declaração polêmica: "O FIM DOS CHEFES?"
`;

const TEMPLATE_MAP = {
  reels: 'ESTRUTURA REELS (5 partes: Chamada com Gatilho → Marca Forte → Plot Twist → Lição de Moral → Fechamento)',
  carrossel: 'CARROSSEL DE IMAGENS (slide a slide numerados, com capa impactante)',
  twitter_capa: 'POST TWITTER COM CAPA (título em CAPS + corpo em texto com emojis)',
  twitter_sem_capa: 'POST TEXTO SEM CAPA (começa direto no hook)',
  one_page: 'POST ONE PAGE (infográfico rico com descrição visual detalhada)',
  video_roteiro: 'ROTEIRO REELS/VÍDEO (com timing em segundos e direção de cena)',
};

const CONTENT_PILLAR_MAP = {
  autoridade: 'PILAR 1 — AUTORIDADE',
  conexao: 'PILAR 2 — CONEXÃO',
  ensino: 'PILAR 3 — ENSINO',
  desejo: 'PILAR 4 — DESEJO',
  conversao: 'PILAR 5 — CONVERSÃO',
};

export async function generatePost({ apiKey, topic, platform, contentType, template, instructions, profile, themes, imageBase64List = [] }) {
  const platformInstructions = platform === 'linkedin'
    ? `PLATAFORMA: LinkedIn
- Tom profissional mas direto e humano
- Posts mais longos aceitos (até 3.000 caracteres)
- Hashtags relevantes ao final (5-10)
- Primeira linha crucial (aparece antes do "ver mais")
- Formato: texto corrido com quebras de linha estratégicas
- Emojis com moderação (1-2 por parágrafo)
- Foco em insights de negócios, liderança, gestão`
    : `PLATAFORMA: Instagram
- Tom direto, visual, dinâmico
- Para carrosséis: texto por slide (máx 150 palavras por slide)
- Para reels: roteiro com timing
- Emojis estrategicamente
- Hashtags ao final quando feed (15-25)
- Foco em conteúdo visual e narrativo`;

  const profileContext = profile?.name ? `## PERFIL DO CRIADOR:
Nome: ${profile.name}
Handle: ${profile.handle || ''}
Bio/Especialidade: ${profile.bio || ''}
Nicho: ${profile.niche || ''}
Tom de voz: ${profile.toneOfVoice || ''}
Missão: ${profile.mission || ''}
Público-alvo: ${profile.audience || ''}
${profile.context ? `Contexto adicional: ${profile.context}` : ''}` : '';

  const themesContext = themes?.topics?.length ? `## TEMAS E FONTES:
Tópicos principais: ${themes.topics.join(', ')}
${themes.sources ? `Fontes: ${themes.sources}` : ''}
${themes.marketContext ? `Contexto de mercado: ${themes.marketContext}` : ''}
${themes.knowledgeBase ? `Base de conhecimento / estilo de referência:\n${themes.knowledgeBase}` : ''}
${themes.defaultInstructions ? `Instruções padrão: ${themes.defaultInstructions}` : ''}` : '';

  const userPrompt = `
${TEMPLATES_KNOWLEDGE}

${profileContext}

${themesContext}

---

TAREFA: Crie um post completo para ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}.

PILAR DE CONTEÚDO: ${CONTENT_PILLAR_MAP[contentType] || contentType}
TEMPLATE A USAR: ${TEMPLATE_MAP[template] || template}
${platformInstructions}

TÓPICO/IDEIA DO POST:
${topic}

${instructions ? `INSTRUÇÕES ADICIONAIS:\n${instructions}` : ''}

---

INSTRUÇÕES OBRIGATÓRIAS:
1. Siga RIGOROSAMENTE a estrutura do template escolhido
2. O conteúdo deve refletir o perfil e tom de voz definido
3. Use a estrutura de títulos provocativos (caps, tensão, curiosidade)
4. Copy nativo da plataforma escolhida
5. Se carrossel: numere cada slide [SLIDE 1], [SLIDE 2] etc.
6. Se reels/vídeo: use marcadores de tempo
7. CTA sempre presente e alinhado ao perfil
8. Linguagem direta, sem floreios, foco no valor

Retorne SOMENTE o copy do post, estruturado e pronto para uso.
`;

  // Build messages array — add images first if present
  const userContent = [];

  if (imageBase64List.length > 0) {
    for (const img of imageBase64List) {
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: img.type, data: img.data },
      });
    }
    userContent.push({
      type: 'text',
      text: 'Estas são imagens de referência para o contexto do post.',
    });
  }

  userContent.push({ type: 'text', text: userPrompt });

  const body = {
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system: `Você é um especialista em criação de conteúdo para redes sociais, com foco em LinkedIn e Instagram.
Você domina copywriting, storytelling e os algoritmos dessas plataformas.
Você cria conteúdo que gera autoridade, conexão e conversão.
Siga os templates e estruturas fornecidas com precisão.
Seu output é direto: apenas o copy final, sem meta-comentários ou explicações.`,
    messages: [{ role: 'user', content: userContent }],
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.content[0].text;
}
