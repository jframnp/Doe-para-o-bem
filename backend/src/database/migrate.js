const fs = require('fs');
const path = require('path');
const { getPool } = require('./connection');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const pool = getPool();
  await pool.query(sql);
  console.log('Migração concluída.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Falha na migração:', err.message);
  process.exit(1);
});
