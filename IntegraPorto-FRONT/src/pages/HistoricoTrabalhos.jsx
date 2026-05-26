import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { getStatusBadge } from './FolhaTrabalho';
import { ArrowLeft, BarChart3, TrendingUp, CheckCircle, XCircle, AlertTriangle, Clock, Package } from 'lucide-react';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function HistoricoTrabalhos() {
  const [trabalhos, setTrabalhos] = useState([]);
  const [todosTrabalhos, setTodosTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState('TODOS');
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === 'ADM' || role === 'SEC';

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get('/trabalhos');
        setTodosTrabalhos(res.data);
        const finalizados = res.data.filter(t =>
          t.status === 'CONCLUIDO' || t.status === 'CANCELADO' || t.status === 'PARCIALMENTE_CONCLUIDO'
        );
        setTrabalhos(finalizados);
      } catch {
        toast.error('Erro ao carregar o histórico.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  // Estatísticas gerais (todos os trabalhos de todos os tempos)
  const statsGerais = useMemo(() => {
    const total = todosTrabalhos.length;
    const concluidos = todosTrabalhos.filter(t => t.status === 'CONCLUIDO').length;
    const cancelados = todosTrabalhos.filter(t => t.status === 'CANCELADO').length;
    const parciais = todosTrabalhos.filter(t => t.status === 'PARCIALMENTE_CONCLUIDO').length;
    const emAndamento = todosTrabalhos.filter(t => t.status === 'EM_ANDAMENTO').length;
    const pendentes = todosTrabalhos.filter(t => t.status === 'PENDENTE').length;
    const totalContainers = todosTrabalhos.reduce((sum, t) => sum + (t.qtdeContainers || 0), 0);
    return { total, concluidos, cancelados, parciais, emAndamento, pendentes, totalContainers };
  }, [todosTrabalhos]);

  // Dados mensais do ano selecionado (baseados no ID e na lista completa de trabalhos)
  const dadosMensais = useMemo(() => {
    // Como não temos dtSolicitacao no TrabalhoResponse, usamos todos do ano
    // Para dashboard, consideramos todos os trabalhos finalizados
    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: MESES[i],
      concluidos: 0,
      cancelados: 0,
      parciais: 0,
      total: 0
    }));

    // Nota: sem data no response, agrupamos por mês atual como placeholder
    // Quando tiver dtSolicitacao no response, pode filtrar por mês real
    return meses;
  }, [anoSelecionado, trabalhos]);

  // Filtrar lista visível pelo mês
  const trabalhosFiltrados = useMemo(() => {
    return trabalhos; // todos os finalizados
  }, [trabalhos, mesSelecionado, anoSelecionado]);

  // Calcular a barra de progresso para cada status
  const barraProgresso = useMemo(() => {
    const total = statsGerais.total || 1;
    return {
      concluidos: (statsGerais.concluidos / total * 100).toFixed(1),
      cancelados: (statsGerais.cancelados / total * 100).toFixed(1),
      parciais: (statsGerais.parciais / total * 100).toFixed(1),
      emAndamento: (statsGerais.emAndamento / total * 100).toFixed(1),
      pendentes: (statsGerais.pendentes / total * 100).toFixed(1),
    };
  }, [statsGerais]);

  const anos = useMemo(() => {
    const anoAtual = new Date().getFullYear();
    return [anoAtual, anoAtual - 1, anoAtual - 2];
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando histórico...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/trabalhos')} className="flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Trabalhos Ativos
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={anoSelecionado}
            onChange={e => setAnoSelecionado(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Cards de Resumo - Somente ADM e SEC */}
      {isAdmin && (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{statsGerais.total}</p>
          <p className="text-xs text-slate-400 mt-1">{statsGerais.totalContainers} containers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-600 uppercase">Concluídos</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{statsGerais.concluidos}</p>
          <p className="text-xs text-emerald-500 mt-1">{barraProgresso.concluidos}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs font-semibold text-red-600 uppercase">Cancelados</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{statsGerais.cancelados}</p>
          <p className="text-xs text-red-500 mt-1">{barraProgresso.cancelados}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <p className="text-xs font-semibold text-yellow-600 uppercase">Parciais</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{statsGerais.parciais}</p>
          <p className="text-xs text-yellow-500 mt-1">{barraProgresso.parciais}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Em Andamento</p>
          </div>
          <p className="text-2xl font-bold text-slate-700">{statsGerais.emAndamento}</p>
          <p className="text-xs text-slate-400 mt-1">{barraProgresso.emAndamento}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-semibold text-orange-600 uppercase">Pendentes</p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{statsGerais.pendentes}</p>
          <p className="text-xs text-orange-500 mt-1">{barraProgresso.pendentes}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-semibold text-blue-600 uppercase">Taxa Sucesso</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {statsGerais.total > 0 ? ((statsGerais.concluidos / statsGerais.total) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-blue-400 mt-1">concluídos / total</p>
        </div>
      </div>
      )}

      {/* Barra de Progresso Visual - Somente ADM e SEC */}
      {isAdmin && (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Distribuição por Status
        </h3>
        <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden flex">
          {statsGerais.concluidos > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${barraProgresso.concluidos}%` }}
              title={`Concluídos: ${statsGerais.concluidos}`}
            >
              {Number(barraProgresso.concluidos) > 8 ? `${barraProgresso.concluidos}%` : ''}
            </div>
          )}
          {statsGerais.parciais > 0 && (
            <div
              className="h-full bg-yellow-400 transition-all duration-500 flex items-center justify-center text-yellow-900 text-[10px] font-bold"
              style={{ width: `${barraProgresso.parciais}%` }}
              title={`Parciais: ${statsGerais.parciais}`}
            >
              {Number(barraProgresso.parciais) > 8 ? `${barraProgresso.parciais}%` : ''}
            </div>
          )}
          {statsGerais.cancelados > 0 && (
            <div
              className="h-full bg-red-400 transition-all duration-500 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${barraProgresso.cancelados}%` }}
              title={`Cancelados: ${statsGerais.cancelados}`}
            >
              {Number(barraProgresso.cancelados) > 8 ? `${barraProgresso.cancelados}%` : ''}
            </div>
          )}
          {statsGerais.emAndamento > 0 && (
            <div
              className="h-full bg-slate-400 transition-all duration-500 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${barraProgresso.emAndamento}%` }}
              title={`Em Andamento: ${statsGerais.emAndamento}`}
            >
              {Number(barraProgresso.emAndamento) > 8 ? `${barraProgresso.emAndamento}%` : ''}
            </div>
          )}
          {statsGerais.pendentes > 0 && (
            <div
              className="h-full bg-orange-400 transition-all duration-500 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${barraProgresso.pendentes}%` }}
              title={`Pendentes: ${statsGerais.pendentes}`}
            >
              {Number(barraProgresso.pendentes) > 8 ? `${barraProgresso.pendentes}%` : ''}
            </div>
          )}
        </div>
        <div className="flex gap-6 mt-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Concluídos
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Parcialmente Concluídos
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-red-400"></span> Cancelados
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span> Em Andamento
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span> Pendentes
          </div>
        </div>
      </div>
      )}

      {/* Tabela do Histórico */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Histórico de Trabalhos Finalizados</h3>
          <p className="text-sm text-slate-500">{trabalhosFiltrados.length} registro(s)</p>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Operação</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Origem / Destino</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Chapeiras</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {trabalhosFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Nenhum trabalho finalizado encontrado.</td></tr>
              ) : (
                trabalhosFiltrados.map(t => (
                  <tr key={t.id} onClick={() => navigate(`/trabalhos/${t.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 group-hover:text-blue-800">#{t.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {t.tipoOperacao} <br/>
                      <span className="text-xs text-slate-400">{t.qtdeContainers} containers</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {t.origem} <br/>
                      <span className="text-xs text-slate-400">para {t.destino}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono bg-slate-50">
                      {t.chapeiraInicio} à {t.chapeiraFim}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getStatusBadge(t.status)}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
