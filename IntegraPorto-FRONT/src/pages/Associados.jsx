import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

function ModalAssociado({ isOpen, onClose, onSucesso, editando }) {
  const vazio = { nome: '', cpf: '', rg: '', dtNascimento: '', nmPai: '', nmMae: '', inss: '', iss: '', telefone: '' };
  const [form, setForm] = useState(vazio);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editando) {
      setForm({
        nome: editando.nome || '',
        cpf: editando.cpf || '',
        rg: editando.rg || '',
        dtNascimento: editando.dtNascimento || '',
        nmPai: editando.nmPai || '',
        nmMae: editando.nmMae || '',
        inss: editando.inss || '',
        iss: editando.iss || '',
        telefone: editando.telefone || '',
      });
    } else {
      setForm(vazio);
    }
  }, [editando, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/associados/${editando.id}`, form);
        toast.success('Associado atualizado!');
      } else {
        await api.post('/associados', form);
        toast.success('Associado cadastrado!');
      }
      onSucesso();
      onClose();
    } catch (err) {
      toast.error('Erro ao salvar associado.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });
  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-2xl text-left bg-white rounded-xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-5 border-b pb-4">
                {editando ? 'Editar Associado' : 'Novo Associado / Motorista'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Nome Completo *</label>
                  <input className={inputClass} required placeholder="Nome completo" {...f('nome')} />
                </div>
                <div>
                  <label className={labelClass}>CPF</label>
                  <input className={inputClass} placeholder="000.000.000-00" maxLength={14} {...f('cpf')} />
                </div>
                <div>
                  <label className={labelClass}>RG</label>
                  <input className={inputClass} placeholder="RG" maxLength={20} {...f('rg')} />
                </div>
                <div>
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <input className={inputClass} placeholder="(00) 00000-0000" maxLength={20} {...f('telefone')} />
                </div>
                <div>
                  <label className={labelClass}>Data de Nascimento</label>
                  <input type="date" className={inputClass} {...f('dtNascimento')} />
                </div>
                <div>
                  <label className={labelClass}>INSS</label>
                  <input className={inputClass} placeholder="N° INSS" maxLength={11} {...f('inss')} />
                </div>
                <div>
                  <label className={labelClass}>Nome do Pai</label>
                  <input className={inputClass} placeholder="Nome do pai" {...f('nmPai')} />
                </div>
                <div>
                  <label className={labelClass}>Nome da Mãe</label>
                  <input className={inputClass} placeholder="Nome da mãe" {...f('nmMae')} />
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Cadastrar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Associados() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    try {
      const res = await api.get('/associados');
      setLista(res.data);
    } catch { toast.error('Erro ao carregar associados.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleDeletar = async (id) => {
    if (!confirm('Deseja excluir este associado?')) return;
    try {
      await api.delete(`/associados/${id}`);
      toast.success('Associado removido.');
      carregar();
    } catch { toast.error('Erro ao remover.'); }
  };

  const abrirNovo = () => { setEditando(null); setModalOpen(true); };
  const abrirEditar = (item) => { setEditando(item); setModalOpen(true); };
  const filtrados = lista.filter(a => a.nome?.toLowerCase().includes(busca.toLowerCase()) || a.cpf?.includes(busca));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Associados / Motoristas</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastro de motoristas e proprietários vinculados ao porto.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou CPF..." className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64" />
          <button onClick={abrirNovo} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">+ Novo</button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RG</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">INSS</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Carregando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Nenhum associado encontrado.</td></tr>
            ) : filtrados.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{a.nome}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{a.cpf || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{a.rg || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{a.inss || '—'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => abrirEditar(a)} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">Editar</button>
                  <button onClick={() => handleDeletar(a.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalAssociado isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregar} editando={editando} />
    </div>
  );
}
