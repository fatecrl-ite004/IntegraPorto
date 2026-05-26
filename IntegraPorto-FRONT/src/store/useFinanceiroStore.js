import { create } from 'zustand';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

export const useFinanceiroStore = create((set, get) => ({
  mensalidadesPorMes: {}, // cache por "MM/AAAA"
  loading: false,

  fetchMensalidades: async (mesReferencia, force = false) => {
    const { mensalidadesPorMes } = get();
    
    // Se não está forçando e já temos os dados no cache para esse mês
    if (!force && mensalidadesPorMes[mesReferencia]) {
      return; 
    }

    set({ loading: true });
    try {
      const res = await api.get(`/mensalidades/mes/${mesReferencia.replace('/', '-')}`);
      set((state) => ({
        mensalidadesPorMes: {
          ...state.mensalidadesPorMes,
          [mesReferencia]: res.data
        },
        loading: false
      }));
    } catch {
      toast.error('Erro ao carregar mensalidades.');
      set({ loading: false });
    }
  },

  updateMensalidadeNoCache: (mesReferencia, mensalidadeAtualizada) => {
    set((state) => {
      const listaAtual = state.mensalidadesPorMes[mesReferencia] || [];
      const index = listaAtual.findIndex(m => m.id === mensalidadeAtualizada.id);
      
      let novaLista = [...listaAtual];
      if (index !== -1) {
        novaLista[index] = mensalidadeAtualizada;
      } else {
        novaLista.push(mensalidadeAtualizada);
      }

      return {
        mensalidadesPorMes: {
          ...state.mensalidadesPorMes,
          [mesReferencia]: novaLista
        }
      };
    });
  }
}));
