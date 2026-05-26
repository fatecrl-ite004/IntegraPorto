import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { Anchor, KeyRound, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!token) {
      setErro('Link inválido. Solicite uma nova recuperação de senha.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await api.post('/auth/reset', { token, newPassword: novaSenha });
      setSucesso(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Link expirado ou inválido. Solicite um novo e-mail de recuperação.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors text-sm";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Esquerda: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <Anchor className="text-slate-300 w-16 h-16 mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl font-light text-white tracking-wide mb-4">
            Integra<span className="font-semibold text-blue-500">Porto</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-light">
            Sistema Integrado de Gestão Portuária e Controle Logístico de Frotas.
          </p>
        </div>
      </div>

      {/* Direita: Formulário */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-10 flex items-center gap-2">
            <Anchor className="text-slate-800 w-8 h-8" />
            <span className="text-2xl font-light text-slate-900">
              Integra<span className="font-semibold text-blue-600">Porto</span>
            </span>
          </div>

          {sucesso ? (
            /* ── Tela de sucesso ── */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Senha Redefinida!</h2>
              <p className="text-sm text-slate-500 mb-8">
                Sua senha foi atualizada com sucesso. Você já pode fazer login com a nova senha.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Ir para o Login
              </button>
            </div>
          ) : (
            /* ── Formulário de redefinição ── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Nova Senha</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Crie uma senha segura para sua conta.</p>
                </div>
              </div>

              {erro && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg mb-5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}

              {!token || erro.includes('inválido') ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Voltar ao Login
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={mostrar ? 'text' : 'password'}
                        required
                        value={novaSenha}
                        onChange={e => { setNovaSenha(e.target.value); setErro(''); }}
                        className={inputClass}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrar(!mostrar)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
                    <input
                      type={mostrar ? 'text' : 'password'}
                      required
                      value={confirmar}
                      onChange={e => { setConfirmar(e.target.value); setErro(''); }}
                      className={`${inputClass} ${confirmar && confirmar !== novaSenha ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="Repita a nova senha"
                    />
                    {confirmar && confirmar !== novaSenha && (
                      <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !novaSenha || novaSenha !== confirmar}
                    className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Salvando...' : 'Redefinir Senha'}
                  </button>

                  <p className="text-center">
                    <button type="button" onClick={() => navigate('/login')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                      Voltar ao login
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} IntegraPorto. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
