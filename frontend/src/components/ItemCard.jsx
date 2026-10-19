import { Link } from 'react-router-dom';
import { ROTULOS_CATEGORIA, ROTULOS_CONDICAO } from '../utils/formatos';

export function ItemImagem({ item, className = '' }) {
  if (item.imagemUrl) {
    return <img src={item.imagemUrl} alt={item.titulo} className={`item-imagem ${className}`} />;
  }
  return (
    <div className={`item-imagem item-imagem-vazia ${className}`} aria-hidden="true">
      {ROTULOS_CATEGORIA[item.categoria]?.[0] || '?'}
    </div>
  );
}

export default function ItemCard({ item }) {
  return (
    <Link to={`/itens/${item.id}`} className="card item-card">
      <ItemImagem item={item} />
      <div className="item-card-corpo">
        <div className="tags">
          <span className="tag">{ROTULOS_CATEGORIA[item.categoria]}</span>
          <span className="tag tag-neutra">{ROTULOS_CONDICAO[item.condicao]}</span>
        </div>
        <h3>{item.titulo}</h3>
        <p className="muted">
          📍 {item.bairro ? `${item.bairro}, ` : ''}
          {item.cidade}
        </p>
      </div>
    </Link>
  );
}
