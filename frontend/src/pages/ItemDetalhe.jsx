import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { ItemImagem } from '../components/ItemCard';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ROTULOS_CATEGORIA, ROTULOS_CONDICAO, ROTULOS_STATUS, formatarData } from '../utils/formatos';

/** UC05 — Solicitar Item (página de detalhes + formulário de solicitação). */
export default function ItemDetalhe() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [erro, setErro] = useState(null);
  const [formAberto, setFormAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    api.item(id).then(setItem).catch(setErro);
  }, [id]);

  const clicarSolicitar = () => {
    // FA03 — não logado: vai para o login e retorna depois
    if (!usuario) return navigate('/entrar', { state: { voltarPara: location.pathname } });
    setFormAberto(true);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await api.solicitarItem(id, mensagem);
      setSucesso(true);
      setFormAberto(false);
    } catch (err) {
      setErro(err);
    } finally {
      setEnviando(false);
    }
  };

  if (!item) {
    return (
      <section className="container secao">
        {erro ? <Alerta erro={erro} /> : <p className="vazio">Carregando…</p>}
      </section>
    );
  }

  const podeSolicitar = !usuario || usuario.tipo === 'BENEFICIARIO';
  const ongPendente = usuario?.tipo === 'BENEFICIARIO' && !usuario.verificado;

  return (
    <section className="container secao">
      <Link to="/" className="voltar">← Voltar para os itens</Link>
      <div className="detalhe">
        <ItemImagem item={item} className="detalhe-imagem" />

        <div className="detalhe-info">
          <div className="tags">
            <span className="tag">{ROTULOS_CATEGORIA[item.categoria]}</span>
            <span className="tag tag-neutra">{ROTULOS_CONDICAO[item.condicao]}</span>
            {item.status !== 'DISPONIVEL' && <span className="tag tag-alerta">{ROTULOS_STATUS[item.status]}</span>}
          </div>
          <h1>{item.titulo}</h1>
          <p>{item.descricao}</p>
          <dl className="dados">
            <dt>Localização</dt>
            <dd>{[item.bairro, item.cidade].filter(Boolean).join(', ')}</dd>
            <dt>Doador</dt>
            <dd>{item.doador?.nome}</dd>
            <dt>Publicado em</dt>
            <dd>{formatarData(item.criadoEm)}</dd>
          </dl>

          {sucesso && (
            <Alerta tipo="sucesso">
              Solicitação enviada! Você será notificado quando o doador responder.
            </Alerta>
          )}
          <Alerta erro={erro} />

          {podeSolicitar && item.status === 'DISPONIVEL' && !sucesso && (
            ongPendente ? (
              <Alerta tipo="info">Seu cadastro está aguardando aprovação do administrador.</Alerta>
            ) : formAberto ? (
              <form className="form" onSubmit={enviar}>
                <label>
                  Mensagem para o doador (opcional)
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Conte por que este item vai te ajudar"
                  />
                </label>
                <div className="acoes">
                  <button className="btn btn-primary" disabled={enviando}>
                    {enviando ? 'Enviando…' : 'Enviar solicitação'}
                  </button>
                  <button type="button" className="btn btn-secundario" onClick={() => setFormAberto(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-primary" onClick={clicarSolicitar}>Solicitar item</button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
