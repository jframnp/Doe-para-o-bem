import { useEffect, useState } from 'react';
import Alerta from '../components/Alerta';
import { api } from '../services/api';
import { formatarData } from '../utils/formatos';

export default function Notificacoes() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.notificacoes().then(setLista).catch(setErro);
  }, []);

  const marcarLida = async (n) => {
    if (n.lida) return;
    await api.marcarNotificacaoLida(n.id);
    setLista((atual) => atual.map((x) => (x.id === n.id ? { ...x, lida: true } : x)));
  };

  return (
    <section className="container secao estreito">
      <h1>Notificações</h1>
      <Alerta erro={erro} />
      {lista?.length === 0 && <p className="vazio">Nenhuma notificação por enquanto.</p>}
      <ul className="lista">
        {lista?.map((n) => (
          <li key={n.id}>
            <button className={`card notificacao ${n.lida ? '' : 'nao-lida'}`} onClick={() => marcarLida(n)}>
              <span>{n.mensagem}</span>
              <small className="muted">{formatarData(n.criadoEm)}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
