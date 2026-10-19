import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Entrar from './pages/Entrar';
import Cadastro from './pages/Cadastro';
import ItemDetalhe from './pages/ItemDetalhe';
import CadastrarItem from './pages/CadastrarItem';
import SolicitacoesRecebidas from './pages/SolicitacoesRecebidas';
import MinhasSolicitacoes from './pages/MinhasSolicitacoes';
import Notificacoes from './pages/Notificacoes';
import AdminBeneficiarios from './pages/AdminBeneficiarios';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/itens/:id" element={<ItemDetalhe />} />
          <Route
            path="/doar"
            element={<ProtectedRoute tipos={['DOADOR']}><CadastrarItem /></ProtectedRoute>}
          />
          <Route
            path="/pedidos"
            element={<ProtectedRoute tipos={['DOADOR']}><SolicitacoesRecebidas /></ProtectedRoute>}
          />
          <Route
            path="/minhas-solicitacoes"
            element={<ProtectedRoute tipos={['BENEFICIARIO']}><MinhasSolicitacoes /></ProtectedRoute>}
          />
          <Route
            path="/notificacoes"
            element={<ProtectedRoute><Notificacoes /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute tipos={['ADMIN']}><AdminBeneficiarios /></ProtectedRoute>}
          />
          <Route path="*" element={<p className="container vazio">Página não encontrada.</p>} />
        </Routes>
      </main>
      <footer className="rodape">
        <div className="container">DPB: Doe Para O Bem · Grupo MackLee · Mackenzie 2026/2</div>
      </footer>
    </>
  );
}
