import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

function ModalVeiculo({ isOpen, onClose, onSucesso, editando, tipo, endpoint }) {
  const vazio = { placa: '', renavan: '', chassi: '', antt: '', marca: '', modelo: '', ano: '', cor: '', cidade: '', uf: '', proprietarioId: '' };
  const [form, setForm] = useState(vazio);
  const [associados, setAssociados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/associados').then(r => setAssociados(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (editando) {
      setForm({
        placa: editando.placa || '',
        renavan: editando.renavan || '',
        chassi: editando.chassi || '',
        antt: editando.antt || '',
        marca: editando.marca || '',
        modelo: editando.modelo || '',
        ano: editando.ano || '',
        cor: editando.cor || '',
        cidade: editando.cidade || '',
        uf: editando.uf || '',
        proprietarioId: editando.proprietario?.id || '',
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
      const payload = { ...form, proprietarioId: form.proprietarioId || null };
      if (editando) {
        await api.put(`/${endpoint}/${editando.id}`, payload);
        toast.success(`${tipo} atualizado!`);
      } else {
        await api.post(`/${endpoint}`, payload);
        toast.success(`${tipo} cadastrado!`);
      }
      onSucesso();
      onClose();
    } catch {
      toast.error(`Erro ao salvar ${tipo}.`);
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
                {editando ? `Editar ${tipo}` : `Novo ${tipo}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Placa *</label>
                  <input className={inputClass} required placeholder="Ex: ABC1234" maxLength={7} style={{textTransform:'uppercase'}} {...f('placa')} />
                </div>
                <div>
                  <label className={labelClass}>RENAVAM</label>
                  <input className={inputClass} placeholder="RENAVAM" maxLength={11} {...f('renavan')} />
                </div>
                <div>
                  <label className={labelClass}>Marca</label>
                  <input className={inputClass} placeholder="Ex: Volvo, Mercedes" {...f('marca')} />
                </div>
                <div>
                  <label className={labelClass}>Modelo</label>
                  <input className={inputClass} placeholder="Ex: FH 460" {...f('modelo')} />
                </div>
                <div>
                  <label className={labelClass}>Ano</label>
                  <input type="number" className={inputClass} placeholder="2020" min={1980} max={2100} {...f('ano')} />
                </div>
                <div>
                  <label className={labelClass}>Cor</label>
                  <input className={inputClass} placeholder="Cor do veículo" {...f('cor')} />
                </div>
                <div>
                  <label className={labelClass}>ANTT</label>
                  <input className={inputClass} placeholder="Código ANTT" maxLength={20} {...f('antt')} />
                </div>
                <div>
                  <label className={labelClass}>Chassi</label>
                  <input className={inputClass} placeholder="Número do chassi" maxLength={17} {...f('chassi')} />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input className={inputClass} placeholder="Cidade de registro" {...f('cidade')} />
                </div>
                <div>
                  <label className={labelClass}>UF</label>
                  <input className={inputClass} placeholder="SP" maxLength={2} style={{textTransform:'uppercase'}} {...f('uf')} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Proprietário / Responsável</label>
                  <select className={inputClass} value={form.proprietarioId} onChange={e => setForm({ ...form, proprietarioId: e.target.value })}>
                    <option value="">— Sem vínculo —</option>
                    {associados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
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

function PaginaVeiculos({ tipo, endpoint, titulo, descricao }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    try {
      const res = await api.get(`/${endpoint}`);
      setLista(res.data);
    } catch { toast.error(`Erro ao carregar ${titulo}.`); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleDeletar = async (id) => {
    if (!confirm(`Deseja excluir este ${tipo}?`)) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success(`${tipo} removido.`);
      carregar();
    } catch { toast.error('Erro ao remover.'); }
  };

  const filtrados = lista.filter(v =>
    v.placa?.toLowerCase().includes(busca.toLowerCase()) ||
    v.marca?.toLowerCase().includes(busca.toLowerCase()) ||
    v.proprietario?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{titulo}</h2>
          <p className="text-sm text-slate-500 mt-1">{descricao}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por placa, marca ou proprietário..." className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72" />
          <button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">+ Novo</button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Placa</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Marca / Modelo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ano</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Proprietário</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Carregando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Nenhum {tipo} cadastrado.</td></tr>
            ) : filtrados.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 tracking-wider">{v.placa?.toUpperCase()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{v.marca} {v.modelo}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{v.ano || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{v.proprietario?.nome || <span className="text-slate-300 italic">Sem vínculo</span>}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setEditando(v); setModalOpen(true); }} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">Editar</button>
                  <button onClick={() => handleDeletar(v.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalVeiculo isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregar} editando={editando} tipo={tipo} endpoint={endpoint} />
    </div>
  );
}

export function Cavalos() {
  return <PaginaVeiculos tipo="Cavalo" endpoint="cavalos" titulo="Cavalos Mecânicos" descricao="Cadastro de caminhões e cavalos mecânicos operando no porto." />;
}

export function Carretas() {
  return <PaginaVeiculos tipo="Carreta" endpoint="carretas" titulo="Carretas / Implementos" descricao="Cadastro de carretas e implementos rodoviários." />;
}
