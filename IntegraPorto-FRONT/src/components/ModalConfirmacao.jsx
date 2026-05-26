import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function ModalConfirmacao({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensagem, 
  textoConfirmar = 'Confirmar', 
  textoCancelar = 'Cancelar',
  tipo = 'aviso', // 'aviso', 'perigo', 'sucesso'
  loading = false
}) {
  if (!isOpen) return null;

  const cores = {
    aviso: {
      icone: <AlertTriangle className="w-8 h-8 text-orange-500" />,
      fundoIcone: 'bg-orange-100',
      btnConfirma: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
    },
    perigo: {
      icone: <AlertTriangle className="w-8 h-8 text-red-500" />,
      fundoIcone: 'bg-red-100',
      btnConfirma: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    sucesso: {
      icone: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      fundoIcone: 'bg-emerald-100',
      btnConfirma: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
    }
  };

  const estilo = cores[tipo] || cores.aviso;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={loading ? null : onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${estilo.fundoIcone}`}>
            {estilo.icone}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{titulo}</h3>
          <p className="text-sm text-slate-500 mb-8 px-2">{mensagem}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
            >
              {textoCancelar}
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70 flex items-center justify-center gap-2 ${estilo.btnConfirma}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aguarde...
                </>
              ) : (
                textoConfirmar
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
