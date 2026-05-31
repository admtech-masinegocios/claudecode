import { useState } from 'react';
import { Save, Eye, EyeOff, Plus, X, User, Target, Key, BookOpen } from 'lucide-react';

const TOPIC_SUGGESTIONS = [
  'Inteligência Artificial', 'Gestão Empresarial', 'Liderança', 'Startups',
  'Produtividade', 'Empreendedorismo', 'Marketing Digital', 'RH e Talentos',
  'Tecnologia', 'Inovação', 'Estratégia de Negócios', 'Cultura Organizacional',
  'Automação', 'ChatGPT', 'Claude', 'Finanças', 'Vendas', 'Growth',
];

const TONE_OPTIONS = [
  { value: 'direto_profissional', label: 'Direto e profissional' },
  { value: 'conversacional', label: 'Conversacional e acessível' },
  { value: 'inspiracional', label: 'Inspiracional e motivador' },
  { value: 'tecnico_didatico', label: 'Técnico e didático' },
  { value: 'provocativo_opinativo', label: 'Provocativo e opinativo' },
  { value: 'storyteller', label: 'Storyteller / narrativo' },
];

export default function Settings({ profile, setProfile, themes, setThemes, apiKey, setApiKey }) {
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  const save = () => {
    try {
      localStorage.setItem('pg_profile', JSON.stringify(profile));
      localStorage.setItem('pg_themes', JSON.stringify(themes));
      localStorage.setItem('pg_apiKey', apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    }
  };

  const addTopic = (t) => {
    const trimmed = (t || newTopic).trim();
    if (!trimmed) return;
    if (!themes.topics?.includes(trimmed)) {
      setThemes(prev => ({ ...prev, topics: [...(prev.topics || []), trimmed] }));
    }
    setNewTopic('');
  };

  const removeTopic = (t) => {
    setThemes(prev => ({ ...prev, topics: (prev.topics || []).filter(x => x !== t) }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Configurações</h2>
          <p className="text-sm text-gray-400 mt-1">Configure seu perfil, temas e API key para personalizar os posts gerados.</p>
        </div>
        <button
          onClick={save}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
          {saved ? <><span>✓</span> Salvo!</> : <><Save size={15} /> Salvar</>}
        </button>
      </div>

      {/* API Key */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">API Key Anthropic</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Necessária para gerar conteúdo. Obtenha em{' '}
          <span className="text-indigo-400">console.anthropic.com</span>.
          A chave é salva apenas no seu navegador (localStorage).
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            className="input pr-10"
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {apiKey && (
          <p className="text-xs text-green-400 mt-2">✓ API key configurada</p>
        )}
      </div>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Meu Perfil</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Quanto mais detalhado, mais personalizado será o conteúdo gerado.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              placeholder="Ex: João Silva"
              value={profile.name || ''}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Handle / @</label>
            <input
              className="input"
              placeholder="@seuperfil"
              value={profile.handle || ''}
              onChange={e => setProfile(p => ({ ...p, handle: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Bio / Especialidade</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ex: Empresário e especialista em IA aplicada à gestão. Ajudo líderes a usar tecnologia para escalar resultados sem aumentar equipe..."
              value={profile.bio || ''}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Nicho / Segmento</label>
            <input
              className="input"
              placeholder="Ex: IA + Gestão Empresarial"
              value={profile.niche || ''}
              onChange={e => setProfile(p => ({ ...p, niche: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Tom de voz</label>
            <select
              className="select"
              value={profile.toneOfVoice || ''}
              onChange={e => setProfile(p => ({ ...p, toneOfVoice: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {TONE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Missão / Proposta de valor</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Ex: Mostrar que qualquer empresário pode usar IA para trabalhar menos e faturar mais..."
              value={profile.mission || ''}
              onChange={e => setProfile(p => ({ ...p, mission: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Público-alvo</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Ex: Donos de PMEs, gestores e empreendedores de 30-50 anos que querem usar IA mas não sabem por onde começar..."
              value={profile.audience || ''}
              onChange={e => setProfile(p => ({ ...p, audience: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Contexto adicional sobre você</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Adicione qualquer informação relevante: conquistas, projetos, experiências, posicionamentos únicos que devem aparecer no conteúdo..."
              value={profile.context || ''}
              onChange={e => setProfile(p => ({ ...p, context: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Themes & Topics */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-green-400" />
          <h3 className="text-sm font-semibold text-white">Temas e Fontes</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Defina os temas principais do seu conteúdo. O gerador usará isso para contextualizar os posts.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Tópicos principais</label>
            <div className="flex gap-2 mb-3">
              <input
                className="input flex-1"
                placeholder="Ex: Automação com IA"
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTopic()}
              />
              <button onClick={() => addTopic()} className="btn-secondary shrink-0">
                <Plus size={14} />
                Add
              </button>
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TOPIC_SUGGESTIONS.filter(s => !themes.topics?.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addTopic(s)}
                  className="text-xs text-gray-400 border border-gray-700 hover:border-indigo-500/50 hover:text-indigo-300 px-2 py-1 rounded-full transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
            {/* Added topics */}
            {themes.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {themes.topics.map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 px-3 py-1.5 rounded-full">
                    {t}
                    <button onClick={() => removeTopic(t)} className="hover:text-red-400 transition-colors">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Fontes e referências</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ex: MIT Technology Review, Harvard Business Review, newsletters de IA como Morning Brew Tech, criadores como Sam Altman, Lex Fridman..."
              value={themes.sources || ''}
              onChange={e => setThemes(t => ({ ...t, sources: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Contexto de mercado / tendências atuais</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ex: O mercado brasileiro está adotando IA mais lentamente que EUA/Europa mas com grande potencial. PMEs são o foco principal. Claude e ChatGPT são as ferramentas mais usadas..."
              value={themes.marketContext || ''}
              onChange={e => setThemes(t => ({ ...t, marketContext: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Instruções padrão para todos os posts</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ex: Sempre termine com meu handle @seuperfil. Nunca use jargão técnico sem explicar. Sempre inclua pelo menos um dado ou número concreto..."
              value={themes.defaultInstructions || ''}
              onChange={e => setThemes(t => ({ ...t, defaultInstructions: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Base de conhecimento</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Adicione textos, exemplos de posts que você gosta, transcrições ou qualquer referência que deve guiar o estilo do conteúdo.
        </p>
        <textarea
          className="input resize-none"
          rows={8}
          placeholder="Cole aqui exemplos de posts que você gosta, transcrições de vídeos seus, artigos de referência, frases que representam seu estilo...

Exemplo:
'Post que funcionou bem: A maioria das empresas ainda usa planilha para gerenciar RH em 2025. Não é falta de tecnologia...'

'Meu estilo: Direto, sem enrolação. Começo sempre com uma afirmação que gera curiosidade ou discordância. Nunca explico o óbvio...'"
          value={themes.knowledgeBase || ''}
          onChange={e => setThemes(t => ({ ...t, knowledgeBase: e.target.value }))}
        />
      </div>

      {/* Save button */}
      <button
        onClick={save}
        className={`btn-primary w-full py-3 text-sm ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
      >
        {saved ? (
          <><span>✓</span> Salvo com sucesso!</>
        ) : (
          <><Save size={16} /> Salvar configurações</>
        )}
      </button>
    </div>
  );
}
