import { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Upload, X, ChevronDown, RefreshCw, Lightbulb, FileText } from 'lucide-react';
import { generatePost } from '../lib/generate';
import { savePost } from '../lib/history';
import { generatePostPDF } from '../lib/pdf';

const CONTENT_TYPES = [
  { id: 'autoridade', label: 'Autoridade', color: 'text-purple-400', active: 'border-purple-500 bg-purple-500/10', desc: 'Posicione-se como referência no nicho' },
  { id: 'conexao', label: 'Conexão', color: 'text-green-400', active: 'border-green-500 bg-green-500/10', desc: 'Humanize sua marca, gere empatia' },
  { id: 'ensino', label: 'Ensino', color: 'text-blue-400', active: 'border-blue-500 bg-blue-500/10', desc: 'Eduque e entregue valor direto' },
  { id: 'desejo', label: 'Desejo', color: 'text-orange-400', active: 'border-orange-500 bg-orange-500/10', desc: 'Gere aspiração e transformação' },
  { id: 'conversao', label: 'Conversão', color: 'text-red-400', active: 'border-red-500 bg-red-500/10', desc: 'Venda sem parecer que está vendendo' },
];

const TEMPLATES = [
  { id: 'reels', label: 'Reels', icon: '🎬', desc: 'Gancho → Contexto → Plot Twist → Lição → CTA' },
  { id: 'carrossel', label: 'Carrossel', icon: '📱', desc: 'Slides numerados com capa impactante' },
  { id: 'twitter_capa', label: 'Post + Capa', icon: '🖼️', desc: 'Título em CAPS + corpo em texto' },
  { id: 'twitter_sem_capa', label: 'Post Texto', icon: '📝', desc: 'Hook direto + desenvolvimento' },
  { id: 'one_page', label: 'One Page', icon: '📊', desc: 'Infográfico rico em post único' },
  { id: 'video_roteiro', label: 'Roteiro Vídeo', icon: '🎥', desc: 'Roteiro com timing e direção' },
];

const IDEAS = {
  autoridade: ['Erro mais comum do meu nicho', 'Mito que todo mundo acredita', 'Bastidor de um resultado real', 'Minha opinião polêmica sobre...', 'O que eu faria diferente se começasse hoje', 'Antes e depois de um cliente'],
  conexao: ['História pessoal que ensina algo', 'Eu também já fui assim...', 'O lado difícil que ninguém mostra', 'Por que faço o que faço', 'Carta para minha versão de 1 ano atrás', 'Minha rotina real de trabalho'],
  ensino: ['Passo a passo de algo simples', 'Como eu faço X em [tempo curto]', 'Ferramenta que poucos usam', 'Checklist antes de [ação importante]', 'Jeito errado vs. jeito certo', 'Dicionário do nicho para iniciante'],
  desejo: ['Transformação de cliente em números', 'A vida depois de resolver [problema]', 'Demonstração de resultado visual', 'Prova social com narrativa emocional', 'Imagina se você pudesse...', 'Antes/depois com história de mudança'],
  conversao: ['Quebrando a objeção mais comum', 'Para quem É e para quem NÃO É', 'Fazer sozinho vs. ter um método', 'Resposta a pergunta do direct', 'Se você está com [dor específica], vem', 'Prova social + próximo passo'],
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve({ data: base64, type: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Generator({ profile, themes, apiKey, prefilledIdea, onPrefilledConsumed }) {
  const [platform, setPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('autoridade');
  const [template, setTemplate] = useState('reels');
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const fileRef = useRef();

  // Apply prefilled idea from Ideas tab
  useEffect(() => {
    if (prefilledIdea) {
      if (prefilledIdea.topic) setTopic(prefilledIdea.topic);
      if (prefilledIdea.template) setTemplate(prefilledIdea.template);
      if (prefilledIdea.contentType) setContentType(prefilledIdea.contentType);
      onPrefilledConsumed?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prefilledIdea]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const generate = async () => {
    if (!apiKey) { setError('Configure sua API key nas ⚙️ Configurações.'); return; }
    if (!topic.trim()) { setError('Descreva o tópico ou ideia do post.'); return; }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const imageBase64List = await Promise.all(images.map(img => fileToBase64(img.file)));
      const content = await generatePost({ apiKey, topic, platform, contentType, template, instructions, profile, themes, imageBase64List });
      const postData = { content, platform, template, contentType, topic };
      setResult(postData);
      savePost(postData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedType = CONTENT_TYPES.find(t => t.id === contentType);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Left: Form ── */}
      <div className="space-y-4">

        {/* Platform */}
        <div className="card">
          <p className="label">Plataforma</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'instagram', label: 'Instagram', sub: 'Reels, Feed, Stories', icon: <span className="text-white text-sm font-bold">IG</span>, grad: 'from-purple-500 via-pink-500 to-orange-400', ring: 'border-pink-500 bg-pink-500/10' },
              { id: 'linkedin',  label: 'LinkedIn',  sub: 'Posts, Artigos',       icon: <span className="text-white text-sm font-bold">in</span>, grad: 'from-blue-600 to-blue-700',                ring: 'border-blue-500 bg-blue-500/10' },
            ].map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${platform === p.id ? p.ring : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center shrink-0`}>{p.icon}</div>
                <div className="text-left"><p className="text-sm font-semibold text-white">{p.label}</p><p className="text-xs text-gray-400">{p.sub}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Pillar */}
        <div className="card">
          <p className="label">Pilar de conteúdo</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {CONTENT_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setContentType(ct.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${contentType === ct.id ? ct.active + ' ' + ct.color : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                {ct.label}
              </button>
            ))}
          </div>
          {selectedType && <p className="text-xs text-gray-500">{selectedType.desc}</p>}
        </div>

        {/* Template */}
        <div className="card">
          <p className="label">Template</p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className={`p-3 rounded-lg border text-left transition-all ${template === t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                <span className="text-xl">{t.icon}</span>
                <p className={`text-xs font-semibold mt-1 ${template === t.id ? 'text-indigo-300' : 'text-gray-200'}`}>{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="label">Tópico / Ideia</p>
            <button onClick={() => setShowIdeas(!showIdeas)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              <Lightbulb size={12} /> Sugestões <ChevronDown size={12} className={`transition-transform ${showIdeas ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {showIdeas && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(IDEAS[contentType] || []).map(idea => (
                <button key={idea} onClick={() => { setTopic(idea); setShowIdeas(false); }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full transition-colors">
                  {idea}
                </button>
              ))}
            </div>
          )}
          <textarea className="input resize-none" rows={4}
            placeholder="Ex: Como uso IA para reduzir 4h de trabalho para 20 minutos no processo de recrutamento..."
            value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        {/* Instructions */}
        <div className="card">
          <p className="label">Instruções adicionais <span className="normal-case font-normal text-gray-600">(opcional)</span></p>
          <textarea className="input resize-none" rows={2}
            placeholder="Ex: Tom mais descontraído, inclua dados do mercado brasileiro, foco em pequenas empresas..."
            value={instructions} onChange={e => setInstructions(e.target.value)} />
        </div>

        {/* Image upload */}
        <div className="card">
          <p className="label">Imagens de referência <span className="normal-case font-normal text-gray-600">(opcional, até 5)</span></p>
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
            <Upload size={18} className="text-gray-500 mx-auto mb-1.5" />
            <p className="text-sm text-gray-400">Clique para adicionar imagens</p>
            <p className="text-xs text-gray-600 mt-0.5">PNG, JPG até 10MB</p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.preview} className="w-14 h-14 object-cover rounded-lg border border-gray-700" />
                  <button onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate */}
        <button onClick={generate} disabled={loading || !topic.trim()} className="btn-primary w-full py-3.5 text-sm">
          {loading ? <><RefreshCw size={16} className="animate-spin" /> Gerando com Claude...</>
                   : <><Sparkles size={16} /> Gerar post para {platform === 'instagram' ? 'Instagram' : 'LinkedIn'}</>}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* ── Right: Output ── */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {result ? (
          <div className="card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{TEMPLATES.find(t => t.id === result.template)?.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{TEMPLATES.find(t => t.id === result.template)?.label}</p>
                  <p className="text-xs text-gray-500">
                    {result.platform === 'instagram' ? '📸 Instagram' : '💼 LinkedIn'} · {CONTENT_TYPES.find(t => t.id === result.contentType)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={generate} className="btn-secondary text-xs py-1.5" title="Regerar">
                  <RefreshCw size={13} /> Regerar
                </button>
                <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-800" />

            <div className="bg-gray-950 rounded-xl p-5 overflow-auto max-h-[60vh] text-sm text-gray-200 copy-output leading-relaxed">
              {result.content}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={copy}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                {copied ? <><Check size={15} /> Copiado!</> : <><Copy size={15} /> Copiar conteúdo</>}
              </button>
              <button
                onClick={() => generatePostPDF({ content: result.content, platform: result.platform, template: result.template, contentType: result.contentType, topic, profile })}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all">
                <FileText size={15} /> Baixar PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="card h-80 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-300 font-semibold">Seu post gerado aparecerá aqui</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">Configure o pilar, template e tópico ao lado, depois clique em Gerar</p>
            </div>
            {!apiKey && (
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 max-w-xs">
                <p className="text-xs text-amber-400">⚠ Configure sua API key Anthropic em ⚙️ Configurações para começar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
