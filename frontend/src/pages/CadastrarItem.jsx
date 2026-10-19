import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ROTULOS_CATEGORIA, ROTULOS_CONDICAO } from '../utils/formatos';

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

/** UC01 — Cadastrar Item (página "Doar"). */
export default function CadastrarItem() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    condicao: '',
    cidade: usuario.cidade || '',
    bairro: usuario.bairro || '',
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const escolherFoto = (e) => {
    const arquivo = e.target.files[0];
    setErro(null);
    if (!arquivo) return;
    // Validação antecipada no cliente (o servidor valida de novo — FA01)
    if (arquivo.size > TAMANHO_MAXIMO) {
      e.target.value = '';
      return setErro(new Error('A imagem deve ter no máximo 5 MB'));
    }
    setFoto(arquivo);
    setPreview(URL.createObjectURL(arquivo));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const dados = new FormData();
      Object.entries(form).forEach(([k, v]) => dados.append(k, v));
      if (foto) dados.append('foto', foto);
      const item = await api.cadastrarItem(dados);
      navigate(`/itens/${item.id}`);
    } catch (err) {
      setErro(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="container secao estreito">
      <h1>Doar um item</h1>
      <p className="muted">Preencha os dados do item que você quer doar.</p>

      <form className="card form" onSubmit={enviar}>
        <Alerta erro={erro} />

        <label className="upload">
          {preview ? <img src={preview} alt="Pré-visualização" /> : <span>📷 Adicionar foto</span>}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherFoto} />
        </label>

        <label>
          Título
          <input name="titulo" required maxLength={120} value={form.titulo} onChange={alterar} />
        </label>
        <label>
          Descrição
          <textarea name="descricao" required rows={4} value={form.descricao} onChange={alterar} />
        </label>
        <div className="linha">
          <label>
            Categoria
            <select name="categoria" required value={form.categoria} onChange={alterar}>
              <option value="">Selecione</option>
              {Object.entries(ROTULOS_CATEGORIA).map(([v, r]) => (
                <option key={v} value={v}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Condição
            <select name="condicao" required value={form.condicao} onChange={alterar}>
              <option value="">Selecione</option>
              {Object.entries(ROTULOS_CONDICAO).map(([v, r]) => (
                <option key={v} value={v}>{r}</option>
              ))}
            </select>
          </label>
        </div>
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

        <div className="acoes">
          <button className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Publicando…' : 'Publicar item'}
          </button>
          {/* FA03 — cancelar descarta os dados e volta */}
          <button type="button" className="btn btn-secundario" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
