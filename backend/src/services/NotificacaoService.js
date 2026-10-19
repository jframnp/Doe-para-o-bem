const AppError = require('../utils/AppError');

/**
 * Notificações internas da plataforma (RF12).
 * Hoje ficam salvas no banco; futuramente podem ser enviadas também por email/push.
 */
class NotificacaoService {
  constructor({ notificacaoRepository }) {
    this.notificacoes = notificacaoRepository;
  }

  notificar(usuarioId, mensagem) {
    return this.notificacoes.create({ usuarioId, mensagem });
  }

  listar(usuarioId) {
    return this.notificacoes.findByUsuario(usuarioId);
  }

  async marcarLida(id, usuarioId) {
    const notificacao = await this.notificacoes.marcarLida(id, usuarioId);
    if (!notificacao) throw new AppError('Notificação não encontrada', 404);
    return notificacao;
  }
}

module.exports = NotificacaoService;
