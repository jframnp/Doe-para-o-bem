const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const usuarioDTO = require('../dtos/usuarioDTO');
const { TipoUsuario, TipoPessoa, StatusVerificacao } = require('../models/enums');

const SALT_ROUNDS = 10;

/**
 * RF01 — Cadastro de usuários e autenticação (RNF02: hash de senha + JWT).
 */
class AuthService {
  constructor({ usuarioRepository, jwtSecret, jwtExpiresIn = '1d' }) {
    this.usuarios = usuarioRepository;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
  }

  async registrar(body) {
    const dados = usuarioDTO.parseRegistro(body);

    if (await this.usuarios.findByEmail(dados.email)) {
      throw new AppError('Já existe uma conta com este email', 409);
    }

    // ONGs (beneficiário pessoa jurídica) passam por aprovação do administrador (UC13)
    const precisaAprovacao =
      dados.tipo === TipoUsuario.BENEFICIARIO && dados.tipoPessoa === TipoPessoa.JURIDICA;

    const { senha, ...resto } = dados;
    const usuario = await this.usuarios.create({
      ...resto,
      senhaHash: await bcrypt.hash(senha, SALT_ROUNDS),
      statusVerificacao: precisaAprovacao ? StatusVerificacao.PENDENTE : StatusVerificacao.APROVADO,
    });

    return { usuario: usuarioDTO.toResponse(usuario), token: this.gerarToken(usuario) };
  }

  async login(body) {
    const { email, senha } = usuarioDTO.parseLogin(body);
    const usuario = await this.usuarios.findByEmail(email);

    // Mesma mensagem para email inexistente e senha errada (não revela quais emails existem)
    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    return { usuario: usuarioDTO.toResponse(usuario), token: this.gerarToken(usuario) };
  }

  gerarToken(usuario) {
    return jwt.sign({ sub: usuario.id, tipo: usuario.tipo }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /** Valida o token e devolve o usuário atualizado do banco. */
  async autenticarToken(token) {
    let payload;
    try {
      payload = jwt.verify(token, this.jwtSecret);
    } catch {
      throw new AppError('Sessão inválida ou expirada. Faça login novamente', 401);
    }
    const usuario = await this.usuarios.findById(payload.sub);
    if (!usuario) throw new AppError('Usuário não encontrado', 401);
    return usuario;
  }
}

module.exports = AuthService;
