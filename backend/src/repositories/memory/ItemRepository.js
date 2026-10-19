const { clone } = require('./store');
const { StatusItem } = require('../../models/enums');

const normalizar = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

class MemoryItemRepository {
  constructor(store) {
    this.store = store;
  }

  comDoador(item) {
    if (!item) return null;
    const doador = this.store.usuarios.find((u) => u.id === item.doadorId);
    return {
      ...item,
      doador: doador
        ? { id: doador.id, nome: doador.nome, cidade: doador.cidade, bairro: doador.bairro }
        : null,
    };
  }

  async create(dados) {
    const item = {
      id: this.store.nextId('itens'),
      status: StatusItem.DISPONIVEL,
      ...dados,
      criadoEm: new Date(),
    };
    this.store.itens.push(item);
    return clone(item);
  }

  async findById(id) {
    return this.comDoador(this.store.itens.find((i) => i.id === Number(id)));
  }

  async search({ categoria, cidade, bairro, q, status = StatusItem.DISPONIVEL } = {}) {
    return this.store.itens
      .filter((i) => i.status === status)
      .filter((i) => !categoria || i.categoria === categoria)
      .filter((i) => !cidade || normalizar(i.cidade) === normalizar(cidade))
      .filter((i) => !bairro || normalizar(i.bairro) === normalizar(bairro))
      .filter(
        (i) =>
          !q ||
          normalizar(i.titulo).includes(normalizar(q)) ||
          normalizar(i.descricao).includes(normalizar(q)),
      )
      .sort((a, b) => b.criadoEm - a.criadoEm)
      .map((i) => this.comDoador(i));
  }

  async findByDoador(doadorId) {
    return this.store.itens
      .filter((i) => i.doadorId === Number(doadorId) && i.status !== StatusItem.REMOVIDO)
      .sort((a, b) => b.criadoEm - a.criadoEm)
      .map(clone);
  }

  async updateStatus(id, status) {
    const item = this.store.itens.find((i) => i.id === Number(id));
    if (!item) return null;
    item.status = status;
    return clone(item);
  }
}

module.exports = MemoryItemRepository;
