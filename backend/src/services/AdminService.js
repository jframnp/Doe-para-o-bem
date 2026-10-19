const AppError = require('../utils/AppError');
const usuarioDTO = require('../dtos/usuarioDTO');
const { StatusVerificacao } = require('../models/enums');

/**
 * RF10 / UC13 — Aprovar Beneficiário
 */
class AdminService {
  constructor({ usuarioRepository, notificacaoService }) {
    this.usuarios = usuarioRepository;
    this.notificacoes = notificacaoService;
  }

  async listarBeneficiariosPendentes() {
    const pendentes = await this.usuarios.findBeneficiariosPendentes();
    // O administrador precisa ver o documento (CNPJ) para analisar o cadastro
    return pendentes.map((u) => ({ ...usuarioDTO.toResponse(u), documento: u.documento }));
  }

  async aprovar(id) {
    await this.buscarPendente(id);
    const usuario = await this.usuarios.update(id, {
      statusVerificacao: StatusVerificacao.APROVADO,
      motivoRejeicao: null,
      verificadoEm: new Date(),
    });
    await this.notificacoes.notificar(
      usuario.id,
      'Seu cadastro foi aprovado! Agora você já pode solicitar itens.',
    );
    return usuarioDTO.toResponse(usuario);
  }

  async rejeitar(id, body = {}) {
    const motivo = typeof body.motivo === 'string' ? body.motivo.trim() : '';
    if (!motivo) throw new AppError('Informe o motivo da rejeição', 400);

    await this.buscarPendente(id);
    const usuario = await this.usuarios.update(id, {
      statusVerificacao: StatusVerificacao.REJEITADO,
      motivoRejeicao: motivo,
    });
    await this.notificacoes.notificar(usuario.id, `Seu cadastro foi rejeitado. Motivo: ${motivo}`);
    return usuarioDTO.toResponse(usuario);
  }

  async buscarPendente(id) {
    const usuario = await this.usuarios.findById(id);
    if (!usuario || usuario.statusVerificacao !== StatusVerificacao.PENDENTE) {
      throw new AppError('Cadastro pendente não encontrado', 404);
    }
    return usuario;
  }
}

module.exports = AdminService;
