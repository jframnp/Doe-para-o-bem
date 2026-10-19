const toSolicitacao = (row) =>
  row && {
    id: row.id,
    itemId: row.item_id,
    beneficiarioId: row.beneficiario_id,
    mensagem: row.mensagem,
    status: row.status,
    criadoEm: row.criado_em,
    respondidoEm: row.respondido_em,
    ...(row.item_titulo !== undefined && {
      item: {
        id: row.item_id,
        titulo: row.item_titulo,
        imagemUrl: row.item_imagem_url,
        status: row.item_status,
        doadorId: row.doador_id,
      },
      beneficiario: {
        id: row.beneficiario_id,
        nome: row.beneficiario_nome,
        cidade: row.beneficiario_cidade,
        bairro: row.beneficiario_bairro,
      },
      doador: { id: row.doador_id, nome: row.doador_nome },
    }),
  };

const SELECT_DETALHADO = `
  SELECT s.*,
         i.titulo AS item_titulo, i.imagem_url AS item_imagem_url, i.status AS item_status, i.doador_id,
         b.nome AS beneficiario_nome, b.cidade AS beneficiario_cidade, b.bairro AS beneficiario_bairro,
         d.nome AS doador_nome
    FROM solicitacoes s
    JOIN itens i    ON i.id = s.item_id
    JOIN usuarios b ON b.id = s.beneficiario_id
    JOIN usuarios d ON d.id = i.doador_id`;

class PostgresSolicitacaoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ itemId, beneficiarioId, mensagem }) {
    const { rows } = await this.pool.query(
      `INSERT INTO solicitacoes (item_id, beneficiario_id, mensagem)
       VALUES ($1, $2, $3) RETURNING *`,
      [itemId, beneficiarioId, mensagem],
    );
    return toSolicitacao(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query(`${SELECT_DETALHADO} WHERE s.id = $1`, [id]);
    return toSolicitacao(rows[0]);
  }

  async findPendente(itemId, beneficiarioId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM solicitacoes
        WHERE item_id = $1 AND beneficiario_id = $2 AND status = 'PENDENTE'`,
      [itemId, beneficiarioId],
    );
    return toSolicitacao(rows[0]);
  }

  async findRecebidas(doadorId, { status } = {}) {
    const params = [doadorId];
    let filtro = '';
    if (status) {
      params.push(status);
      filtro = 'AND s.status = $2';
    }
    const { rows } = await this.pool.query(
      `${SELECT_DETALHADO} WHERE i.doador_id = $1 ${filtro} ORDER BY s.criado_em DESC`,
      params,
    );
    return rows.map(toSolicitacao);
  }

  async findByBeneficiario(beneficiarioId) {
    const { rows } = await this.pool.query(
      `${SELECT_DETALHADO} WHERE s.beneficiario_id = $1 ORDER BY s.criado_em DESC`,
      [beneficiarioId],
    );
    return rows.map(toSolicitacao);
  }

  async updateStatus(id, status) {
    const { rows } = await this.pool.query(
      'UPDATE solicitacoes SET status = $2, respondido_em = NOW() WHERE id = $1 RETURNING *',
      [id, status],
    );
    return toSolicitacao(rows[0]);
  }

  /** UC06 passos 5–7 em uma única transação. Retorna as solicitações recusadas. */
  async aceitar(id) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [aceita] } = await client.query(
        `UPDATE solicitacoes SET status = 'ACEITA', respondido_em = NOW()
          WHERE id = $1 RETURNING *`,
        [id],
      );
      await client.query(`UPDATE itens SET status = 'RESERVADO' WHERE id = $1`, [aceita.item_id]);
      const { rows: recusadas } = await client.query(
        `UPDATE solicitacoes SET status = 'RECUSADA', respondido_em = NOW()
          WHERE item_id = $1 AND id <> $2 AND status = 'PENDENTE'
          RETURNING *`,
        [aceita.item_id, id],
      );
      await client.query('COMMIT');
      return recusadas.map(toSolicitacao);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = PostgresSolicitacaoRepository;
