class AdminController {
  constructor({ adminService }) {
    this.adminService = adminService;
  }

  pendentes = async (req, res) => {
    res.json(await this.adminService.listarBeneficiariosPendentes());
  };

  aprovar = async (req, res) => {
    res.json(await this.adminService.aprovar(req.params.id));
  };

  rejeitar = async (req, res) => {
    res.json(await this.adminService.rejeitar(req.params.id, req.body));
  };
}

module.exports = AdminController;
