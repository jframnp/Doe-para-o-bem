const toNotificacao = (row) =>
  row && {
    id: row.id,
    usuarioId: row.usuario_id,
    mensagem: row.mensagem,
    lida: row.lida,
    criadoEm: row.criado_em,
  };

class PostgresNotificacaoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ usuarioId, mensagem }) {
    const { rows } = await this.pool.query(
      'INSERT INTO notificacoes (usuario_id, mensagem) VALUES ($1, $2) RETURNING *',
      [usuarioId, mensagem],
    );
    return toNotificacao(rows[0]);
  }

  async findByUsuario(usuarioId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY criado_em DESC, id DESC LIMIT 50',
      [usuarioId],
    );
    return rows.map(toNotificacao);
  }

  async marcarLida(id, usuarioId) {
    const { rows } = await this.pool.query(
      'UPDATE notificacoes SET lida = TRUE WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId],
    );
    return toNotificacao(rows[0]);
  }
}

module.exports = PostgresNotificacaoRepository;
