import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Redireciona para o login quando não há sessão (UC05/FA03) e bloqueia tipos não permitidos. */
export default function ProtectedRoute({ tipos, children }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <p className="container vazio">Carregando…</p>;
  if (!usuario) return <Navigate to="/entrar" replace state={{ voltarPara: location.pathname }} />;
  if (tipos && !tipos.includes(usuario.tipo)) return <Navigate to="/" replace />;
  return children;
}
