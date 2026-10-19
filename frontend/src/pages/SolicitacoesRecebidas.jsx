import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { api } from '../services/api';
import { ROTULOS_STATUS, formatarData } from '../utils/formatos';

const ABAS = [
  ['PENDENTE', 'Pendentes'],
  ['ACEITA', 'Aceitas'],
  ['RECUSADA', 'Recusadas'],
  ['', 'Todas'],
];

/** RF05 / RF06 — UC06 Responder Solicitação (página "Pedidos"). */
export default function SolicitacoesRecebidas() {
  const [aba, setAba] = useState('PENDENTE');
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');
  const [processando, setProcessando] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista(await api.solicitacoesRecebidas(aba));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [aba]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const responder = async (s, acao) => {
    setProcessando(s.id);
    setErro(null);
    setAviso('');
    try {
      if (acao === 'aceitar') {
        await api.aceitarSolicitacao(s.id);
        setAviso(`Solicitação de ${s.beneficiario.nome} aceita. Combine a retirada do item!`);
      } else {
        await api.recusarSolicitacao(s.id);
        setAviso(`Solicitação de ${s.beneficiario.nome} recusada.`);
      }
    } catch (e) {
      setErro(e);
    } finally {
      setProcessando(null);
      carregar();
    }
  };

  return (
    <section className="container secao">
      <h1>Solicitações recebidas</h1>

      <div className="abas">
        {ABAS.map(([valor, rotulo]) => (
          <button key={rotulo} className={aba === valor ? 'ativo' : ''} onClick={() => setAba(valor)}>
            {rotulo}
          </button>
        ))}
      </div>

      {aviso && <Alerta tipo="sucesso">{aviso}</Alerta>}
      <Alerta erro={erro} />

      {carregando ? (
        <p className="vazio">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="vazio">Nenhuma solicitação aqui.</p>
      ) : (
        <ul className="lista">
          {lista.map((s) => (
            <li key={s.id} className="card solicitacao">
              <div>
                <Link to={`/itens/${s.item.id}`} className="solicitacao-item">{s.item.titulo}</Link>
                <p>
                  <strong>{s.beneficiario.nome}</strong>{' '}
                  <span className="muted">
                    · {[s.beneficiario.bairro, s.beneficiario.cidade].filter(Boolean).join(', ')} ·{' '}
                    {formatarData(s.criadoEm)}
                  </span>
                </p>
                {s.mensagem && <blockquote>“{s.mensagem}”</blockquote>}
              </div>
              {s.status === 'PENDENTE' ? (
                <div className="acoes">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={processando === s.id}
                    onClick={() => responder(s, 'aceitar')}
                  >
                    Aceitar
                  </button>
                  <button
                    className="btn btn-secundario btn-sm"
                    disabled={processando === s.id}
                    onClick={() => responder(s, 'recusar')}
                  >
                    Recusar
                  </button>
                </div>
              ) : (
                <span className={`status status-${s.status.toLowerCase()}`}>{ROTULOS_STATUS[s.status]}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
