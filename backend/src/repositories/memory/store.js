/**
 * "Banco" em memória compartilhado pelos repositórios memory.
 * Útil para desenvolvimento sem PostgreSQL e para testes automatizados.
 */
function createMemoryStore() {
  const sequencias = {};
  return {
    usuarios: [],
    itens: [],
    solicitacoes: [],
    notificacoes: [],
    nextId(tabela) {
      sequencias[tabela] = (sequencias[tabela] || 0) + 1;
      return sequencias[tabela];
    },
  };
}

const clone = (obj) => (obj ? { ...obj } : null);

module.exports = { createMemoryStore, clone };
