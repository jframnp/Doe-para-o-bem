import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { useAuth } from '../contexts/AuthContext';

export default function Entrar() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await login(form.email, form.senha);
      // UC05/FA03 — após autenticar, volta para onde o usuário estava
      navigate(location.state?.voltarPara || '/', { replace: true });
    } catch (err) {
      setErro(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="container secao auth">
      <form className="card form" onSubmit={enviar}>
        <h1>Entrar</h1>
        <Alerta erro={erro} />
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
        </label>
        <button className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="muted centro">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </section>
  );
}
