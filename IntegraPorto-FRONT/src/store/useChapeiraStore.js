import { create } from 'zustand';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

export const useChapeiraStore = create((set, get) => ({
  chapeiras: [],
  loading: false,
  lastFetched: null,

  fetchChapeiras: async (force = false) => {
    const { lastFetched, chapeiras } = get();
    // Cache de 5 minutos, ou forçar atualização
    const cincoMinutos = 5 * 60 * 1000;
    
    if (!force && lastFetched && (Date.now() - lastFetched < cincoMinutos) && chapeiras.length > 0) {
      return; // Usa o cache
    }

    set({ loading: true });
    try {
      const res = await api.get('/chapeiras');
      set({ chapeiras: res.data, lastFetched: Date.now(), loading: false });
    } catch {
      toast.error('Erro ao carregar chapeiras.');
      set({ loading: false });
    }
  },

  updateChapeiraNoCache: (vaga, novosDados) => {
    set((state) => {
      const novaLista = [...state.chapeiras];
      const index = novaLista.findIndex(c => c.vaga === vaga);
      
      if (index !== -1) {
        novaLista[index] = { ...novaLista[index], ...novosDados };
      } else {
        novaLista.push(novosDados);
      }
      return { chapeiras: novaLista };
    });
  }
}));
