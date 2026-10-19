const AppError = require('../utils/AppError');
const solicitacaoDTO = require('../dtos/solicitacaoDTO');
const {
  TipoUsuario,
  StatusItem,
  StatusSolicitacao,
  StatusVerificacao,
} = require('../models/enums');

/**
 * RF04 / UC05 — Solicitar Item
 * RF05, RF06 / UC06 — Visualizar e Responder Solicitações
 */
class SolicitacaoService {
  constructor({ solicitacaoRepository, itemRepository, notificacaoService }) {
    this.solicitacoes = solicitacaoRepository;
    this.itens = itemRepository;
    this.notificacoes = notificacaoService;
  }

  // ---------- UC05 — Solicitar Item ----------

  async solicitar(beneficiario, itemId, body) {
    if (beneficiario.tipo !== TipoUsuario.BENEFICIARIO) {
      throw new AppError('Apenas beneficiários podem solicitar itens', 403);
    }
    // UC13 — beneficiário (ONG) só solicita após aprovação do administrador
    if (beneficiario.statusVerificacao !== StatusVerificacao.APROVADO) {
      throw new AppError('Seu cadastro ainda não foi aprovado pelo administrador', 403);
    }

    const { mensagem } = solicitacaoDTO.parseSolicitacao(body);
    const item = await this.itens.findById(itemId);
    if (!item) throw new AppError('Item não encontrado', 404);

    // FA01 — item indisponível
    if (item.status !== StatusItem.DISPONIVEL) {
      throw new AppError('Este item não está mais disponível', 409);
    }
    if (item.doadorId === beneficiario.id) {
      throw new AppError('Você não pode solicitar o próprio item', 400);
    }
    // FA02 — solicitação duplicada
    if (await this.solicitacoes.findPendente(item.id, beneficiario.id)) {
      throw new AppError('Você já possui uma solicitação em andamento para este item', 409);
    }

    // Passo 7 — registra como PENDENTE (o item continua DISPONIVEL)
    const solicitacao = await this.solicitacoes.create({
      itemId: item.id,
      beneficiarioId: beneficiario.id,
      mensagem,
    });

    // Passo 8 — notifica o doador
    await this.notificacoes.notificar(
      item.doadorId,
      `${beneficiario.nome} solicitou o item "${item.titulo}".`,
    );

    return solicitacao;
  }

  listarDoBeneficiario(beneficiario) {
    return this.solicitacoes.findByBeneficiario(beneficiario.id);
  }

  // ---------- UC06 — Responder Solicitação ----------

  listarRecebidas(doador, { status } = {}) {
    if (doador.tipo !== TipoUsuario.DOADOR) {
      throw new AppError('Apenas doadores recebem solicitações', 403);
    }
    const filtro = Object.values(StatusSolicitacao).includes(status) ? status : undefined;
    return this.solicitacoes.findRecebidas(doador.id, { status: filtro });
  }

  async aceitar(doador, solicitacaoId) {
    const solicitacao = await this.buscarPendenteDoDoador(doador, solicitacaoId);

    // Passo 4 / FA02 — item já reservado ou doado
    const item = await this.itens.findById(solicitacao.itemId);
    if (item.status !== StatusItem.DISPONIVEL) {
      await this.solicitacoes.updateStatus(solicitacao.id, StatusSolicitacao.CANCELADA);
      throw new AppError('O item não está mais disponível. A solicitação foi cancelada', 409);
    }

    // Passos 5–7 — aceita, reserva o item e recusa as demais pendentes
    const recusadas = await this.solicitacoes.aceitar(solicitacao.id);

    // Passos 8–9 — notificações
    await this.notificacoes.notificar(
      solicitacao.beneficiarioId,
      `Sua solicitação do item "${item.titulo}" foi aceita! Combine a retirada com ${doador.nome}.`,
    );
    await Promise.all(
      recusadas.map((s) =>
        this.notificacoes.notificar(
          s.beneficiarioId,
          `O item "${item.titulo}" já foi reservado para outra pessoa.`,
        ),
      ),
    );

    return this.solicitacoes.findById(solicitacao.id);
  }

  async recusar(doador, solicitacaoId) {
    const solicitacao = await this.buscarPendenteDoDoador(doador, solicitacaoId);

    // FA01 — recusa: item permanece DISPONIVEL
    await this.solicitacoes.updateStatus(solicitacao.id, StatusSolicitacao.RECUSADA);
    await this.notificacoes.notificar(
      solicitacao.beneficiarioId,
      `Sua solicitação do item "${solicitacao.item.titulo}" foi recusada pelo doador.`,
    );

    return this.solicitacoes.findById(solicitacao.id);
  }

  async buscarPendenteDoDoador(doador, solicitacaoId) {
    const solicitacao = await this.solicitacoes.findById(solicitacaoId);
    if (!solicitacao) throw new AppError('Solicitação não encontrada', 404);
    if (solicitacao.item.doadorId !== doador.id) {
      throw new AppError('Esta solicitação não pertence a um item seu', 403);
    }
    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new AppError(`Esta solicitação já foi respondida (${solicitacao.status})`, 409);
    }
    return solicitacao;
  }
}

module.exports = SolicitacaoService;
