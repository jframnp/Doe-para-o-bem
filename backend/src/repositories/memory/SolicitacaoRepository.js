const { clone } = require('./store');
const { StatusItem, StatusSolicitacao } = require('../../models/enums');

class MemorySolicitacaoRepository {
  constructor(store) {
    this.store = store;
  }

  detalhar(solicitacao) {
    const item = this.store.itens.find((i) => i.id === solicitacao.itemId);
    const beneficiario = this.store.usuarios.find((u) => u.id === solicitacao.beneficiarioId);
    const doador = item && this.store.usuarios.find((u) => u.id === item.doadorId);
    return {
      ...solicitacao,
      item: item && {
        id: item.id,
        titulo: item.titulo,
        imagemUrl: item.imagemUrl,
        status: item.status,
        doadorId: item.doadorId,
      },
      beneficiario: beneficiario && {
        id: beneficiario.id,
        nome: beneficiario.nome,
        cidade: beneficiario.cidade,
        bairro: beneficiario.bairro,
      },
      doador: doador && { id: doador.id, nome: doador.nome },
    };
  }

  async create(dados) {
    const solicitacao = {
      id: this.store.nextId('solicitacoes'),
      status: StatusSolicitacao.PENDENTE,
      mensagem: null,
      respondidoEm: null,
      ...dados,
      criadoEm: new Date(),
    };
    this.store.solicitacoes.push(solicitacao);
    return clone(solicitacao);
  }

  async findById(id) {
    const s = this.store.solicitacoes.find((x) => x.id === Number(id));
    return s ? this.detalhar(s) : null;
  }

  async findPendente(itemId, beneficiarioId) {
    return clone(
      this.store.solicitacoes.find(
        (s) =>
          s.itemId === Number(itemId) &&
          s.beneficiarioId === Number(beneficiarioId) &&
          s.status === StatusSolicitacao.PENDENTE,
      ),
    );
  }

  async findRecebidas(doadorId, { status } = {}) {
    const idsItens = new Set(
      this.store.itens.filter((i) => i.doadorId === Number(doadorId)).map((i) => i.id),
    );
    return this.store.solicitacoes
      .filter((s) => idsItens.has(s.itemId))
      .filter((s) => !status || s.status === status)
      .sort((a, b) => b.criadoEm - a.criadoEm)
      .map((s) => this.detalhar(s));
  }

  async findByBeneficiario(beneficiarioId) {
    return this.store.solicitacoes
      .filter((s) => s.beneficiarioId === Number(beneficiarioId))
      .sort((a, b) => b.criadoEm - a.criadoEm)
      .map((s) => this.detalhar(s));
  }

  async updateStatus(id, status) {
    const s = this.store.solicitacoes.find((x) => x.id === Number(id));
    if (!s) return null;
    s.status = status;
    s.respondidoEm = new Date();
    return clone(s);
  }

  /**
   * UC06 passos 5–7: aceita a solicitação, reserva o item e recusa as
   * demais pendentes do mesmo item. Retorna as solicitações recusadas.
   */
  async aceitar(id) {
    const aceita = this.store.solicitacoes.find((x) => x.id === Number(id));
    const agora = new Date();
    aceita.status = StatusSolicitacao.ACEITA;
    aceita.respondidoEm = agora;

    const item = this.store.itens.find((i) => i.id === aceita.itemId);
    item.status = StatusItem.RESERVADO;

    const recusadas = this.store.solicitacoes.filter(
      (s) => s.itemId === aceita.itemId && s.id !== aceita.id && s.status === StatusSolicitacao.PENDENTE,
    );
    recusadas.forEach((s) => {
      s.status = StatusSolicitacao.RECUSADA;
      s.respondidoEm = agora;
    });
    return recusadas.map(clone);
  }
}

module.exports = MemorySolicitacaoRepository;
