import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Truck, Calendar, MapPin, Box, Anchor, CheckCircle, XCircle, Clock, PlayCircle, Pencil, Scissors } from 'lucide-react';

export const getStatusBadge = (status) => {
  switch(status) {
    case 'EM_ANDAMENTO': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'CONCLUIDO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-200';
    case 'PARCIALMENTE_CONCLUIDO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PENDENTE': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-slate-100 text-slate-600';
  }
};

function ModalEditarTrabalho({ isOpen, onClose, onSucesso, trabalho }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [armadores, setArmadores] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);
  const [terminais, setTerminais] = useState([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/armadores'),
        api.get('/transportadoras'),
        api.get('/terminais')
      ]).then(([resA, resT, resTerm]) => {
        setArmadores(resA.data);
        setTransportadoras(resT.data);
        setTerminais(resTerm.data);
      }).catch(() => {
        toast.error('Erro ao carregar dados base para o formulário.');
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (trabalho) {
      setForm({
        tipoOperacao: trabalho.tipoOperacao || '',
        tipoTrabalho: trabalho.tipoTrabalho || 'MUNICIPAL',
        valorFrete: trabalho.valorFrete || '',
        transportadora: trabalho.transportadora || '',
        qtdeContainers: trabalho.qtdeContainers || 1,
        tamanhoContainer: trabalho.tamanhoContainer || '40',
        armador: trabalho.armador || '',
        navio: trabalho.navio || '',
        booking: trabalho.booking || '',
        origem: trabalho.origem || '',
        destino: trabalho.destino || '',
        dtExecucao: trabalho.dtExecucao ? new Date(trabalho.dtExecucao).toISOString().slice(0, 16) : '',
        dtTermino: trabalho.dtTermino ? new Date(trabalho.dtTermino).toISOString().slice(0, 16) : '',
      });
    }
  }, [trabalho, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        dtExecucao: form.dtExecucao ? new Date(form.dtExecucao).toISOString() : null,
        dtTermino: form.dtTermino ? new Date(form.dtTermino).toISOString() : null,
      };
      await api.put(`/trabalhos/${trabalho.id}`, payload);
      toast.success('Trabalho atualizado!');
      onSucesso();
      onClose();
    } catch {
      toast.error('Erro ao atualizar trabalho.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key] ?? '', onChange: e => setForm({ ...form, [key]: e.target.value }) });
  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-4xl text-left bg-white rounded-xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-5 border-b pb-4">Editar Folha de Trabalho #{trabalho?.id}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Tipo de Operação *</label>
                  <select required className={inputClass} {...f('tipoOperacao')}>
                    <option value="">Selecione...</option>
                    <option value="EMBARQUE - DEVOLUÇÃO NAVIO">EMBARQUE - DEVOLUÇÃO NAVIO</option>
                    <option value="DESCARGA - RETIRADA NAVIO">DESCARGA - RETIRADA NAVIO</option>
                    <option value="REMOÇÃO - OFF HIRE">REMOÇÃO - OFF HIRE</option>
                    <option value="ISOTANQUE-COM CAPACITAÇÃO">ISOTANQUE-COM CAPACITAÇÃO</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tipo de Fila</label>
                  <select className={inputClass} value={form.tipoTrabalho} onChange={e => setForm({ ...form, tipoTrabalho: e.target.value })}>
                    <option value="MUNICIPAL">Municipal (1 a 400)</option>
                    <option value="INTERMUNICIPAL">Intermunicipal (400 a 1)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Valor do Frete (R$)</label>
                  <input type="number" step="0.01" className={inputClass} {...f('valorFrete')} />
                </div>
                <div>
                  <label className={labelClass}>Transportadora</label>
                  <select className={inputClass} value={form.transportadora} onChange={e => setForm({ ...form, transportadora: e.target.value })}>
                    <option value="">Selecione...</option>
                    {transportadoras.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Qtd de Containers</label>
                  <input type="number" min="1" className={`${inputClass} bg-blue-50 font-bold`} {...f('qtdeContainers')} />
                </div>
                <div>
                  <label className={labelClass}>Tamanho (Pés)</label>
                  <select className={`${inputClass} bg-blue-50 font-bold`} value={form.tamanhoContainer} onChange={e => setForm({ ...form, tamanhoContainer: e.target.value })}>
                    <option value="40">40 Pés</option>
                    <option value="20">20 Pés</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Armador</label>
                  <select className={inputClass} value={form.armador} onChange={e => setForm({ ...form, armador: e.target.value })}>
                    <option value="">Selecione...</option>
                    {armadores.map(a => <option key={a.id} value={a.nome}>{a.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Navio / Booking</label>
                  <input className={inputClass} {...f('navio')} />
                </div>
                <div>
                  <label className={labelClass}>Data de Execução</label>
                  <input type="datetime-local" className={inputClass} {...f('dtExecucao')} />
                </div>
                <div>
                  <label className={labelClass}>Local de Coleta (Origem)</label>
                  <select className={inputClass} value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })}>
                    <option value="">Selecione...</option>
                    {terminais.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Destino (Desembarque)</label>
                  <select className={inputClass} value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value })}>
                    <option value="">Selecione...</option>
                    {terminais.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Data de Término</label>
                  <input type="datetime-local" className={inputClass} {...f('dtTermino')} />
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function FolhaTrabalho() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trabalho, setTrabalho] = useState(null);
  const [motoristasList, setMotoristasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const carregarDetalhes = async () => {
    try {
      const [resTrabalho, resMotoristas] = await Promise.all([
        api.get(`/trabalhos/${id}`),
        api.get(`/trabalhos/${id}/motoristas`)
      ]);
      setTrabalho(resTrabalho.data);
      setMotoristasList(resMotoristas.data);
    } catch {
      toast.error('Erro ao buscar detalhes da folha de trabalho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDetalhes(); }, [id]);

  const handleStatusChange = async (novoStatus) => {
    try {
      await api.put(`/trabalhos/${id}/status`, { status: novoStatus });
      setTrabalho(prev => ({ ...prev, status: novoStatus }));
      toast.success(`Status atualizado para ${novoStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const handleCorteParcial = (vagaCorte) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-800 font-medium">
          Deseja concluir o trabalho até a vaga anterior e cancelar da vaga <strong className="text-red-600">{vagaCorte}</strong> em diante?
        </p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200"
          >
            Não, cancelar
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.post(`/trabalhos/${id}/cancelar?vagaCancelamento=${vagaCorte}`);
                toast.success('Corte parcial realizado com sucesso! Motoristas foram para a fila de retorno.');
                carregarDetalhes();
              } catch {
                toast.error('Erro ao realizar o corte parcial.');
              }
            }} 
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
          >
            Sim, realizar corte
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando folha de trabalho...</div>;
  if (!trabalho) return <div className="p-8 text-center text-red-500">Folha de trabalho não encontrada.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/trabalhos')} className="flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a Fila
          </button>
          <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm">
            <Pencil className="w-4 h-4" /> Editar Trabalho
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-6 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Folha de Trabalho #{trabalho.id}</h1>
            <p className="text-slate-500">
              Fila: <span className="font-semibold text-slate-700">{trabalho.tipoTrabalho}</span> | Operação: {trabalho.tipoOperacao}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusBadge(trabalho.status)}`}>
              {trabalho.status.replace('_', ' ')}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleStatusChange('EM_ANDAMENTO')} title="Em Andamento" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"><PlayCircle className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange('PENDENTE')} title="Pendente" className="p-2 bg-orange-100 hover:bg-orange-200 rounded-md text-orange-600 transition-colors"><Clock className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange('CONCLUIDO')} title="Concluído" className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-md text-emerald-600 transition-colors"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange('CANCELADO')} title="Cancelar" className="p-2 bg-red-100 hover:bg-red-200 rounded-md text-red-600 transition-colors"><XCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Origem e Destino
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-500">Local de Coleta (Origem)</p>
                <p className="font-medium text-slate-900">{trabalho.origem || 'Não informado'}</p>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-500">Desembarque (Destino)</p>
                <p className="font-medium text-slate-900">{trabalho.destino || 'Não informado'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Valor Acordado do Frete</p>
                <p className="font-medium text-emerald-600 text-lg">R$ {trabalho.valorFrete?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Truck className="w-4 h-4 mr-2" /> Carga e Marítimo
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-500">Transportadora</p>
                <p className="font-medium text-slate-900">{trabalho.transportadora || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <p className="text-xs text-slate-500">Armador / Navio / Booking</p>
                <p className="font-medium text-slate-900 text-right">
                  {trabalho.armador || 'N/A'} <br />
                  <span className="text-xs font-mono bg-white border border-slate-200 px-1 rounded">{trabalho.navio || '-'} / {trabalho.booking || '-'}</span>
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Qtd. / Tamanho</p>
                <p className="font-bold text-slate-900 text-lg">
                  {trabalho.qtdeContainers} <span className="text-sm font-medium text-slate-500">x {trabalho.tamanhoContainer || '40'}'</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Cronograma de Operação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-md border border-slate-100 shadow-sm text-center">
                <p className="text-xs text-slate-500 mb-1">Data de Solicitação</p>
                <p className="font-medium text-slate-900">
                  {trabalho.dtSolicitacao ? new Date(trabalho.dtSolicitacao).toLocaleString('pt-BR') : 'Não registrada'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-slate-100 shadow-sm text-center">
                <p className="text-xs text-slate-500 mb-1">Execução Prevista</p>
                <p className="font-medium text-blue-600">
                  {trabalho.dtExecucao ? new Date(trabalho.dtExecucao).toLocaleString('pt-BR') : 'Não agendada'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-slate-100 shadow-sm text-center">
                <p className="text-xs text-slate-500 mb-1">Data de Término</p>
                <p className="font-medium text-emerald-600">
                  {trabalho.dtTermino ? new Date(trabalho.dtTermino).toLocaleString('pt-BR') : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-slate-400" /> Motoristas Alocados
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Vaga</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Motorista Responsável</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Veículo (Placa)</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Status Fila</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {motoristasList.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Nenhuma chapeira alocada.</td></tr>
              ) : (
                motoristasList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">
                      {m.chapeira?.toString().padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{m.motorista}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{m.veiculo}</td>
                    <td className="px-6 py-4 text-sm text-right flex items-center justify-end gap-2">
                      <span className="px-2 py-1 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded uppercase tracking-wider border border-slate-200">
                        {m.statusChamada?.replace('_', ' ')}
                      </span>
                      {trabalho?.status !== 'CANCELADO' && trabalho?.status !== 'CONCLUIDO' && trabalho?.status !== 'PARCIALMENTE_CONCLUIDO' && (
                        <button 
                          onClick={() => handleCorteParcial(m.chapeira)}
                          title="Cortar trabalho a partir desta vaga"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Scissors className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalEditarTrabalho
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSucesso={carregarDetalhes}
        trabalho={trabalho}
      />
    </div>
  );
}
