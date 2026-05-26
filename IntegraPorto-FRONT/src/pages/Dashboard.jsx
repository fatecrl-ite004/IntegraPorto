import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, User } from 'lucide-react';

function ModalNoticia({ isOpen, onClose, onSucesso }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/noticias', { titulo, conteudo });
      toast.success('Notícia publicada!');
      setTitulo(''); setConteudo('');
      onSucesso();
      onClose();
    } catch {
      toast.error('Erro ao publicar notícia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-lg text-left bg-white rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Nova Notícia / Aviso</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={titulo} onChange={e => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo</label>
                <textarea required rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={conteudo} onChange={e => setConteudo(e.target.value)} />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Publicar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const [stats, setStats] = useState({ emAndamento: 0, pendentes: 0, concluidos: 0, cancelados: 0 });
  const [noticias, setNoticias] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNoticias, setLoadingNoticias] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const isAdminOrSec = role === 'ADM' || role === 'SEC';

  const fetchTrabalhos = async () => {
    try {
      const res = await api.get('/trabalhos');
      let emAndamento = 0, pendentes = 0, concluidos = 0, cancelados = 0;
      res.data.forEach(t => {
        if (t.status === 'CANCELADO') cancelados++;
        else if (t.status === 'CONCLUIDO') concluidos++;
        else if (t.status === 'EM_ANDAMENTO') emAndamento++;
        else pendentes++;
      });
      setStats({ emAndamento, pendentes, concluidos, cancelados });
    } catch {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchNoticias = async () => {
    try {
      const res = await api.get('/noticias');
      setNoticias(res.data);
    } catch {
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoadingNoticias(false);
    }
  };

  useEffect(() => {
    fetchTrabalhos();
    fetchNoticias();
  }, []);

  const handleDeleteNoticia = async (id) => {
    if(!window.confirm('Excluir esta notícia?')) return;
    try {
      await api.delete(`/noticias/${id}`);
      toast.success('Excluída com sucesso.');
      fetchNoticias();
    } catch {
      toast.error('Erro ao excluir notícia.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-2">Em Andamento</div>
          <div className="text-3xl font-bold text-slate-500">{loadingStats ? '...' : stats.emAndamento}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-2">Pendentes</div>
          <div className="text-3xl font-bold text-orange-500">{loadingStats ? '...' : stats.pendentes}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-2">Concluídos</div>
          <div className="text-3xl font-bold text-emerald-600">{loadingStats ? '...' : stats.concluidos}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-2">Cancelados</div>
          <div className="text-3xl font-bold text-red-600">{loadingStats ? '...' : stats.cancelados}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Mural de Notícias e Avisos</h2>
          {isAdminOrSec && (
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Nova Notícia
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {loadingNoticias ? (
            <p className="text-slate-500 text-sm">Carregando mural...</p>
          ) : noticias.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-slate-500 text-sm">Nenhum aviso publicado no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map(n => (
                <div key={n.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-slate-50 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{n.titulo}</h3>
                    {isAdminOrSec && (
                      <button onClick={() => handleDeleteNoticia(n.id)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap flex-1 mb-4">{n.conteudo}</p>
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 pt-3 mt-auto">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {n.autor?.nome}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(n.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ModalNoticia isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={fetchNoticias} />
    </div>
  );
}
