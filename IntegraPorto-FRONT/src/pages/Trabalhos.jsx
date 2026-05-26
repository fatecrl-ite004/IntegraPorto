import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { getStatusBadge } from './FolhaTrabalho';

function ModalNovoTrabalho({ isOpen, onClose, onSucesso }) {
  const [formData, setFormData] = useState({
    tipoOperacao: '',
    tipoTrabalho: 'MUNICIPAL',
    valorFrete: '',
    transportadora: '',
    qtdeContainers: 1,
    tamanhoContainer: '40',
    armador: '',
    navio: '',
    booking: '',
    origem: '',
    destino: '',
    dtSolicitacao: '',
    dtExecucao: ''
  });
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        dtSolicitacao: formData.dtSolicitacao ? new Date(formData.dtSolicitacao).toISOString() : null,
        dtExecucao: formData.dtExecucao ? new Date(formData.dtExecucao).toISOString() : null
      };

      await api.post('/trabalhos', payload);
      toast.success('Trabalho registrado com sucesso! Chapeiras alocadas.');
      onSucesso();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar trabalho. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative inline-block w-full max-w-4xl text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-4">Registrar Operação / Trabalho</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Operação</label>
                  <select required className={inputClass} value={formData.tipoOperacao} onChange={e => setFormData({...formData, tipoOperacao: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="EMBARQUE - DEVOLUÇÃO NAVIO">EMBARQUE - DEVOLUÇÃO NAVIO</option>
                    <option value="DESCARGA - RETIRADA NAVIO">DESCARGA - RETIRADA NAVIO</option>
                    <option value="REMOÇÃO - OFF HIRE">REMOÇÃO - OFF HIRE</option>
                    <option value="ISOTANQUE-COM CAPACITAÇÃO">ISOTANQUE-COM CAPACITAÇÃO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Fila</label>
                  <select className={`${inputClass} bg-slate-50`} value={formData.tipoTrabalho} onChange={e => setFormData({...formData, tipoTrabalho: e.target.value})}>
                    <option value="MUNICIPAL">Municipal (1 a 400)</option>
                    <option value="INTERMUNICIPAL">Intermunicipal (400 a 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Frete (R$)</label>
                  <input type="number" step="0.01" required className={inputClass} value={formData.valorFrete} onChange={e => setFormData({...formData, valorFrete: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transportadora</label>
                  <select required className={inputClass} value={formData.transportadora} onChange={e => setFormData({...formData, transportadora: e.target.value})}>
                    <option value="">Selecione...</option>
                    {transportadoras.map(t => (
                      <option key={t.id} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qtd de Containers</label>
                  <input type="number" min="1" required className={`${inputClass} bg-blue-50 font-bold`} value={formData.qtdeContainers} onChange={e => setFormData({...formData, qtdeContainers: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho (Pés)</label>
                  <select required className={`${inputClass} bg-blue-50 font-bold`} value={formData.tamanhoContainer} onChange={e => setFormData({...formData, tamanhoContainer: e.target.value})}>
                    <option value="40">40 Pés</option>
                    <option value="20">20 Pés</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Solicitação</label>
                    <input type="datetime-local" className={`${inputClass} text-slate-600`} value={formData.dtSolicitacao} onChange={e => setFormData({...formData, dtSolicitacao: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Execução Prevista</label>
                    <input type="datetime-local" className={`${inputClass} text-slate-600`} value={formData.dtExecucao} onChange={e => setFormData({...formData, dtExecucao: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Armador</label>
                  <select className={inputClass} value={formData.armador} onChange={e => setFormData({...formData, armador: e.target.value})}>
                    <option value="">Selecione...</option>
                    {armadores.map(a => (
                      <option key={a.id} value={a.nome}>{a.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Navio / Booking</label>
                  <input type="text" placeholder="Ex: MSC / BK12345" className={inputClass} value={formData.navio} onChange={e => setFormData({...formData, navio: e.target.value})} />
                </div>

                <div className="col-span-1 md:col-span-3 grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Local de Coleta (Origem)</label>
                    <select required className={inputClass} value={formData.origem} onChange={e => setFormData({...formData, origem: e.target.value})}>
                      <option value="">Selecione um Terminal...</option>
                      {terminais.map(t => (
                        <option key={t.id} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destino (Desembarque)</label>
                    <select required className={inputClass} value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})}>
                      <option value="">Selecione um Terminal...</option>
                      {terminais.map(t => (
                        <option key={t.id} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-100 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Processando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Trabalhos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [trabalhos, setTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarTrabalhos = async () => {
    try {
      const res = await api.get('/trabalhos');
      setTrabalhos(res.data);
    } catch (err) {
      toast.error('Erro ao carregar os trabalhos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTrabalhos();
  }, []);

  const trabalhosAtivos = trabalhos.filter(t => t.status === 'EM_ANDAMENTO' || t.status === 'PENDENTE');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Trabalhos em Andamento</h2>
          <p className="text-sm text-slate-500 mt-1">Operações ativas e pendentes de execução.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/trabalhos/historico')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            📊 Histórico e Dashboard
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Registrar Novo Trabalho
          </button>
        </div>
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
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Carregando...</td></tr>
            ) : trabalhosAtivos.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Nenhum trabalho em andamento ou pendente.</td></tr>
            ) : (
              trabalhosAtivos.map(t => (
                <tr key={t.id} onClick={() => navigate(`/trabalhos/${t.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 group-hover:text-blue-800">#{t.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.tipoOperacao} <br/><span className="text-xs text-slate-400">{t.qtdeContainers} containers</span></td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.origem} <br/> <span className="text-xs text-slate-400">para {t.destino}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono bg-slate-50">
                    {t.chapeiraInicio} à {t.chapeiraFim}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${getStatusBadge(t.status)}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalNovoTrabalho 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSucesso={carregarTrabalhos} 
      />
    </div>
  );
}
