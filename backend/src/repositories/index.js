/**
 * Fábrica de repositórios: escolhe a implementação de persistência
 * (memória ou PostgreSQL) sem que as camadas superiores precisem saber qual é.
 */
function createRepositories(driver = 'memory') {
  if (driver === 'postgres') {
    const { getPool } = require('../database/connection');
    const pool = getPool();
    return {
      usuarios: new (require('./postgres/UsuarioRepository'))(pool),
      itens: new (require('./postgres/ItemRepository'))(pool),
      solicitacoes: new (require('./postgres/SolicitacaoRepository'))(pool),
      notificacoes: new (require('./postgres/NotificacaoRepository'))(pool),
    };
  }

  if (driver === 'memory') {
    const { createMemoryStore } = require('./memory/store');
    const store = createMemoryStore();
    return {
      usuarios: new (require('./memory/UsuarioRepository'))(store),
      itens: new (require('./memory/ItemRepository'))(store),
      solicitacoes: new (require('./memory/SolicitacaoRepository'))(store),
      notificacoes: new (require('./memory/NotificacaoRepository'))(store),
    };
  }

  throw new Error(`DB_DRIVER desconhecido: ${driver}`);
}

module.exports = { createRepositories };
