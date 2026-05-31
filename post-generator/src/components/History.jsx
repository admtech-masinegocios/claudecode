import { useState } from 'react';
import { Copy, Check, Trash2, FileText, Search, X, ChevronRight, RefreshCw } from 'lucide-react';
import { getHistory, deletePost, clearHistory } from '../lib/history';
import { generatePostPDF } from '../lib/pdf';

const PLATFORM_ICON = { instagram: '📸', linkedin: '💼' };
const TEMPLATE_LABELS = {
  reels: '🎬 Reels', carrossel: '📱 Carrossel', twitter_capa: '🖼️ Post+Capa',
  twitter_sem_capa: '📝 Post Texto', one_page: '📊 One Page', video_roteiro: '🎥 Roteiro',
};
const PILLAR_COLORS = {
  autoridade: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  conexao:    'text-green-400  bg-green-400/10  border-green-400/20',
  ensino:     'text-blue-400   bg-blue-400/10   border-blue-400/20',
  desejo:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
  conversao:  'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function History({ profile, apiKey }) {
  const [posts, setPosts] = useState(() => getHistory());
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  const filtered = posts.filter(p =>
    !search ||
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const copy = (post) => {
    navigator.clipboard.writeText(post.content);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const remove = (id) => {
    deletePost(id);
    setPosts(getHistory());
    if (expandedId === id) setExpandedId(null);
  };

  const clear = () => {
    clearHistory();
    setPosts([]);
    setConfirmClear(false);
    setExpandedId(null);
  };

  const downloadPDF = async (post) => {
    setPdfLoadingId(post.id);
    try {
      await generatePostPDF({
        apiKey,
        postContent: post.content,
        platform:    post.platform,
        template:    post.template,
        contentType: post.contentType,
        topic:       post.topic,
        profile,
      });
    } catch(e) { alert('Erro ao gerar PDF: ' + e.message); }
    finally { setPdfLoadingId(null); }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
           ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Histórico de posts</h2>
          <p className="text-xs text-gray-500 mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''} salvos</p>
        </div>
        {posts.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Apagar tudo?</span>
                <button onClick={clear} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors">Confirmar</button>
                <button onClick={() => setConfirmClear(false)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 size={13} /> Limpar histórico
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      {posts.length > 3 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-8 pr-8"
            placeholder="Buscar no histórico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
          <FileText size={32} className="text-gray-700" />
          <p className="text-gray-400 font-medium">
            {search ? 'Nenhum resultado encontrado' : 'Nenhum post gerado ainda'}
          </p>
          <p className="text-xs text-gray-600 max-w-xs">
            {search ? 'Tente outros termos de busca.' : 'Gere um post no Gerador — ele será salvo automaticamente aqui.'}
          </p>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="card overflow-hidden">
            {/* Header row */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs text-gray-400">
                    {PLATFORM_ICON[post.platform]} {post.platform === 'instagram' ? 'Instagram' : 'LinkedIn'}
                  </span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-400">{TEMPLATE_LABELS[post.template] || post.template}</span>
                  {post.contentType && (
                    <>
                      <span className="text-gray-700">·</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PILLAR_COLORS[post.contentType] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                        {post.contentType.charAt(0).toUpperCase() + post.contentType.slice(1)}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-600 ml-auto shrink-0">{formatDate(post.date)}</span>
                </div>
                {post.topic && (
                  <p className="text-xs text-gray-400 truncate mb-1">{post.topic.split('\n')[0]}</p>
                )}
                {expandedId !== post.id && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.content?.slice(0, 140)}…
                  </p>
                )}
              </div>
            </div>

            {/* Expanded content */}
            {expandedId === post.id && (
              <div className="mt-3 bg-gray-950 rounded-xl p-4 border border-gray-800 max-h-72 overflow-auto">
                <pre className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">{post.content}</pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
              <button onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 px-2.5 py-1.5 rounded-lg transition-all">
                <ChevronRight size={11} className={`transition-transform ${expandedId === post.id ? 'rotate-90' : ''}`} />
                {expandedId === post.id ? 'Recolher' : 'Ver completo'}
              </button>

              <button onClick={() => copy(post)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${copiedId === post.id ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'}`}>
                {copiedId === post.id ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
              </button>

              <button onClick={() => downloadPDF(post)} disabled={pdfLoadingId === post.id}
                className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {pdfLoadingId === post.id ? <><RefreshCw size={11} className="animate-spin" /> Gerando...</> : <><FileText size={11} /> Baixar PDF</>}
              </button>

              <button onClick={() => remove(post.id)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 border border-transparent hover:border-red-500/20 px-2 py-1.5 rounded-lg transition-all ml-auto">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
