import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [naoLidas, setNaoLidas] = useState(0);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    setAberto(false);
    if (!usuario) return;
    api
      .notificacoes()
      .then((lista) => setNaoLidas(lista.filter((n) => !n.lida).length))
      .catch(() => {});
  }, [usuario, location.pathname]);

  const sair = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">♥</span> Doe Para O Bem
        </Link>

        <button className="menu-toggle" onClick={() => setAberto(!aberto)} aria-label="Abrir menu">
          ☰
        </button>

        <nav className={`nav-links ${aberto ? 'aberto' : ''}`}>
          <NavLink to="/" end>Itens</NavLink>
          {usuario?.tipo === 'DOADOR' && (
            <>
              <NavLink to="/doar">Doar</NavLink>
              <NavLink to="/pedidos">Pedidos</NavLink>
            </>
          )}
          {usuario?.tipo === 'BENEFICIARIO' && (
            <NavLink to="/minhas-solicitacoes">Minhas solicitações</NavLink>
          )}
          {usuario?.tipo === 'ADMIN' && <NavLink to="/admin">Aprovações</NavLink>}

          {usuario ? (
            <>
              <NavLink to="/notificacoes" className="nav-notificacoes">
                Notificações {naoLidas > 0 && <span className="badge">{naoLidas}</span>}
              </NavLink>
              <button className="btn btn-link" onClick={sair}>Sair</button>
            </>
          ) : (
            <>
              <NavLink to="/entrar">Entrar</NavLink>
              <Link to="/cadastro" className="btn btn-primary btn-sm">Cadastrar-se</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
