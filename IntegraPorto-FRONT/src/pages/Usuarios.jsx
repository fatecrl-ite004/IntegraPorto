import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

function ModalNovoUsuario({ isOpen, onClose, onSucesso, loggedRole }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    role: 'OP'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/usuarios', formData);
      toast.success('Usuário cadastrado com sucesso!');
      onSucesso();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl text-left border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b pb-3">Novo Usuário do Sistema</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                  <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha Provisória</label>
                  <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nível de Acesso (Role)</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="OP">Operacional (OP)</option>
                    <option value="SUP">Supervisor (SUP)</option>
                    <option value="SEC">Secretaria (SEC)</option>
                    {loggedRole === 'ADM' && <option value="ADM">Administrador (ADM)</option>}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50" disabled={loading}>Cancelar</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Criando...' : 'Criar Acesso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModalEditarPermissao({ isOpen, onClose, usuario, onSucesso, loggedRole }) {
  const [role, setRole] = useState(usuario?.role || 'OP');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(usuario) setRole(usuario.role);
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/usuarios/${usuario.id}/role`, { role });
      toast.success('Permissão atualizada com sucesso!');
      onSucesso();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar permissão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl text-left border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Editar Permissões</h3>
              <p className="text-sm text-slate-500 mb-4">Editando: {usuario.email}</p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Novo Nível</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="OP">Operacional (OP)</option>
                  <option value="SUP">Supervisor (SUP)</option>
                  <option value="SEC">Secretaria (SEC)</option>
                  {loggedRole === 'ADM' && <option value="ADM">Administrador (ADM)</option>}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedRole = useAuthStore((state) => state.role);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      toast.error('Erro ao listar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleBloquear = async (u) => {
    try {
      await api.put(`/usuarios/${u.id}/status`);
      toast.success(u.ativo ? 'Usuário bloqueado com sucesso!' : 'Usuário desbloqueado!');
      carregarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao alterar status do usuário.');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Gestão de Usuários</h2>
          <p className="text-sm text-slate-500 mt-1">Controle de acesso, hierarquia e bloqueios do sistema.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Novo Usuário
        </button>
      </div>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Perfil (Role)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acesso</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Carregando...</td></tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className={u.ativo ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {u.ativo ? (
                       <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-red-600 font-medium text-xs">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Bloqueado
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <button onClick={() => setEditUser(u)} className="text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                      Permissões
                    </button>
                    <button onClick={() => handleBloquear(u)} className={`${u.ativo ? 'text-red-600 hover:text-red-900' : 'text-emerald-600 hover:text-emerald-900'} transition-colors`}>
                      {u.ativo ? 'Bloquear' : 'Liberar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalNovoUsuario isOpen={modalOpen} onClose={() => setModalOpen(false)} onSucesso={carregarUsuarios} loggedRole={loggedRole} />
      <ModalEditarPermissao isOpen={!!editUser} usuario={editUser} onClose={() => setEditUser(null)} onSucesso={carregarUsuarios} loggedRole={loggedRole} />
    </div>
  );
}
