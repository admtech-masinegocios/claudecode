import { useState, useRef } from 'react';
import {
  Sparkles, Copy, Check, Instagram, Linkedin,
  Upload, X, ChevronDown, RefreshCw, Lightbulb
} from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'autoridade', label: 'Autoridade', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', desc: 'Posicione-se como referência' },
  { id: 'conexao', label: 'Conexão', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', desc: 'Humanize sua marca' },
  { id: 'ensino', label: 'Ensino', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', desc: 'Eduque seu público' },
  { id: 'desejo', label: 'Desejo', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', desc: 'Gere aspiração' },
  { id: 'conversao', label: 'Conversão', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', desc: 'Venda sem vender' },
];

const TEMPLATES = [
  { id: 'reels', label: 'Reels / Vídeo', icon: '🎬', desc: 'Gancho → Contexto → Plot twist → Lição → CTA' },
  { id: 'carrossel', label: 'Carrossel', icon: '📱', desc: 'Slides numerados com capa impactante' },
  { id: 'twitter_capa', label: 'Post com Capa', icon: '🖼', desc: 'Título em CAPS + corpo em texto' },
  { id: 'twitter_sem_capa', label: 'Post Texto', icon: '📝', desc: 'Hook direto + desenvolvimento' },
  { id: 'one_page', label: 'One Page', icon: '📋', desc: 'Conteúdo completo em um único post' },
  { id: 'video_roteiro', label: 'Roteiro Vídeo', icon: '🎥', desc: 'Roteiro com timing e direção de cena' },
];

const IDEAS_BY_TYPE = {
  autoridade: [
    'O erro mais comum que vejo no meu nicho',
    'O mito que todo mundo acredita (mas que é falso)',
    'Bastidor de um resultado que alcancei',
    'Minha opinião polêmica sobre [tema do nicho]',
    'O que eu faria diferente se começasse hoje',
    'Antes e depois de um cliente real',
  ],
  conexao: [
    'História pessoal que ensina algo sobre o meu trabalho',
    'Eu também já fui assim... [vulnerabilidade]',
    'O lado difícil que ninguém mostra nesse trabalho',
    'Por que eu faço o que faço',
    'Carta para minha versão de 1 ano atrás',
    'Minha rotina mostrando o trabalho real',
  ],
  ensino: [
    'Passo a passo de algo simples mas valioso',
    'Como eu faço X em [tempo curto]',
    'Ferramenta ou estratégia que poucos usam',
    'Checklist antes de [ação importante]',
    'Jeito errado vs. jeito certo',
    'Dicionário do nicho para iniciante',
  ],
  desejo: [
    'Transformação de cliente em números reais',
    'A vida depois de resolver [problema]',
    'Prova social com narrativa emocional',
    'Demonstração de resultado visual',
    'Imagina se você pudesse...',
    'Antes/depois com história de mudança',
  ],
  conversao: [
    'Quebrando a objeção mais comum',
    'Para quem É e para quem NÃO É',
    'Fazer sozinho vs. ter um método',
    'Resposta a uma pergunta do direct',
    'Se você está com [dor específica], vem',
    'Prova social + próximo passo',
  ],
};

export default function Generator({ profile, themes, apiKey }) {
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const generate = async () => {
    if (!apiKey) {
      setError('Configure sua API key nas Configurações antes de gerar.');
      return;
    }
    if (!topic.trim()) {
      setError('Descreva o tópico ou ideia do post.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('platform', platform);
      formData.append('contentType', contentType);
      formData.append('template', template);
      formData.append('instructions', instructions);
      formData.append('profile', JSON.stringify(profile));
      formData.append('themes', JSON.stringify(themes));
      images.forEach(img => formData.append('images', img.file));

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedType = CONTENT_TYPES.find(t => t.id === contentType);
  const selectedTemplate = TEMPLATES.find(t => t.id === template);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="space-y-5">
        {/* Platform selector */}
        <div className="card">
          <p className="label">Plataforma</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlatform('instagram')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                platform === 'instagram'
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Instagram</p>
                <p className="text-xs text-gray-400">Reels, Feed, Stories</p>
              </div>
            </button>
            <button
              onClick={() => setPlatform('linkedin')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                platform === 'linkedin'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Linkedin size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">LinkedIn</p>
                <p className="text-xs text-gray-400">Posts, Artigos, Carrosséis</p>
              </div>
            </button>
          </div>
        </div>

        {/* Content type */}
        <div className="card">
          <p className="label">Pilar de conteúdo</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => setContentType(ct.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  contentType === ct.id
                    ? `${ct.bg} ${ct.color} border-current`
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
          {selectedType && (
            <p className="text-xs text-gray-500 mt-2">{selectedType.desc}</p>
          )}
        </div>

        {/* Template */}
        <div className="card">
          <p className="label">Template</p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  template === t.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <p className={`text-xs font-semibold mt-1 ${template === t.id ? 'text-indigo-300' : 'text-gray-200'}`}>{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Topic input */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="label">Tópico / Ideia do post</p>
            <button
              onClick={() => setShowIdeas(!showIdeas)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Lightbulb size={12} />
              Ideias
              <ChevronDown size={12} className={`transition-transform ${showIdeas ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showIdeas && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(IDEAS_BY_TYPE[contentType] || []).map(idea => (
                <button
                  key={idea}
                  onClick={() => { setTopic(idea); setShowIdeas(false); }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          )}

          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Ex: Como usei IA para reduzir 4h de trabalho para 20 minutos no meu processo de recrutamento..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

        {/* Instructions */}
        <div className="card">
          <p className="label">Instruções adicionais (opcional)</p>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Ex: Use tom mais descontraído, inclua dados do mercado brasileiro, foque no público de pequenas empresas..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
        </div>

        {/* Image upload */}
        <div className="card">
          <p className="label">Imagens de referência (opcional)</p>
          <p className="text-xs text-gray-500 mb-3">Adicione imagens para contextualizar o post (até 5 imagens)</p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
          >
            <Upload size={20} className="text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Clique para fazer upload</p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG até 10MB cada</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Gerando conteúdo...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar post para {platform === 'instagram' ? 'Instagram' : 'LinkedIn'}
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Right: Output */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {result ? (
          <div className="card h-full flex flex-col gap-4">
            {/* Output header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {TEMPLATES.find(t => t.id === result.template)?.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {TEMPLATES.find(t => t.id === result.template)?.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.platform === 'instagram' ? '📸 Instagram' : '💼 LinkedIn'} ·{' '}
                    {CONTENT_TYPES.find(t => t.id === result.contentType)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generate}
                  className="btn-secondary text-xs py-1.5"
                  title="Gerar novamente"
                >
                  <RefreshCw size={13} />
                  Regerar
                </button>
                <button
                  onClick={copyContent}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Content */}
            <div className="bg-gray-950 rounded-xl p-5 overflow-auto max-h-[calc(100vh-280px)] text-sm text-gray-200 copy-output">
              {result.content}
            </div>

            {/* Copy button at bottom for convenience */}
            <button
              onClick={copyContent}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '✓ Copiado para a área de transferência!' : 'Copiar todo o conteúdo'}
            </button>
          </div>
        ) : (
          <div className="card h-96 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-300 font-medium">Seu post gerado aparecerá aqui</p>
              <p className="text-sm text-gray-500 mt-1">
                Configure o tipo, template e tópico à esquerda, depois clique em Gerar
              </p>
            </div>
            {!apiKey && (
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 max-w-xs">
                <p className="text-xs text-amber-400">
                  Você precisa configurar sua chave da API Anthropic em Configurações para gerar conteúdo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
