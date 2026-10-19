class NotificacaoController {
  constructor({ notificacaoService }) {
    this.notificacaoService = notificacaoService;
  }

  listar = async (req, res) => {
    res.json(await this.notificacaoService.listar(req.usuario.id));
  };

  marcarLida = async (req, res) => {
    res.json(await this.notificacaoService.marcarLida(req.params.id, req.usuario.id));
  };
}

module.exports = NotificacaoController;
