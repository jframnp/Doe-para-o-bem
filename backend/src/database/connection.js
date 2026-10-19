const { Pool } = require('pg');
const env = require('../config/env');

let pool;

/** Pool de conexões compartilhado (criado sob demanda). */
function getPool() {
  if (!pool) {
    if (!env.databaseUrl) {
      throw new Error('DATABASE_URL não configurada. Veja backend/.env.example');
    }
    pool = new Pool({ connectionString: env.databaseUrl });
  }
  return pool;
}

module.exports = { getPool };
