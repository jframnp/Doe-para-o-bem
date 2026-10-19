import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { api } from '../services/api';
import { ROTULOS_STATUS, formatarData } from '../utils/formatos';

/** Acompanhamento das solicitações feitas pelo beneficiário. */
export default function MinhasSolicitacoes() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.minhasSolicitacoes().then(setLista).catch(setErro);
  }, []);

  return (
    <section className="container secao">
      <h1>Minhas solicitações</h1>
      <Alerta erro={erro} />
      {!lista ? (
        !erro && <p className="vazio">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="vazio">
          Você ainda não solicitou nenhum item. <Link to="/">Ver itens disponíveis</Link>
        </p>
      ) : (
        <ul className="lista">
          {lista.map((s) => (
            <li key={s.id} className="card solicitacao">
              <div>
                <Link to={`/itens/${s.item.id}`} className="solicitacao-item">{s.item.titulo}</Link>
                <p className="muted">
                  Doador: {s.doador.nome} · {formatarData(s.criadoEm)}
                </p>
              </div>
              <span className={`status status-${s.status.toLowerCase()}`}>{ROTULOS_STATUS[s.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
