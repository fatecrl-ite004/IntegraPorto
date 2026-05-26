import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import RedefinirSenha from './pages/RedefinirSenha';
import Dashboard from './pages/Dashboard';
import Trabalhos from './pages/Trabalhos';
import FolhaTrabalho from './pages/FolhaTrabalho';
import HistoricoTrabalhos from './pages/HistoricoTrabalhos';
import Usuarios from './pages/Usuarios';
import Cadastros from './pages/Cadastros';
import Financeiro from './pages/Financeiro';
import Terminais from './pages/Terminais';
import Associados from './pages/Associados';
import Motoristas from './pages/Motoristas';
import { Cavalos, Carretas } from './pages/Veiculos';
import { Transportadoras, Armadores } from './pages/Empresas';
import Chapeiras from './pages/Chapeiras';
import Layout from './components/Layout';
import EmConstrucao from './pages/EmConstrucao';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Analytics />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          
          {/* Rotas Protegidas */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trabalhos" element={<ProtectedRoute><Trabalhos /></ProtectedRoute>} />
          <Route path="/trabalhos/historico" element={<ProtectedRoute><HistoricoTrabalhos /></ProtectedRoute>} />
          <Route path="/trabalhos/:id" element={<ProtectedRoute><FolhaTrabalho /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="/cadastros" element={<ProtectedRoute><Cadastros /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
          <Route path="/cadastros/terminais" element={<ProtectedRoute><Terminais /></ProtectedRoute>} />
          <Route path="/cadastros/chapeiras" element={<ProtectedRoute><Chapeiras /></ProtectedRoute>} />
          <Route path="/cadastros/associados" element={<ProtectedRoute><Associados /></ProtectedRoute>} />
          <Route path="/cadastros/motoristas" element={<ProtectedRoute><Motoristas /></ProtectedRoute>} />
          <Route path="/cadastros/cavalos" element={<ProtectedRoute><Cavalos /></ProtectedRoute>} />
          <Route path="/cadastros/carretas" element={<ProtectedRoute><Carretas /></ProtectedRoute>} />
          <Route path="/cadastros/transportadoras" element={<ProtectedRoute><Transportadoras /></ProtectedRoute>} />
          <Route path="/cadastros/armadores" element={<ProtectedRoute><Armadores /></ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

