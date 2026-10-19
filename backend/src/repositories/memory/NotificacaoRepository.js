const { clone } = require('./store');

class MemoryNotificacaoRepository {
  constructor(store) {
    this.store = store;
  }

  async create({ usuarioId, mensagem }) {
    const notificacao = {
      id: this.store.nextId('notificacoes'),
      usuarioId,
      mensagem,
      lida: false,
      criadoEm: new Date(),
    };
    this.store.notificacoes.push(notificacao);
    return clone(notificacao);
  }

  async findByUsuario(usuarioId) {
    return this.store.notificacoes
      .filter((n) => n.usuarioId === Number(usuarioId))
      .sort((a, b) => b.criadoEm - a.criadoEm || b.id - a.id)
      .map(clone);
  }

  async marcarLida(id, usuarioId) {
    const n = this.store.notificacoes.find(
      (x) => x.id === Number(id) && x.usuarioId === Number(usuarioId),
    );
    if (!n) return null;
    n.lida = true;
    return clone(n);
  }
}

module.exports = MemoryNotificacaoRepository;
