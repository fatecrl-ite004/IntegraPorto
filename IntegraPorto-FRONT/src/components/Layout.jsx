import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutDashboard, Truck, Users, FileText, Anchor, ChevronDown, Circle, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }) {
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();
  const [cadastrosOpen, setCadastrosOpen] = useState(location.pathname.startsWith('/cadastros'));

  const navItems = [];
  
  if (role === 'ADM' || role === 'SEC') {
    navItems.push({ name: 'Visão Geral', path: '/', icon: LayoutDashboard });
  }
  navItems.push({ name: 'Trabalhos', path: '/trabalhos', icon: Truck });
  navItems.push({ name: 'Histórico', path: '/trabalhos/historico', icon: ClipboardList });
  if (role === 'ADM' || role === 'SEC') {
    navItems.push({ name: 'Financeiro', path: '/financeiro', icon: FileText });
  }

  if (role === 'ADM' || role === 'SEC') {
    navItems.push({ name: 'Usuários', path: '/usuarios', icon: Users });
  }

  const subCadastros = [
    { name: 'Terminais', path: '/cadastros/terminais' },
    { name: 'Chapeiras / Vagas', path: '/cadastros/chapeiras' },
    { name: 'Associados', path: '/cadastros/associados' },
    { name: 'Motoristas', path: '/cadastros/motoristas' },
    { name: 'Cavalos Mecânicos', path: '/cadastros/cavalos' },
    { name: 'Carretas', path: '/cadastros/carretas' },
    { name: 'Transportadoras', path: '/cadastros/transportadoras' },
    { name: 'Armadores / Navios', path: '/cadastros/armadores' },
  ];

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Corporativa */}
      <div className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl z-10 h-screen flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-950/50">
          <Anchor className="text-slate-400 w-5 h-5 mr-3" />
          <span className="font-light text-lg tracking-wide">Integra<span className="font-semibold text-blue-500">Porto</span></span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col overflow-y-auto">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navegação Principal
          </div>
          <nav className="space-y-1 px-3 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                </Link>
              )
            })}

            {/* Menu Cadastros Expansível */}
            <div>
              <button 
                onClick={() => setCadastrosOpen(!cadastrosOpen)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:bg-slate-800 hover:text-white`}
              >
                <div className="flex items-center">
                  <FileText className="mr-3 h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                  Cadastros Base
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${cadastrosOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {cadastrosOpen && (
                <div className="mt-1 space-y-1 ml-9 border-l border-slate-800 pl-2">
                  {subCadastros.map(sub => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`group flex items-center px-2 py-2 text-xs font-medium rounded-md transition-all ${
                          isSubActive 
                            ? 'text-blue-400 bg-slate-800/50' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        <Circle className={`mr-2 h-1.5 w-1.5 ${isSubActive ? 'fill-blue-400 text-blue-400' : 'text-slate-600'}`} />
                        {sub.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

          </nav>
        </div>
        
        <div className="p-4 bg-slate-950/30 border-t border-slate-800/50">
          <div className="flex items-center mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mr-3">
                {role}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Usuário do Sistema</p>
                <p className="text-xs text-emerald-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Sessão Ativa
                </p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center text-slate-400 hover:text-red-400 text-sm font-medium w-full px-2 py-2 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-0">
           <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
             IntegraPorto Operations
           </h1>
        </header>
        
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
