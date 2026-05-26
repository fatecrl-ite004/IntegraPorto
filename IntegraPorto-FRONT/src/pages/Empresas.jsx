import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

async function buscarCnpj(cnpj) {
  const apenasNumeros = cnpj.replace(/\D/g, '');
  if (apenasNumeros.length !== 14) return null;
  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${apenasNumeros}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function ModalEmpresa({ isOpen, onClose, onSucesso, editando, tipo, endpoint, campoExtra, labelExtra }) {
  const vazio = { nome: '', cnpj: '', telefone: '', email: '', ativo: true, [campoExtra]: '' };
  const [form, setForm] = useState(vazio);
  const [loading, setLoading] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  useEffect(() => {
    if (editando) {
      setForm({
        nome: editando.nome || '',
        cnpj: editando.cnpj || '',
        telefone: editando.telefone || '',
        email: editando.email || '',
        ativo: editando.ativo ?? true,
        [campoExtra]: editando[campoExtra] || '',
      });
    } else {
      setForm(vazio);
    }
  }, [editando, isOpen]);

  if (!isOpen) return null;

  const handleCnpjBlur = async () => {
    if (form.cnpj.replace(/\D/g, '').length !== 14) return;
    setBuscandoCnpj(true);
    const dados = await buscarCnpj(form.cnpj);
    if (dados) {
      const tel = dados.ddd_telefone_1 ? dados.ddd_telefone_1.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '';
      const emailDados = dados.email || '';
      const cidade = dados.municipio || '';
      setForm(prev => ({
        ...prev,
        nome: dados.razao_social || prev.nome,
        telefone: tel || prev.telefone,
        email: emailDados || prev.email,
        [campoExtra]: campoExtra === 'cidade' ? (cidade || prev[campoExtra]) : prev[campoExtra],
      }));
      toast.success('Dados preenchidos automaticamente via CNPJ!');
    } else {
      toast.error('CNPJ não encontrado. Preencha os dados manualmente.');
    }
    setBuscandoCnpj(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/${endpoint}/${editando.id}`, form);
        toast.success(`${tipo} atualizado!`);
      } else {
        await api.post(`/${endpoint}`, form);
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

  const f = (key) => ({ value: form[key] ?? '', onChange: e => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-lg text-left bg-white rounded-xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-5 border-b pb-4">
                {editando ? `Editar ${tipo}` : `Novo ${tipo}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>CNPJ <span className="text-slate-400 font-normal">(preencha para buscar dados automaticamente)</span></label>
                  <div className="relative">
                    <input
                      className={inputClass}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      {...f('cnpj')}
                      onBlur={handleCnpjBlur}
                    />
                    {buscandoCnpj && (
                      <span className="absolute right-3 top-2.5 text-xs text-blue-500 animate-pulse">Buscando...</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Nome / Razão Social *</label>
                  <input className={inputClass} required placeholder="Nome da empresa" {...f('nome')} />
                </div>
                <div>
                  <label className={labelClass}>{labelExtra}</label>
                  <input className={inputClass} placeholder={labelExtra} {...f(campoExtra)} />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input className={inputClass} placeholder="(00) 00000-0000" maxLength={20} {...f('telefone')} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>E-mail</label>
                  <input type="email" className={inputClass} placeholder="contato@empresa.com" {...f('email')} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="ativo" className="text-sm text-slate-700">Ativo no sistema</label>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading || buscandoCnpj} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Cadastrar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PaginaEmpresa({ tipo, endpoint, titulo, descricao, campoExtra, labelExtra, colunaExtra }) {
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

  const filtrados = lista.filter(e =>
    e.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    e.cnpj?.includes(busca)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{titulo}</h2>
          <p className="text-sm text-slate-500 mt-1">{descricao}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou CNPJ..." className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64" />
          <button onClick={() => { setEditando(null); setModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">+ Novo</button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CNPJ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{colunaExtra}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Carregando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Nenhum cadastro encontrado.</td></tr>
            ) : filtrados.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{e.nome}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{e.cnpj || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{e[campoExtra] || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.telefone || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.email || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${e.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {e.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditando(e); setModalOpen(true); }} className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">Editar</button>
                    <button onClick={() => handleDeletar(e.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalEmpresa isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregar} editando={editando} tipo={tipo} endpoint={endpoint} campoExtra={campoExtra} labelExtra={labelExtra} />
    </div>
  );
}

export function Transportadoras() {
  return <PaginaEmpresa tipo="Transportadora" endpoint="transportadoras" titulo="Transportadoras" descricao="Empresas de transporte parceiras da operação portuária." campoExtra="cidade" labelExtra="Cidade" colunaExtra="Cidade" />;
}

export function Armadores() {
  return <PaginaEmpresa tipo="Armador" endpoint="armadores" titulo="Armadores" descricao="Armadores e companhias de navegação responsáveis pelos navios." campoExtra="pais" labelExtra="País de Origem" colunaExtra="País" />;
}
