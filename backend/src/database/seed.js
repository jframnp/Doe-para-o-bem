const bcrypt = require('bcryptjs');
const { TipoUsuario, TipoPessoa, StatusVerificacao } = require('../models/enums');

/**
 * Dados de demonstração. Todas as contas usam a senha "123456".
 */
async function seed(repos) {
  if (await repos.usuarios.findByEmail('admin@dpb.com')) return;

  const senhaHash = await bcrypt.hash('123456', 10);
  const base = { senhaHash, tipoPessoa: TipoPessoa.FISICA, cidade: 'São Paulo' };

  await repos.usuarios.create({
    ...base,
    nome: 'Administrador DPB',
    email: 'admin@dpb.com',
    tipo: TipoUsuario.ADMIN,
    statusVerificacao: StatusVerificacao.APROVADO,
  });
  const doador = await repos.usuarios.create({
    ...base,
    nome: 'Maria Doadora',
    email: 'doador@dpb.com',
    tipo: TipoUsuario.DOADOR,
    bairro: 'Consolação',
    statusVerificacao: StatusVerificacao.APROVADO,
  });
  await repos.usuarios.create({
    ...base,
    nome: 'João Beneficiário',
    email: 'beneficiario@dpb.com',
    tipo: TipoUsuario.BENEFICIARIO,
    bairro: 'Bela Vista',
    statusVerificacao: StatusVerificacao.APROVADO,
  });
  await repos.usuarios.create({
    ...base,
    nome: 'ONG Mãos que Ajudam',
    email: 'ong@dpb.com',
    tipo: TipoUsuario.BENEFICIARIO,
    tipoPessoa: TipoPessoa.JURIDICA,
    documento: '12345678000199',
    bairro: 'Santa Cecília',
    statusVerificacao: StatusVerificacao.PENDENTE,
  });

  const itens = [
    ['Jaqueta de inverno infantil', 'Jaqueta tamanho 8, pouco usada, sem manchas.', 'ROUPAS', 'SEMINOVO'],
    ['Mesa de estudos', 'Mesa de madeira 1,20m com uma gaveta. Precisa retirar no local.', 'MOVEIS', 'USADO'],
    ['Coleção Harry Potter', 'Os 7 livros da série em português, bom estado.', 'LIVROS', 'USADO'],
    ['Liquidificador', 'Funcionando perfeitamente, 3 velocidades.', 'ELETRONICOS', 'SEMINOVO'],
  ];
  for (const [titulo, descricao, categoria, condicao] of itens) {
    await repos.itens.create({
      doadorId: doador.id,
      titulo,
      descricao,
      categoria,
      condicao,
      cidade: 'São Paulo',
      bairro: 'Consolação',
      imagemUrl: null,
    });
  }
}

module.exports = { seed };

// Execução direta: npm run db:seed (usa o DB_DRIVER configurado)
if (require.main === module) {
  const env = require('../config/env');
  const { createRepositories } = require('../repositories');
  seed(createRepositories(env.dbDriver))
    .then(() => {
      console.log('Seed concluído.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Falha no seed:', err.message);
      process.exit(1);
    });
}
