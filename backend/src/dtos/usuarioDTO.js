const AppError = require('../utils/AppError');
const { TipoUsuario, TipoPessoa, StatusVerificacao } = require('../models/enums');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

/**
 * Valida e normaliza os dados de cadastro de usuário (RF01).
 * Somente DOADOR e BENEFICIARIO podem se cadastrar pela API pública.
 */
function parseRegistro(body = {}) {
  const dados = {
    nome: texto(body.nome),
    email: texto(body.email).toLowerCase(),
    senha: typeof body.senha === 'string' ? body.senha : '',
    tipo: texto(body.tipo).toUpperCase(),
    tipoPessoa: texto(body.tipoPessoa).toUpperCase() || TipoPessoa.FISICA,
    documento: texto(body.documento).replace(/\D/g, ''),
    telefone: texto(body.telefone),
    cidade: texto(body.cidade),
    bairro: texto(body.bairro),
  };

  const erros = [];
  if (dados.nome.length < 3) erros.push('nome deve ter ao menos 3 caracteres');
  if (!EMAIL_REGEX.test(dados.email)) erros.push('email inválido');
  if (dados.senha.length < 6) erros.push('senha deve ter ao menos 6 caracteres');
  if (![TipoUsuario.DOADOR, TipoUsuario.BENEFICIARIO].includes(dados.tipo)) {
    erros.push('tipo deve ser DOADOR ou BENEFICIARIO');
  }
  if (!Object.values(TipoPessoa).includes(dados.tipoPessoa)) {
    erros.push('tipoPessoa deve ser FISICA ou JURIDICA');
  }
  if (dados.tipoPessoa === TipoPessoa.JURIDICA && dados.documento.length !== 14) {
    erros.push('ONGs devem informar um CNPJ com 14 dígitos');
  }
  if (!dados.cidade) erros.push('cidade é obrigatória');

  if (erros.length) throw new AppError('Dados de cadastro inválidos', 400, erros);
  return dados;
}

function parseLogin(body = {}) {
  const email = texto(body.email).toLowerCase();
  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!email || !senha) throw new AppError('Informe email e senha', 400);
  return { email, senha };
}

/** Remove dados sensíveis (hash de senha) antes de expor o usuário. */
function toResponse(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    tipoPessoa: usuario.tipoPessoa,
    telefone: usuario.telefone,
    cidade: usuario.cidade,
    bairro: usuario.bairro,
    statusVerificacao: usuario.statusVerificacao,
    verificado: usuario.statusVerificacao === StatusVerificacao.APROVADO,
    motivoRejeicao: usuario.motivoRejeicao || null,
    criadoEm: usuario.criadoEm,
  };
}

/** Visão pública do usuário, exibida para outros usuários (ex.: doador na página do item). */
function toPublico(usuario) {
  if (!usuario) return null;
  return { id: usuario.id, nome: usuario.nome, cidade: usuario.cidade, bairro: usuario.bairro };
}

module.exports = { parseRegistro, parseLogin, toResponse, toPublico };
