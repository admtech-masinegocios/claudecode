import { useState } from 'react';
import { Lightbulb, Newspaper, RefreshCw, Sparkles, ChevronRight, Copy, Check, Zap } from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'autoridade', label: 'Autoridade', color: 'text-purple-400', active: 'border-purple-500 bg-purple-500/10' },
  { id: 'conexao',   label: 'Conexão',    color: 'text-green-400',  active: 'border-green-500 bg-green-500/10' },
  { id: 'ensino',    label: 'Ensino',     color: 'text-blue-400',   active: 'border-blue-500 bg-blue-500/10' },
  { id: 'desejo',    label: 'Desejo',     color: 'text-orange-400', active: 'border-orange-500 bg-orange-500/10' },
  { id: 'conversao', label: 'Conversão',  color: 'text-red-400',    active: 'border-red-500 bg-red-500/10' },
];

const TEMPLATES = [
  { id: 'reels',           label: 'Reels',       icon: '🎬' },
  { id: 'carrossel',       label: 'Carrossel',   icon: '📱' },
  { id: 'twitter_capa',   label: 'Post + Capa',  icon: '🖼️' },
  { id: 'twitter_sem_capa',label: 'Post Texto',  icon: '📝' },
  { id: 'one_page',        label: 'One Page',    icon: '📊' },
  { id: 'video_roteiro',   label: 'Roteiro',     icon: '🎥' },
];

async function callClaude(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

// ─── SUGGESTIONS ────────────────────────────────────────────────────────────

function SuggestionsPanel({ profile, themes, apiKey, onUseIdea }) {
  const [contentType, setContentType] = useState('autoridade');
  const [template, setTemplate] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const generate = async () => {
    if (!apiKey) { setError('Configure sua API key nas Configurações.'); return; }
    setError(null);
    setLoading(true);
    setIdeas([]);

    const profileCtx = profile?.name
      ? `Criador: ${profile.name} | Nicho: ${profile.niche || ''} | Bio: ${profile.bio || ''} | Público: ${profile.audience || ''}`
      : '';
    const themesCtx = themes?.topics?.length
      ? `Tópicos: ${themes.topics.join(', ')}`
      : '';
    const templateCtx = template
      ? `Template preferido: ${TEMPLATES.find(t => t.id === template)?.label || template}`
      : '';

    const prompt = `Gere exatamente 8 sugestões de post para o pilar "${contentType.toUpperCase()}" no Instagram/LinkedIn.

${profileCtx}
${themesCtx}
${templateCtx}
${context ? `Contexto adicional fornecido pelo criador: "${context}"` : ''}

FORMATO DE SAÍDA — retorne APENAS um JSON válido, sem markdown, sem explicação:
[
  {
    "titulo": "título provocativo curto (máx 10 palavras, CAPS para palavras-chave)",
    "angulo": "descrição em 1 frase do ângulo/abordagem",
    "hook": "primeira frase gancho do post",
    "template": "reels|carrossel|twitter_capa|twitter_sem_capa|one_page|video_roteiro"
  }
]`;

    try {
      const text = await callClaude(
        apiKey,
        'Você é um especialista em criação de conteúdo para redes sociais. Retorne apenas JSON válido, sem markdown.',
        prompt
      );
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setIdeas(parsed);
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Erro ao processar resposta. Tente novamente.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyHook = (idx, hook) => {
    navigator.clipboard.writeText(hook);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Sugestão de conteúdos</h3>
        </div>

        <div className="space-y-4">
          {/* Content type */}
          <div>
            <p className="label">Pilar de conteúdo</p>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setContentType(ct.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${contentType === ct.id ? ct.active + ' ' + ct.color : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template (optional) */}
          <div>
            <p className="label">Template <span className="normal-case font-normal text-gray-600">(opcional)</span></p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(template === t.id ? '' : t.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border transition-all flex items-center gap-1 ${template === t.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div>
            <p className="label">Contexto / Direção <span className="normal-case font-normal text-gray-600">(opcional mas recomendado)</span></p>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ex: Quero falar sobre como IA está mudando o processo de contratação nas empresas. Foco em PMEs que ainda não usam tecnologia no RH..."
              value={context}
              onChange={e => setContext(e.target.value)}
            />
          </div>

          <button onClick={generate} disabled={loading}
            className="btn-primary w-full py-3 text-sm">
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Gerando sugestões...</>
                     : <><Sparkles size={15} /> Gerar 8 sugestões de conteúdo</>}
          </button>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}
        </div>
      </div>

      {/* Results */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            {ideas.length} sugestões geradas · clique em "Usar" para abrir no gerador
          </p>
          {ideas.map((idea, i) => (
            <div key={i} className="card hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-600/20 px-2 py-0.5 rounded-full">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {TEMPLATES.find(t => t.id === idea.template)?.icon}{' '}
                      {TEMPLATES.find(t => t.id === idea.template)?.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug mb-1">{idea.titulo}</p>
                  <p className="text-xs text-gray-400 mb-2">{idea.angulo}</p>
                  <div className="bg-gray-950 rounded-lg p-2.5 border border-gray-800">
                    <p className="text-xs text-gray-300 italic leading-relaxed">"{idea.hook}"</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                <button onClick={() => copyHook(i, idea.hook)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${copiedIdx === i ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  {copiedIdx === i ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar hook</>}
                </button>
                <button onClick={() => onUseIdea({ topic: `${idea.titulo}\n\n${idea.angulo}\n\nHook: ${idea.hook}`, template: idea.template, contentType })}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all ml-auto">
                  <Zap size={11} /> Usar no gerador
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NEWS / TRENDS ───────────────────────────────────────────────────────────

function NewsPanel({ profile, themes, apiKey, onUseIdea }) {
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const generate = async () => {
    if (!apiKey) { setError('Configure sua API key nas Configurações.'); return; }
    setError(null);
    setLoading(true);
    setNews([]);

    const topicsCtx = themes?.topics?.length ? themes.topics.join(', ') : 'IA, Gestão, Empreendedorismo';
    const nicheCtx = profile?.niche || 'IA e Gestão Empresarial';
    const audienceCtx = profile?.audience || 'Empreendedores e gestores';
    const sourcesCtx = themes?.sources || '';
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const prompt = `Data de hoje: ${today}

Perfil do criador de conteúdo:
- Nicho: ${nicheCtx}
- Público: ${audienceCtx}
- Tópicos: ${topicsCtx}
${sourcesCtx ? `- Fontes de referência: ${sourcesCtx}` : ''}

Gere 8 notícias/tendências QUENTES e REAIS do momento (maio/junho 2026) relacionadas ao nicho acima. Priorize:
- Lançamentos de produtos de IA (modelos, ferramentas, empresas)
- Movimentos de mercado relevantes (fusões, IPOs, rodadas)
- Tendências de gestão e liderança
- Casos de uso de IA em empresas reais
- Eventos e acontecimentos que estão gerando debate no setor

FORMATO DE SAÍDA — retorne APENAS um JSON válido:
[
  {
    "titulo": "título da notícia/tendência (impactante, máx 12 palavras)",
    "resumo": "2-3 frases resumindo o fato/tendência",
    "angulo_post": "como transformar isso em post: qual o ângulo, insight ou provocação",
    "tipo_conteudo": "autoridade|conexao|ensino|desejo|conversao",
    "template_sugerido": "reels|carrossel|twitter_capa|twitter_sem_capa|one_page|video_roteiro",
    "urgencia": "alta|media",
    "fonte": "nome da fonte ou empresa relacionada"
  }
]`;

    try {
      const text = await callClaude(
        apiKey,
        `Você é um curador de conteúdo especialista em IA, tecnologia e gestão empresarial. Conheça as últimas notícias até sua data de corte. Retorne apenas JSON válido, sem markdown ou explicações.`,
        prompt
      );
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setNews(parsed);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Erro ao processar resposta. Tente novamente.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const urgenciaColor = (u) => u === 'alta'
    ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';

  const tipoColor = {
    autoridade: 'text-purple-400', conexao: 'text-green-400', ensino: 'text-blue-400',
    desejo: 'text-orange-400', conversao: 'text-red-400',
  };

  const copyResumo = (idx, resumo) => {
    navigator.clipboard.writeText(resumo);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Notícias & Tendências quentes</h3>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-500">Atualizado às {lastUpdated}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Baseado no seu perfil e temas — tendências relevantes para criar conteúdo de alto alcance agora.
        </p>
        <button onClick={generate} disabled={loading}
          className="btn-primary w-full py-3 text-sm">
          {loading ? <><RefreshCw size={15} className="animate-spin" /> Buscando tendências...</>
                   : <><Newspaper size={15} /> {news.length > 0 ? 'Atualizar tendências' : 'Buscar tendências do momento'}</>}
        </button>
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">{error}</p>}
      </div>

      {news.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            {news.length} tendências · use como ponto de partida para posts de alto alcance
          </p>
          {news.map((item, i) => (
            <div key={i} className="card hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${urgenciaColor(item.urgencia)}`}>
                      {item.urgencia === 'alta' ? '🔥 Alta' : '⚡ Média'}
                    </span>
                    <span className={`text-xs font-medium ${tipoColor[item.tipo_conteudo] || 'text-gray-400'}`}>
                      {item.tipo_conteudo?.charAt(0).toUpperCase() + item.tipo_conteudo?.slice(1)}
                    </span>
                    {item.fonte && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        {item.fonte}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {TEMPLATES.find(t => t.id === item.template_sugerido)?.icon}{' '}
                      {TEMPLATES.find(t => t.id === item.template_sugerido)?.label}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white leading-snug mb-2">{item.titulo}</p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{item.resumo}</p>

                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">💡 Ângulo para post</p>
                    <p className="text-xs text-indigo-200 leading-relaxed">{item.angulo_post}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                <button onClick={() => copyResumo(i, `${item.titulo}\n\n${item.resumo}\n\nÂngulo: ${item.angulo_post}`)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${copiedIdx === i ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  {copiedIdx === i ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                </button>
                <button onClick={() => onUseIdea({
                    topic: `Notícia/Tendência: ${item.titulo}\n\n${item.resumo}\n\nÂngulo sugerido: ${item.angulo_post}`,
                    template: item.template_sugerido,
                    contentType: item.tipo_conteudo,
                  })}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all ml-auto">
                  <Zap size={11} /> Criar post sobre isso
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function Ideas({ profile, themes, apiKey, onUseIdea }) {
  const [activeSection, setActiveSection] = useState('suggestions');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Section tabs */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
        <button onClick={() => setActiveSection('suggestions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'suggestions' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <Lightbulb size={15} /> Sugestões de conteúdo
        </button>
        <button onClick={() => setActiveSection('news')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'news' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
          <Newspaper size={15} /> Notícias & Tendências
        </button>
      </div>

      {activeSection === 'suggestions' && (
        <SuggestionsPanel profile={profile} themes={themes} apiKey={apiKey} onUseIdea={onUseIdea} />
      )}
      {activeSection === 'news' && (
        <NewsPanel profile={profile} themes={themes} apiKey={apiKey} onUseIdea={onUseIdea} />
      )}
    </div>
  );
}
