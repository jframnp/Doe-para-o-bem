const { createContainer } = require('./container');
const { createApp } = require('./app');
const { seed } = require('./database/seed');

async function start() {
  const container = createContainer();
  const { port, dbDriver } = container.config;

  // Sem banco, os dados vivem só em memória: popula com dados de demonstração a cada início
  if (dbDriver === 'memory') await seed(container.repositories);

  createApp(container).listen(port, () => {
    console.log(`DPB API rodando em http://localhost:${port}/api (DB_DRIVER=${dbDriver})`);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar a API:', err);
  process.exit(1);
});
