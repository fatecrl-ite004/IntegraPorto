import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { X, Pencil } from 'lucide-react';
import { useChapeiraStore } from '../store/useChapeiraStore';

// ──────────────────────────────────────────────
// Modal de Detalhe / Edição da Chapeira
// ──────────────────────────────────────────────
function ModalChapeira({ isOpen, onClose, onSucesso, vaga }) {
  const [form, setForm] = useState({
    tipoVaga: 'MUNICIPAL', status: true, chamar: '',
    responsavelId: '', motoristaId: '', cavaloId: '', carretaId: ''
  });
  const [dados, setDados] = useState(null);
  const [associados, setAssociados] = useState([]);
  const [motoristasLista, setMotoristasLista] = useState([]);
  const [cavalos, setCavalos] = useState([]);
  const [carretas, setCarretas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);

  useEffect(() => {
    if (!isOpen || !vaga) return;
    setModoEditar(false);

    api.get('/associados').then(r => setAssociados(r.data)).catch(() => {});
    api.get('/motoristas').then(r => setMotoristasLista(r.data)).catch(() => {});
    api.get('/cavalos').then(r => setCavalos(r.data)).catch(() => {});
    api.get('/carretas').then(r => setCarretas(r.data)).catch(() => {});

    api.get(`/chapeiras/vaga/${vaga}`).then(r => {
      const c = r.data;
      setDados(c);
      setForm({
        tipoVaga: c.tipoVaga || 'MUNICIPAL',
        status: c.status ?? true,
        chamar: c.chamar || '',
        responsavelId: c.responsavelId || '',
        motoristaId: c.motoristaId || '',
        cavaloId: c.cavaloId || '',
        carretaId: c.carretaId || '',
      });
    }).catch(() => {
      setDados(null);
      setForm({ tipoVaga: 'MUNICIPAL', status: true, chamar: '', responsavelId: '', motoristaId: '', cavaloId: '', carretaId: '' });
    });
  }, [isOpen, vaga]);

  if (!isOpen || !vaga) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/chapeiras/vaga/${vaga}`, {
        ...form,
        responsavelId: form.responsavelId || null,
        motoristaId: form.motoristaId || null,
        cavaloId: form.cavaloId || null,
        carretaId: form.carretaId || null,
      });
      setDados(res.data);
      setModoEditar(false);
      toast.success(`Chapeira ${vaga} atualizada!`);
      onSucesso();
    } catch {
      toast.error('Erro ao salvar chapeira.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-slate-500 mb-1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-2xl text-left bg-white rounded-xl shadow-2xl border border-slate-200">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
                {vaga}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Chapeira / Vaga {vaga}</h2>
                <p className="text-xs text-slate-500">{dados?.status === false ? <span className="text-red-500">Inativa</span> : <span className="text-emerald-500">Ativa</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!modoEditar && (
                <button onClick={() => setModoEditar(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <Pencil className="w-4 h-4" /> Editar
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {modoEditar ? (
            /* ── MODO EDIÇÃO ── */
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-6 space-y-4">
                <div>
                  <label className={labelClass}>Chamar Como (apelido)</label>
                  <input className={inputClass} placeholder="Apelido opcional" value={form.chamar} onChange={e => setForm({ ...form, chamar: e.target.value })} />
                </div>

                <div>
                  <label className={labelClass}>Responsável / Associado (Dono da Vaga)</label>
                  <select className={inputClass} value={form.responsavelId} onChange={e => setForm({ ...form, responsavelId: e.target.value })}>
                    <option value="">— Sem responsável —</option>
                    {associados.map(p => <option key={p.id} value={p.id}>{p.nome}{p.telefone ? ` — ${p.telefone}` : ''}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Motorista (quem trabalha a vaga)</label>
                  <select className={inputClass} value={form.motoristaId} onChange={e => setForm({ ...form, motoristaId: e.target.value })}>
                    <option value="">— Sem motorista —</option>
                    {motoristasLista.map(p => <option key={p.id} value={p.id}>{p.nome}{p.telefone ? ` — ${p.telefone}` : ''}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Cavalo Mecânico</label>
                    <select className={inputClass} value={form.cavaloId} onChange={e => setForm({ ...form, cavaloId: e.target.value })}>
                      <option value="">— Sem cavalo —</option>
                      {cavalos.map(c => <option key={c.id} value={c.id}>{c.placa?.toUpperCase()} — {c.marca} {c.modelo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Carreta / Implemento</label>
                    <select className={inputClass} value={form.carretaId} onChange={e => setForm({ ...form, carretaId: e.target.value })}>
                      <option value="">— Sem carreta —</option>
                      {carretas.map(c => <option key={c.id} value={c.id}>{c.placa?.toUpperCase()} — {c.marca} {c.modelo}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vagaAtiva" checked={form.status} onChange={e => setForm({ ...form, status: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="vagaAtiva" className="text-sm text-slate-700">Vaga ativa na fila</label>
                </div>
              </div>
              <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
                <button type="button" onClick={() => setModoEditar(false)} className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            /* ── MODO VISUALIZAÇÃO ── */
            <div className="px-8 py-6">
              {!dados ? (
                <p className="text-slate-400 text-sm py-4 text-center">Esta vaga ainda não possui associações. Clique em Editar para configurar.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Responsável */}
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Responsável / Dono</p>
                    {dados.responsavelNome ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-900">{dados.responsavelNome}</p>
                        <p className="text-sm text-slate-500 font-mono">{dados.responsavelCpf || 'CPF não informado'}</p>
                        <p className="text-sm text-slate-600">{dados.responsavelTelefone || 'Telefone não informado'}</p>
                      </div>
                    ) : <p className="text-slate-400 text-sm italic">Não associado</p>}
                  </div>

                  {/* Motorista */}
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Motorista</p>
                    {dados.motoristaNome ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-900">{dados.motoristaNome}</p>
                        <p className="text-sm text-slate-500 font-mono">{dados.motoristaCpf || 'CPF não informado'}</p>
                        <p className="text-sm text-slate-600">{dados.motoristaTelefone || 'Telefone não informado'}</p>
                      </div>
                    ) : <p className="text-slate-400 text-sm italic">Não associado</p>}
                  </div>

                  {/* Cavalo */}
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cavalo Mecânico</p>
                    {dados.cavaloPlaca ? (
                      <div className="space-y-2">
                        <p className="font-bold text-slate-900 font-mono tracking-widest text-lg">{dados.cavaloPlaca?.toUpperCase()}</p>
                        <p className="text-sm text-slate-600">{dados.cavaloMarca} {dados.cavaloModelo}</p>
                      </div>
                    ) : <p className="text-slate-400 text-sm italic">Não associado</p>}
                  </div>

                  {/* Carreta */}
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Carreta / Implemento</p>
                    {dados.carretaPlaca ? (
                      <div className="space-y-2">
                        <p className="font-bold text-slate-900 font-mono tracking-widest text-lg">{dados.carretaPlaca?.toUpperCase()}</p>
                        <p className="text-sm text-slate-600">{dados.carretaMarca} {dados.carretaModelo}</p>
                      </div>
                    ) : <p className="text-slate-400 text-sm italic">Não associado</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página Principal — Lista de Chapeiras
// ──────────────────────────────────────────────

export default function Chapeiras() {
  const { chapeiras, loading, fetchChapeiras } = useChapeiraStore();
  const [modalVaga, setModalVaga] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('TODAS');

  const TOTAL_VAGAS = 400;

  useEffect(() => { 
    fetchChapeiras(); 
  }, [fetchChapeiras]);

  // Montar lista completa de 1 a 400, mesclando com os registros do banco
  const chapeirasMap = Object.fromEntries(chapeiras.map(c => [c.vaga, c]));

  const listaFiltrada = Array.from({ length: TOTAL_VAGAS }, (_, i) => i + 1)
    .map(vaga => chapeirasMap[vaga] || { vaga, id: null })
    .filter(c => {
      if (filtro === 'OCUPADAS') return c.responsavelNome || c.motoristaNome;
      if (filtro === 'LIVRES') return !c.responsavelNome && !c.motoristaNome;
      if (filtro === 'INATIVAS') return c.status === false;
      return true;
    })
    .filter(c => {
      if (!busca) return true;
      const s = busca.toLowerCase();
      return (
        c.vaga.toString().includes(s) ||
        c.responsavelNome?.toLowerCase().includes(s) ||
        c.motoristaNome?.toLowerCase().includes(s) ||
        c.cavaloPlaca?.toLowerCase().includes(s) ||
        c.carretaPlaca?.toLowerCase().includes(s)
      );
    });

  const totalOcupadas = chapeiras.filter(c => c.responsavelNome || c.motoristaNome).length;
  const totalInativas = chapeiras.filter(c => c.status === false).length;
  const totalLivres = TOTAL_VAGAS - totalOcupadas - totalInativas;

  const getStatusBadge = (c) => {
    if (!c.id) return 'bg-slate-100 text-slate-500';
    if (c.status === false) return 'bg-red-100 text-red-700';
    if (c.responsavelNome || c.motoristaNome) return 'bg-emerald-100 text-emerald-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusLabel = (c) => {
    if (!c.id) return 'Livre';
    if (c.status === false) return 'Inativa';
    if (c.responsavelNome || c.motoristaNome) return 'Ocupada';
    return 'Cadastrada';
  };

  return (
    <div className="space-y-5">
      {/* Cards de estatística */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total de Vagas</p>
          <p className="text-3xl font-bold text-slate-900">{TOTAL_VAGAS}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Ocupadas</p>
          <p className="text-3xl font-bold text-emerald-600">{totalOcupadas}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Livres</p>
          <p className="text-3xl font-bold text-blue-600">{totalLivres}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Inativas</p>
          <p className="text-3xl font-bold text-red-600">{totalInativas}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Lista de Chapeiras</h2>
            <p className="text-sm text-slate-500 mt-0.5">Clique em uma linha para ver os detalhes completos e editar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar vaga, nome, placa..." className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
            {['TODAS', 'OCUPADAS', 'LIVRES', 'INATIVAS'].map(f => (
              <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${filtro === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Vaga</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsável</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tel. Responsável</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Motorista</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tel. Motorista</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cavalo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Carreta</th>
                <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-400">Carregando chapeiras...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-400">Nenhuma chapeira encontrada para o filtro selecionado.</td></tr>
              ) : listaFiltrada.map(c => (
                <tr key={c.vaga} onClick={() => setModalVaga(c.vaga)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                  <td className="px-4 py-3 text-sm font-bold font-mono text-blue-600 group-hover:text-blue-800">
                    {c.vaga.toString().padStart(3, '0')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                    {c.responsavelNome || <span className="text-slate-300 italic text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                    {c.responsavelTelefone || <span className="text-slate-300 italic text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {c.motoristaNome || <span className="text-slate-300 italic text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                    {c.motoristaTelefone || <span className="text-slate-300 italic text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono font-semibold tracking-wider">
                    {c.cavaloPlaca?.toUpperCase() || <span className="text-slate-300 italic font-normal text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono font-semibold tracking-wider">
                    {c.carretaPlaca?.toUpperCase() || <span className="text-slate-300 italic font-normal text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(c)}`}>
                      {getStatusLabel(c)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-right">
          Exibindo {listaFiltrada.length} de {TOTAL_VAGAS} vagas
        </p>
      </div>

      <ModalChapeira
        isOpen={!!modalVaga}
        onClose={() => setModalVaga(null)}
        onSucesso={() => fetchChapeiras(true)}
        vaga={modalVaga}
      />
    </div>
  );
}
