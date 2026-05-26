import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { DollarSign, AlertTriangle, CheckCircle, Clock, Ban, RotateCcw, Layers, RefreshCw } from 'lucide-react';
import { useFinanceiroStore } from '../store/useFinanceiroStore';
import { useChapeiraStore } from '../store/useChapeiraStore';
import ModalConfirmacao from '../components/ModalConfirmacao';

export default function Financeiro() {
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [valorPadrao, setValorPadrao] = useState(150.00);

  // Zustand Stores
  const { chapeiras, fetchChapeiras } = useChapeiraStore();
  const { mensalidadesPorMes, fetchMensalidades, updateMensalidadeNoCache } = useFinanceiroStore();
  
  // Local Loading States
  const [loadingRow, setLoadingRow] = useState(null);
  const [gerandoLote, setGerandoLote] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Multi-selection states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);

  // Modal Configuration
  const [modal, setModal] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'aviso',
    loading: false,
    onConfirm: () => {}
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const carregarDados = async (force = false) => {
    setIsRefreshing(true);
    await Promise.all([
      fetchChapeiras(force),
      fetchMensalidades(mesAtual, force)
    ]);
    setIsRefreshing(false);
    setSelectedIds(new Set());
    setLastSelectedId(null);
  };

  useEffect(() => {
    carregarDados();
  }, [mesAtual]);

  // ── PREPARAÇÃO DE DADOS ──

  const mensalidades = mensalidadesPorMes[mesAtual] || [];
  
  const lista = useMemo(() => {
    const TOTAL_VAGAS = 400;
    const chapeirasMap = Object.fromEntries(chapeiras.map(c => [c.vaga, c]));
    const mensalidadesMap = Object.fromEntries(mensalidades.map(m => [m.vaga, m]));

    return Array.from({ length: TOTAL_VAGAS }, (_, i) => i + 1)
      .map(vaga => {
        const c = chapeirasMap[vaga] || { vaga, id: null, inadimplente: false };
        const m = mensalidadesMap[vaga] || null;
        return { ...c, mensalidade: m };
      })
      .filter(item => item.id); // Mostrar apenas vagas cadastradas no sistema
  }, [chapeiras, mensalidades]);

  // Válidos para seleção são os que já tem mensalidade gerada
  const validIds = useMemo(() => lista.filter(item => item.mensalidade).map(item => item.mensalidade.id), [lista]);

  const totalArrecadado = mensalidades.filter(m => m.statusPagamento === 'PAGO').reduce((acc, m) => acc + m.valor, 0);
  const totalPendente = mensalidades.filter(m => m.statusPagamento === 'PENDENTE').reduce((acc, m) => acc + m.valor, 0);
  const qtdInadimplentes = lista.filter(c => c.inadimplente).length;

  // ── SELEÇÃO E EVENTOS DE CHECKBOX ──

  const handleSelectAll = () => {
    if (selectedIds.size === validIds.length && validIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validIds));
    }
  };

  const handleSelect = (e, id) => {
    const newSet = new Set(selectedIds);
    if (e.shiftKey && lastSelectedId !== null) {
      // Range selection
      const start = validIds.indexOf(lastSelectedId);
      const end = validIds.indexOf(id);
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      
      for (let i = min; i <= max; i++) {
        newSet.add(validIds[i]);
      }
    } else {
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setLastSelectedId(id);
    }
    setSelectedIds(newSet);
  };

  // ── AÇÕES ──

  const handleGerarLote = async () => {
    setModal({
      isOpen: true,
      titulo: 'Gerar Mensalidades em Lote',
      mensagem: `Isso irá gerar a mensalidade de R$ ${valorPadrao.toFixed(2)} para TODAS as vagas ocupadas no mês ${mesAtual}. Tem certeza?`,
      tipo: 'aviso',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        setGerandoLote(true);
        try {
          await api.post('/mensalidades/lote', {
            vaga: 0, 
            mesReferencia: mesAtual,
            valor: valorPadrao,
            dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
          });
          toast.success(`Mensalidades do mês ${mesAtual} geradas!`);
          await carregarDados(true);
          closeModal();
        } catch (e) {
          toast.error('Erro ao gerar mensalidades em lote.');
          setModal(prev => ({ ...prev, loading: false }));
        } finally {
          setGerandoLote(false);
        }
      }
    });
  };

  const handleGerarParaVaga = async (vaga) => {
    setLoadingRow(`gerar-${vaga}`);
    try {
      const res = await api.post('/mensalidades', {
        vaga,
        mesReferencia: mesAtual,
        valor: valorPadrao,
        dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
      });
      updateMensalidadeNoCache(mesAtual, res.data);
      toast.success(`Mensalidade gerada para vaga ${vaga}`);
    } catch (e) {
      toast.error('Erro ao gerar mensalidade. (Já existe?)');
    } finally {
      setLoadingRow(null);
    }
  };

  const handlePagar = (id) => {
    setModal({
      isOpen: true,
      titulo: 'Confirmar Recebimento',
      mensagem: 'Confirma que o pagamento desta mensalidade foi recebido?',
      tipo: 'sucesso',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await api.put(`/mensalidades/${id}/pagar`);
          updateMensalidadeNoCache(mesAtual, res.data);
          toast.success('Baixa realizada com sucesso!');
          closeModal();
        } catch {
          toast.error('Erro ao dar baixa.');
          setModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleEstornar = (id) => {
    setModal({
      isOpen: true,
      titulo: 'Estornar Pagamento',
      mensagem: 'Tem certeza que deseja estornar este pagamento? Ele voltará para o status PENDENTE.',
      tipo: 'perigo',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await api.put(`/mensalidades/${id}/estornar`);
          updateMensalidadeNoCache(mesAtual, res.data);
          toast.success('Pagamento estornado com sucesso!');
          closeModal();
        } catch {
          toast.error('Erro ao estornar.');
          setModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // ── AÇÕES EM LOTE (SELEÇÃO MÚLTIPLA) ──

  const handleLotePagar = async () => {
    setModal({
      isOpen: true,
      titulo: 'Dar Baixa em Lote',
      mensagem: `Confirma o recebimento de ${selectedIds.size} mensalidades selecionadas?`,
      tipo: 'sucesso',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await api.put('/mensalidades/lote/pagar', Array.from(selectedIds));
          res.data.forEach(m => updateMensalidadeNoCache(mesAtual, m));
          toast.success(`${res.data.length} baixas realizadas com sucesso!`);
          setSelectedIds(new Set());
          closeModal();
        } catch {
          toast.error('Erro ao processar lote.');
          setModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleLoteEstornar = async () => {
    setModal({
      isOpen: true,
      titulo: 'Estornar em Lote',
      mensagem: `Tem certeza que deseja estornar as ${selectedIds.size} mensalidades selecionadas?`,
      tipo: 'perigo',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await api.put('/mensalidades/lote/estornar', Array.from(selectedIds));
          res.data.forEach(m => updateMensalidadeNoCache(mesAtual, m));
          toast.success(`${res.data.length} estornos realizados com sucesso!`);
          setSelectedIds(new Set());
          closeModal();
        } catch {
          toast.error('Erro ao processar lote.');
          setModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleToggleInadimplente = (vaga, atual) => {
    const msg = atual 
      ? `Liberar vaga ${vaga} da inadimplência? Ela voltará a participar da fila.`
      : `Bloquear vaga ${vaga} por inadimplência? Ela NÃO participará mais da fila.`;
      
    setModal({
      isOpen: true,
      titulo: atual ? 'Liberar Vaga' : 'Bloquear Vaga',
      mensagem: msg,
      tipo: atual ? 'sucesso' : 'perigo',
      loading: false,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.put(`/chapeiras/vaga/${vaga}/inadimplencia`, { inadimplente: !atual });
          toast.success('Status de inadimplência atualizado!');
          await fetchChapeiras(true);
          closeModal();
        } catch {
          toast.error('Erro ao alterar status.');
          setModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-20">
      
      {/* Barra de Ações em Lote (Flutuante) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="font-medium text-sm text-slate-200">selecionados</span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex gap-3">
            <button 
              onClick={handleLotePagar} 
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Dar Baixa
            </button>
            <button 
              onClick={handleLoteEstornar} 
              className="bg-transparent hover:bg-slate-800 border border-slate-600 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Estornar
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white p-2 transition-colors ml-2"
              title="Limpar seleção"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro & Mensalidades</h1>
          <p className="text-slate-500">Controle de recebimentos e inadimplência das vagas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleGerarLote}
            disabled={gerandoLote}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {gerandoLote ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
            Gerar Lote do Mês
          </button>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <label className="text-sm font-medium text-slate-600">Mês/Ano:</label>
            <input 
              type="text" 
              placeholder="MM/AAAA"
              value={mesAtual}
              onChange={e => setMesAtual(e.target.value)}
              className="w-20 text-center font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-blue-500 px-1 py-1"
            />
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <label className="text-sm font-medium text-slate-600">Valor (R$):</label>
            <input 
              type="number" 
              step="0.01"
              value={valorPadrao}
              onChange={e => setValorPadrao(parseFloat(e.target.value) || 0)}
              className="w-20 text-center font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-blue-500 px-1 py-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">Total Recebido</div>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">R$ {totalArrecadado.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">A Receber / Pendente</div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-500">R$ {totalPendente.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-500">Vagas Inadimplentes (Bloqueadas)</div>
            <Ban className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">{qtdInadimplentes}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 relative">
        {isRefreshing && (
          <div className="absolute top-2 right-4 text-xs font-medium text-blue-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
          </div>
        )}

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={validIds.length > 0 && selectedIds.size === validIds.length}
                    onChange={handleSelectAll}
                    disabled={validIds.length === 0}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Vaga</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Responsável</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Mensalidade</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Ações Pagamento</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Inadimplência</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {lista.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Nenhuma vaga cadastrada.</td></tr>
              ) : lista.map(item => {
                const isSelected = item.mensalidade ? selectedIds.has(item.mensalidade.id) : false;
                
                return (
                  <tr 
                    key={item.vaga} 
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/70' : item.inadimplente ? 'bg-red-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      {item.mensalidade && (
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => handleSelect(e.nativeEvent, item.mensalidade.id)}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                      {item.vaga.toString().padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {item.responsavelNome || <span className="text-slate-400 italic">Sem responsável</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!item.mensalidade ? (
                        <span className="text-xs text-slate-400 italic">Não gerada</span>
                      ) : item.mensalidade.statusPagamento === 'PAGO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                          <Clock className="w-3 h-3" /> Pendente (R$ {item.mensalidade.valor})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!item.mensalidade ? (
                        <button 
                          onClick={() => handleGerarParaVaga(item.vaga)} 
                          disabled={loadingRow === `gerar-${item.vaga}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {loadingRow === `gerar-${item.vaga}` ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Gerar Avulso'}
                        </button>
                      ) : item.mensalidade.statusPagamento === 'PENDENTE' ? (
                        <button 
                          onClick={() => handlePagar(item.mensalidade.id)}
                          className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          Dar Baixa
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                            {item.mensalidade.dataPagamento}
                          </span>
                          <button 
                            onClick={() => handleEstornar(item.mensalidade.id)}
                            title="Estornar / Desfazer Baixa"
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleInadimplente(item.vaga, item.inadimplente)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                          item.inadimplente 
                            ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-red-600'
                        }`}
                      >
                        {item.inadimplente ? (
                          <><Ban className="w-3.5 h-3.5" /> INADIMPLENTE</>
                        ) : (
                          <><AlertTriangle className="w-3.5 h-3.5" /> Bloquear</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalConfirmacao 
        {...modal} 
        onClose={closeModal} 
      />
    </div>
  );
}
