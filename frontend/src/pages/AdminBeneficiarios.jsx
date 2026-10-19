import { useEffect, useState } from 'react';
import Alerta from '../components/Alerta';
import { api } from '../services/api';
import { formatarData } from '../utils/formatos';

const formatarCnpj = (d = '') =>
  d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

/** RF10 / UC13 — Aprovar Beneficiário. */
export default function AdminBeneficiarios() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState('');

  const carregar = () => api.beneficiariosPendentes().then(setLista).catch(setErro);

  useEffect(() => {
    carregar();
  }, []);

  const executar = async (acao, mensagemSucesso) => {
    setErro(null);
    try {
      await acao();
      setAviso(mensagemSucesso);
      setRejeitando(null);
      setMotivo('');
      carregar();
    } catch (e) {
      setErro(e);
    }
  };

  return (
    <section className="container secao">
      <h1>Beneficiários pendentes</h1>
      {aviso && <Alerta tipo="sucesso">{aviso}</Alerta>}
      <Alerta erro={erro} />

      {lista?.length === 0 && <p className="vazio">Nenhum cadastro aguardando aprovação.</p>}
      <ul className="lista">
        {lista?.map((u) => (
          <li key={u.id} className="card solicitacao">
            <div>
              <strong>{u.nome}</strong>
              <p className="muted">
                {u.tipoPessoa === 'JURIDICA' ? `ONG · CNPJ ${formatarCnpj(u.documento)}` : 'Pessoa física'} ·{' '}
                {u.cidade} · cadastrado em {formatarData(u.criadoEm)}
              </p>
              <p className="muted">{u.email}</p>

              {rejeitando === u.id && (
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    executar(() => api.rejeitarBeneficiario(u.id, motivo), `${u.nome} foi rejeitado.`);
                  }}
                >
                  <label>
                    Motivo da rejeição
                    <textarea required rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                  </label>
                  <div className="acoes">
                    <button className="btn btn-perigo btn-sm">Confirmar rejeição</button>
                    <button type="button" className="btn btn-secundario btn-sm" onClick={() => setRejeitando(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {rejeitando !== u.id && (
              <div className="acoes">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => executar(() => api.aprovarBeneficiario(u.id), `${u.nome} foi aprovado.`)}
                >
                  Aprovar
                </button>
                <button className="btn btn-secundario btn-sm" onClick={() => setRejeitando(u.id)}>
                  Rejeitar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
