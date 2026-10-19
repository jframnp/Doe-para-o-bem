const AppError = require('../utils/AppError');
const { Categoria, Condicao } = require('../models/enums');

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

/**
 * Valida os campos do formulário "Cadastrar Item" (UC01, passo 4).
 * A foto é validada separadamente pelo middleware de upload.
 */
function parseCadastro(body = {}) {
  const dados = {
    titulo: texto(body.titulo),
    descricao: texto(body.descricao),
    categoria: texto(body.categoria).toUpperCase(),
    condicao: texto(body.condicao).toUpperCase(),
    cidade: texto(body.cidade),
    bairro: texto(body.bairro),
  };

  const erros = [];
  if (dados.titulo.length < 3) erros.push('título deve ter ao menos 3 caracteres');
  if (dados.titulo.length > 120) erros.push('título deve ter no máximo 120 caracteres');
  if (dados.descricao.length < 10) erros.push('descrição deve ter ao menos 10 caracteres');
  if (!Object.values(Categoria).includes(dados.categoria)) erros.push('categoria inválida');
  if (!Object.values(Condicao).includes(dados.condicao)) erros.push('condição inválida');
  if (!dados.cidade) erros.push('cidade é obrigatória');

  if (erros.length) throw new AppError('Dados do item inválidos', 400, erros);
  return dados;
}

/** Filtros da busca de itens (RF03): categoria, região e texto livre. */
function parseFiltros(query = {}) {
  const categoria = texto(query.categoria).toUpperCase();
  return {
    categoria: Object.values(Categoria).includes(categoria) ? categoria : undefined,
    cidade: texto(query.cidade) || undefined,
    bairro: texto(query.bairro) || undefined,
    q: texto(query.q) || undefined,
  };
}

module.exports = { parseCadastro, parseFiltros };
