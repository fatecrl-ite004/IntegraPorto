import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Anchor, X, Mail, KeyRound, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

function ModalEsqueciSenha({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/recover', { email });
    } catch {
      // Intencionalmente ignorado: não expor se o e-mail existe ou não
    } finally {
      setEnviado(true);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEnviado(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>

        {enviado ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Solicitação Enviada</h3>
            <p className="text-sm text-slate-500 mb-6">
              Se este e-mail estiver cadastrado no sistema, você receberá as instruções de recuperação em breve. Verifique também sua caixa de spam.
            </p>
            <button onClick={handleClose} className="px-6 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recuperar Senha</h3>
                <p className="text-xs text-slate-500">Informe seu e-mail cadastrado</p>
              </div>
            </div>
            <form onSubmit={handleEnviar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors text-sm"
                  placeholder="nome@integraporto.com.br"
                />
              </div>
              <p className="text-xs text-slate-400">
                Enviaremos um link de redefinição para o e-mail informado, caso esteja cadastrado no sistema.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [esqueciOpen, setEsqueciOpen] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      setAuth(res.data.token);
      toast.success('Login bem-sucedido!');
      navigate('/');
    } catch (err) {
      setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Esquerda: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <Anchor className="text-slate-300 w-16 h-16 mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl font-light text-white tracking-wide mb-4">Integra<span className="font-semibold text-blue-500">Porto</span></h1>
          <p className="text-slate-400 text-lg max-w-md font-light">
            Sistema Integrado de Gestão Portuária e Controle Logístico de Frotas.
          </p>
        </div>
        
        {/* Custom Carbon Badge */}
        <div className="absolute bottom-6 z-10 opacity-70 hover:opacity-100 transition-opacity duration-300">
          <a 
            href="https://www.websitecarbon.com/website/integraporto-com-br-login/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-colors px-3.5 py-2 rounded-lg border border-white/10"
          >
            <div className="text-[#00ff66] font-bold text-2xl leading-none">A+</div>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-1.5 text-white/90 font-medium text-[11px] mb-0.5">
                Mais limpo que 98% dos sites testados <ExternalLink className="w-3 h-3 text-white/50" />
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-white/60">0.01g CO₂/visita</span>
                <span className="text-[#00ff66]/80">Energia renovável</span>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Direita: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-10 flex items-center gap-2">
            <Anchor className="text-slate-800 w-8 h-8" />
            <span className="text-2xl font-light text-slate-900">Integra<span className="font-semibold text-blue-600">Porto</span></span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Acesso ao Sistema</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8">Insira suas credenciais corporativas para continuar.</p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors sm:text-sm"
                placeholder="nome@integraporto.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors sm:text-sm"
                placeholder="••••••••"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setEsqueciOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} IntegraPorto. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      <ModalEsqueciSenha isOpen={esqueciOpen} onClose={() => setEsqueciOpen(false)} />
    </div>
  );
}
