import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

function ModalTerminal({ isOpen, onClose, onSucesso, terminalEdit }) {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    contato: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (terminalEdit) {
      setFormData(terminalEdit);
    } else {
      setFormData({ nome: '', cnpj: '', endereco: '', contato: '' });
    }
  }, [terminalEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (terminalEdit) {
        await api.put(`/terminais/${terminalEdit.id}`, formData);
        toast.success('Terminal atualizado!');
      } else {
        await api.post('/terminais', formData);
        toast.success('Terminal cadastrado!');
      }
      onSucesso();
      onClose();
    } catch {
      toast.error('Erro ao salvar terminal.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative inline-block w-full max-w-md text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">
                {terminalEdit ? 'Editar Terminal' : 'Novo Terminal'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                  <input type="text" required className={inputClass} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input type="text" className={inputClass} value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                  <input type="text" className={inputClass} value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contato</label>
                  <input type="text" className={inputClass} value={formData.contato} onChange={e => setFormData({...formData, contato: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Terminais() {
  const [terminais, setTerminais] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [terminalEdit, setTerminalEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const res = await api.get('/terminais');
      setTerminais(res.data);
    } catch {
      toast.error('Erro ao carregar terminais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este terminal?')) return;
    try {
      await api.delete(`/terminais/${id}`);
      toast.success('Excluído!');
      carregar();
    } catch {
      toast.error('Erro ao excluir (Pode estar em uso).');
    }
  };

  const filtrados = terminais.filter(t => 
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (t.cnpj && t.cnpj.includes(busca))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Terminais</h2>
          <p className="text-sm text-slate-500 mt-1">Locais de coleta e desembarque para as Folhas de Trabalho.</p>
        </div>
        <button onClick={() => { setTerminalEdit(null); setModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Novo Terminal
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        <input 
          type="text" 
          placeholder="Buscar por nome ou CNPJ..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">CNPJ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Endereço</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Contato</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Carregando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Nenhum terminal encontrado.</td></tr>
            ) : (
              filtrados.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.nome}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.cnpj || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.endereco || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.contato || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-3">
                    <button onClick={() => { setTerminalEdit(t); setModalOpen(true); }} className="text-blue-600 hover:text-blue-800"><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => handleExcluir(t.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalTerminal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregar} terminalEdit={terminalEdit} />
    </div>
  );
}
