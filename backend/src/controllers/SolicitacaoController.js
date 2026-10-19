class SolicitacaoController {
  constructor({ solicitacaoService }) {
    this.solicitacaoService = solicitacaoService;
  }

  solicitar = async (req, res) => {
    const solicitacao = await this.solicitacaoService.solicitar(req.usuario, req.params.id, req.body);
    res.status(201).json(solicitacao);
  };

  recebidas = async (req, res) => {
    res.json(await this.solicitacaoService.listarRecebidas(req.usuario, req.query));
  };

  minhas = async (req, res) => {
    res.json(await this.solicitacaoService.listarDoBeneficiario(req.usuario));
  };

  aceitar = async (req, res) => {
    res.json(await this.solicitacaoService.aceitar(req.usuario, req.params.id));
  };

  recusar = async (req, res) => {
    res.json(await this.solicitacaoService.recusar(req.usuario, req.params.id));
  };
}

module.exports = SolicitacaoController;
