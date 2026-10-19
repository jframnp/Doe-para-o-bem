import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import Alerta from '../components/Alerta';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ROTULOS_CATEGORIA } from '../utils/formatos';

/** Página inicial + RF03: busca de itens por categoria e região. */
export default function Home() {
  const { usuario } = useAuth();
  const [filtros, setFiltros] = useState({ q: '', categoria: '', cidade: '', bairro: '' });
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscar = async (f = filtros) => {
    setCarregando(true);
    setErro(null);
    try {
      setItens(await api.buscarItens(f));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alterar = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const escolherCategoria = (categoria) => {
    const novos = { ...filtros, categoria: filtros.categoria === categoria ? '' : categoria };
    setFiltros(novos);
    buscar(novos);
  };

  return (
    <>
      {!usuario && (
        <section className="hero">
          <div className="container">
            <h1>Doe o que você não usa. Ajude quem está perto.</h1>
            <p>
              Conectamos doadores, famílias e ONGs da sua comunidade para que roupas, móveis,
              livros e eletrônicos em bom estado ganhem uma nova casa.
            </p>
            <div className="hero-acoes">
              <Link to="/cadastro" className="btn btn-primary">Quero participar</Link>
              <a href="#itens" className="btn btn-secundario">Ver itens disponíveis</a>
            </div>
          </div>
        </section>
      )}

      <section className="container secao" id="itens">
        <h2>Itens disponíveis</h2>

        <form
          className="busca"
          onSubmit={(e) => {
            e.preventDefault();
            buscar();
          }}
        >
          <input name="q" placeholder="O que você procura?" value={filtros.q} onChange={alterar} />
          <input name="cidade" placeholder="Cidade" value={filtros.cidade} onChange={alterar} />
          <input name="bairro" placeholder="Bairro" value={filtros.bairro} onChange={alterar} />
          <button className="btn btn-primary" type="submit">Buscar</button>
        </form>

        <div className="chips">
          {Object.entries(ROTULOS_CATEGORIA).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              className={`chip ${filtros.categoria === valor ? 'ativo' : ''}`}
              onClick={() => escolherCategoria(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <Alerta erro={erro} />
        {carregando ? (
          <p className="vazio">Carregando itens…</p>
        ) : itens.length === 0 ? (
          <p className="vazio">Nenhum item encontrado com esses filtros.</p>
        ) : (
          <div className="grade-itens">
            {itens.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
