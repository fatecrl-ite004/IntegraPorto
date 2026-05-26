import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { AlertTriangle, Calendar } from 'lucide-react';

function diasParaVencer(dtStr) {
  if (!dtStr) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dtStr + 'T00:00:00');
  const diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

function BadgeCnh({ dtValidadeCnh }) {
  if (!dtValidadeCnh) return <span className="text-slate-300 italic text-xs">—</span>;
  const dias = diasParaVencer(dtValidadeCnh);
  const dataFmt = new Date(dtValidadeCnh + 'T00:00:00').toLocaleDateString('pt-BR');
  if (dias < 0) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">VENCIDA ({dataFmt})</span>;
  if (dias <= 30) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">Vence em {dias}d ({dataFmt})</span>;
  return <span className="text-sm text-slate-600">{dataFmt}</span>;
}

function ModalMotorista({ isOpen, onClose, onSucesso, editando }) {
  const vazio = { nome: '', cpf: '', cnh: '', dtValidadeCnh: '', telefone: '' };
  const [form, setForm] = useState(vazio);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editando) {
      setForm({
        nome: editando.nome || '',
        cpf: editando.cpf || '',
        cnh: editando.cnh || '',
        dtValidadeCnh: editando.dtValidadeCnh || '',
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
        await api.put(`/motoristas/${editando.id}`, form);
        toast.success('Motorista atualizado!');
      } else {
        await api.post('/motoristas', form);
        toast.success('Motorista cadastrado!');
      }
      onSucesso();
      onClose();
    } catch {
      toast.error('Erro ao salvar motorista.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key] || '', onChange: e => setForm({ ...form, [key]: e.target.value }) });
  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  // Calcular aviso de validade em tempo real
  const diasVenc = diasParaVencer(form.dtValidadeCnh);
  const avisoVencimento = form.dtValidadeCnh && diasVenc !== null && diasVenc <= 30;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-lg text-left bg-white rounded-xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-5 border-b pb-4">
                {editando ? 'Editar Motorista' : 'Novo Motorista'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nome Completo *</label>
                  <input className={inputClass} required placeholder="Nome completo do motorista" {...f('nome')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CPF</label>
                    <input className={inputClass} placeholder="000.000.000-00" maxLength={14} {...f('cpf')} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone / WhatsApp</label>
                    <input className={inputClass} placeholder="(00) 00000-0000" maxLength={20} {...f('telefone')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nº da CNH *</label>
                    <input className={inputClass} required placeholder="Número da CNH" maxLength={20} {...f('cnh')} />
                  </div>
                  <div>
                    <label className={labelClass}>Validade da CNH *</label>
                    <input type="date" className={`${inputClass} ${avisoVencimento ? 'border-orange-400 bg-orange-50' : ''}`} required {...f('dtValidadeCnh')} />
                    {avisoVencimento && (
                      <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${diasVenc < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {diasVenc < 0 ? 'CNH VENCIDA!' : `Vence em ${diasVenc} dia(s)!`}
                      </p>
                    )}
                  </div>
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

export default function Motoristas() {
  const [lista, setLista] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    try {
      const [resLista, resAlertas] = await Promise.all([
        api.get('/motoristas'),
        api.get('/motoristas/cnh-vencendo'),
      ]);
      setLista(resLista.data);
      setAlertas(resAlertas.data);
    } catch {
      toast.error('Erro ao carregar motoristas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleDeletar = async (id) => {
    if (!confirm('Deseja excluir este motorista?')) return;
    try {
      await api.delete(`/motoristas/${id}`);
      toast.success('Motorista removido.');
      carregar();
    } catch { toast.error('Erro ao remover.'); }
  };

  const filtrados = lista.filter(m =>
    m.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    m.cpf?.includes(busca) ||
    m.cnh?.includes(busca)
  );

  const cnhVencidas = alertas.filter(m => diasParaVencer(m.dtValidadeCnh) < 0);
  const cnhVencendo = alertas.filter(m => { const d = diasParaVencer(m.dtValidadeCnh); return d >= 0 && d <= 30; });

  return (
    <div className="space-y-5">
      {/* Alertas de CNH */}
      {(cnhVencidas.length > 0 || cnhVencendo.length > 0) && (
        <div className="space-y-3">
          {cnhVencidas.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">⚠️ CNH Vencida ({cnhVencidas.length} motorista{cnhVencidas.length > 1 ? 's' : ''})</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {cnhVencidas.map(m => m.nome).join(', ')}
                </p>
              </div>
            </div>
          )}
          {cnhVencendo.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-700">📅 CNH vencendo em até 30 dias ({cnhVencendo.length} motorista{cnhVencendo.length > 1 ? 's' : ''})</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  {cnhVencendo.map(m => `${m.nome} (${diasParaVencer(m.dtValidadeCnh)}d)`).join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Motoristas</h2>
            <p className="text-sm text-slate-500 mt-1">Cadastro de motoristas habilitados para operação.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, CPF ou CNH..." className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72" />
            <button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">+ Novo</button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nº CNH</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Validade CNH</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Carregando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Nenhum motorista encontrado.</td></tr>
              ) : filtrados.map(m => {
                const dias = diasParaVencer(m.dtValidadeCnh);
                const rowAlert = dias !== null && dias <= 30;
                return (
                  <tr key={m.id} className={`transition-colors ${rowAlert ? (dias < 0 ? 'bg-red-50 hover:bg-red-100' : 'bg-orange-50 hover:bg-orange-100') : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-2">
                      {m.nome}
                      {dias !== null && dias < 0 && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {dias !== null && dias >= 0 && dias <= 30 && <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{m.cpf || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{m.telefone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono font-semibold">{m.cnh}</td>
                    <td className="px-6 py-4 text-sm"><BadgeCnh dtValidadeCnh={m.dtValidadeCnh} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditando(m); setModalOpen(true); }} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">Editar</button>
                        <button onClick={() => handleDeletar(m.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalMotorista isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregar} editando={editando} />
    </div>
  );
}
