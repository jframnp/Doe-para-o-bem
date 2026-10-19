/**
 * Enumerações do domínio (ver Diagrama de Classes, seção 5.3 do documento).
 */

const TipoUsuario = Object.freeze({
  DOADOR: 'DOADOR',
  BENEFICIARIO: 'BENEFICIARIO',
  ADMIN: 'ADMIN',
});

const TipoPessoa = Object.freeze({
  FISICA: 'FISICA',
  JURIDICA: 'JURIDICA', // ONG
});

const StatusVerificacao = Object.freeze({
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO',
});

const StatusItem = Object.freeze({
  DISPONIVEL: 'DISPONIVEL',
  RESERVADO: 'RESERVADO',
  DOADO: 'DOADO',
  REMOVIDO: 'REMOVIDO',
});

const StatusSolicitacao = Object.freeze({
  PENDENTE: 'PENDENTE',
  ACEITA: 'ACEITA',
  RECUSADA: 'RECUSADA',
  CANCELADA: 'CANCELADA',
  CONCLUIDA: 'CONCLUIDA',
});

const Categoria = Object.freeze({
  ROUPAS: 'ROUPAS',
  MOVEIS: 'MOVEIS',
  ELETRONICOS: 'ELETRONICOS',
  LIVROS: 'LIVROS',
  BRINQUEDOS: 'BRINQUEDOS',
  UTENSILIOS: 'UTENSILIOS',
  OUTROS: 'OUTROS',
});

const Condicao = Object.freeze({
  NOVO: 'NOVO',
  SEMINOVO: 'SEMINOVO',
  USADO: 'USADO',
});

module.exports = {
  TipoUsuario,
  TipoPessoa,
  StatusVerificacao,
  StatusItem,
  StatusSolicitacao,
  Categoria,
  Condicao,
};
