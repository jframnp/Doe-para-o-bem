const toUsuario = (row) =>
  row && {
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    tipo: row.tipo,
    tipoPessoa: row.tipo_pessoa,
    documento: row.documento,
    telefone: row.telefone,
    cidade: row.cidade,
    bairro: row.bairro,
    statusVerificacao: row.status_verificacao,
    motivoRejeicao: row.motivo_rejeicao,
    verificadoEm: row.verificado_em,
    criadoEm: row.criado_em,
  };

const COLUNAS = {
  statusVerificacao: 'status_verificacao',
  motivoRejeicao: 'motivo_rejeicao',
  verificadoEm: 'verificado_em',
  nome: 'nome',
  telefone: 'telefone',
  cidade: 'cidade',
  bairro: 'bairro',
};

class PostgresUsuarioRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(d) {
    const { rows } = await this.pool.query(
      `INSERT INTO usuarios
         (nome, email, senha_hash, tipo, tipo_pessoa, documento, telefone, cidade, bairro, status_verificacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [d.nome, d.email, d.senhaHash, d.tipo, d.tipoPessoa, d.documento || null,
        d.telefone || null, d.cidade, d.bairro || null, d.statusVerificacao],
    );
    return toUsuario(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return toUsuario(rows[0]);
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return toUsuario(rows[0]);
  }

  async findBeneficiariosPendentes() {
    const { rows } = await this.pool.query(
      `SELECT * FROM usuarios
        WHERE tipo = 'BENEFICIARIO' AND status_verificacao = 'PENDENTE'
        ORDER BY criado_em`,
    );
    return rows.map(toUsuario);
  }

  async update(id, campos) {
    const entradas = Object.entries(campos).filter(([k]) => COLUNAS[k]);
    if (!entradas.length) return this.findById(id);
    const sets = entradas.map(([k], i) => `${COLUNAS[k]} = $${i + 2}`).join(', ');
    const { rows } = await this.pool.query(
      `UPDATE usuarios SET ${sets} WHERE id = $1 RETURNING *`,
      [id, ...entradas.map(([, v]) => v)],
    );
    return toUsuario(rows[0]);
  }
}

module.exports = PostgresUsuarioRepository;
