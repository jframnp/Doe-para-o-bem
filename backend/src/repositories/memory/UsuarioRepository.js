const { clone } = require('./store');
const { TipoUsuario, StatusVerificacao } = require('../../models/enums');

class MemoryUsuarioRepository {
  constructor(store) {
    this.store = store;
  }

  async create(dados) {
    const usuario = {
      id: this.store.nextId('usuarios'),
      motivoRejeicao: null,
      verificadoEm: null,
      ...dados,
      criadoEm: new Date(),
    };
    this.store.usuarios.push(usuario);
    return clone(usuario);
  }

  async findById(id) {
    return clone(this.store.usuarios.find((u) => u.id === Number(id)));
  }

  async findByEmail(email) {
    return clone(this.store.usuarios.find((u) => u.email === email));
  }

  async findBeneficiariosPendentes() {
    return this.store.usuarios
      .filter(
        (u) =>
          u.tipo === TipoUsuario.BENEFICIARIO &&
          u.statusVerificacao === StatusVerificacao.PENDENTE,
      )
      .sort((a, b) => a.criadoEm - b.criadoEm)
      .map(clone);
  }

  async update(id, campos) {
    const usuario = this.store.usuarios.find((u) => u.id === Number(id));
    if (!usuario) return null;
    Object.assign(usuario, campos);
    return clone(usuario);
  }
}

module.exports = MemoryUsuarioRepository;
