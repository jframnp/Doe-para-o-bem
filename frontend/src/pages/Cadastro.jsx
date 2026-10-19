import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { useAuth } from '../contexts/AuthContext';

const INICIAL = {
  tipo: 'DOADOR',
  tipoPessoa: 'FISICA',
  nome: '',
  email: '',
  senha: '',
  documento: '',
  telefone: '',
  cidade: '',
  bairro: '',
};

/** RF01 — cadastro como Doador ou Beneficiário (pessoa física ou ONG). */
export default function Cadastro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INICIAL);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const ehOng = form.tipo === 'BENEFICIARIO' && form.tipoPessoa === 'JURIDICA';

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const dados = { ...form, tipoPessoa: form.tipo === 'DOADOR' ? 'FISICA' : form.tipoPessoa };
      const usuario = await registrar(dados);
      navigate(usuario.tipo === 'DOADOR' ? '/doar' : '/');
    } catch (err) {
      setErro(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="container secao auth">
      <form className="card form" onSubmit={enviar}>
        <h1>Criar conta</h1>

        <div className="segmentado" role="radiogroup" aria-label="Tipo de conta">
          {[
            ['DOADOR', 'Quero doar'],
            ['BENEFICIARIO', 'Preciso de itens'],
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={form.tipo === valor}
              className={form.tipo === valor ? 'ativo' : ''}
              onClick={() => setForm({ ...form, tipo: valor })}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {form.tipo === 'BENEFICIARIO' && (
          <label>
            Você é
            <select name="tipoPessoa" value={form.tipoPessoa} onChange={alterar}>
              <option value="FISICA">Pessoa física</option>
              <option value="JURIDICA">ONG / Instituição</option>
            </select>
          </label>
        )}

        <Alerta erro={erro} />

        <label>
          {ehOng ? 'Nome da instituição' : 'Nome completo'}
          <input name="nome" required value={form.nome} onChange={alterar} />
        </label>
        {ehOng && (
          <label>
            CNPJ
            <input name="documento" required value={form.documento} onChange={alterar} placeholder="00.000.000/0000-00" />
            <small className="muted">O cadastro de ONGs passa por aprovação do administrador.</small>
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required value={form.email} onChange={alterar} />
        </label>
        <label>
          Senha
          <input name="senha" type="password" required minLength={6} value={form.senha} onChange={alterar} />
        </label>
        <label>
          Telefone (opcional)
          <input name="telefone" value={form.telefone} onChange={alterar} />
        </label>
        <div className="linha">
          <label>
            Cidade
            <input name="cidade" required value={form.cidade} onChange={alterar} />
          </label>
          <label>
            Bairro
            <input name="bairro" value={form.bairro} onChange={alterar} />
          </label>
        </div>

        <button className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Cadastrando…' : 'Cadastrar'}
        </button>
        <p className="muted centro">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </form>
    </section>
  );
}
