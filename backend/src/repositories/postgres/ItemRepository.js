const toItem = (row) =>
  row && {
    id: row.id,
    doadorId: row.doador_id,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria: row.categoria,
    condicao: row.condicao,
    cidade: row.cidade,
    bairro: row.bairro,
    imagemUrl: row.imagem_url,
    status: row.status,
    criadoEm: row.criado_em,
    ...(row.doador_nome !== undefined && {
      doador: {
        id: row.doador_id,
        nome: row.doador_nome,
        cidade: row.doador_cidade,
        bairro: row.doador_bairro,
      },
    }),
  };

const SELECT_COM_DOADOR = `
  SELECT i.*, u.nome AS doador_nome, u.cidade AS doador_cidade, u.bairro AS doador_bairro
    FROM itens i
    JOIN usuarios u ON u.id = i.doador_id`;

class PostgresItemRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(d) {
    const { rows } = await this.pool.query(
      `INSERT INTO itens (doador_id, titulo, descricao, categoria, condicao, cidade, bairro, imagem_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [d.doadorId, d.titulo, d.descricao, d.categoria, d.condicao, d.cidade, d.bairro || null, d.imagemUrl],
    );
    return toItem(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query(`${SELECT_COM_DOADOR} WHERE i.id = $1`, [id]);
    return toItem(rows[0]);
  }

  async search({ categoria, cidade, bairro, q, status = 'DISPONIVEL' } = {}) {
    const condicoes = ['i.status = $1'];
    const params = [status];
    const add = (sql, valor) => {
      params.push(valor);
      condicoes.push(sql.replaceAll('?', `$${params.length}`));
    };
    if (categoria) add('i.categoria = ?', categoria);
    if (cidade) add('LOWER(i.cidade) = LOWER(?)', cidade);
    if (bairro) add('LOWER(i.bairro) = LOWER(?)', bairro);
    if (q) add('(i.titulo ILIKE ? OR i.descricao ILIKE ?)', `%${q}%`);

    const { rows } = await this.pool.query(
      `${SELECT_COM_DOADOR} WHERE ${condicoes.join(' AND ')} ORDER BY i.criado_em DESC LIMIT 100`,
      params,
    );
    return rows.map(toItem);
  }

  async findByDoador(doadorId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM itens WHERE doador_id = $1 AND status <> 'REMOVIDO' ORDER BY criado_em DESC`,
      [doadorId],
    );
    return rows.map(toItem);
  }

  async updateStatus(id, status) {
    const { rows } = await this.pool.query(
      'UPDATE itens SET status = $2 WHERE id = $1 RETURNING *',
      [id, status],
    );
    return toItem(rows[0]);
  }
}

module.exports = PostgresItemRepository;
