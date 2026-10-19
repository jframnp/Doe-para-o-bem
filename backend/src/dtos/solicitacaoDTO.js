const AppError = require('../utils/AppError');

/** Mensagem opcional enviada junto da solicitação (UC05, passo 6). */
function parseSolicitacao(body = {}) {
  const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() : '';
  if (mensagem.length > 500) {
    throw new AppError('A mensagem deve ter no máximo 500 caracteres', 400);
  }
  return { mensagem: mensagem || null };
}

module.exports = { parseSolicitacao };
