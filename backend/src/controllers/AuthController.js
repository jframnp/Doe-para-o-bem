const usuarioDTO = require('../dtos/usuarioDTO');

class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  registrar = async (req, res) => {
    res.status(201).json(await this.authService.registrar(req.body));
  };

  login = async (req, res) => {
    res.json(await this.authService.login(req.body));
  };

  me = async (req, res) => {
    res.json(usuarioDTO.toResponse(req.usuario));
  };
}

module.exports = AuthController;
