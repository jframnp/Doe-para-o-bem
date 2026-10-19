const { createContainer } = require('../src/container');
const { createRepositories } = require('../src/repositories');

/** Container com banco em memória e storage falso (não grava em disco). */
function createTestContainer({ storageService } = {}) {
  return createContainer({
    config: { jwtSecret: 'segredo-de-teste', dbDriver: 'memory' },
    repositories: createRepositories('memory'),
    storageService: storageService || { salvar: async () => '/uploads/teste.png' },
  });
}

const fotoFake = { buffer: Buffer.from('fake'), mimetype: 'image/png', originalname: 'foto.png' };

async function criarUsuario(container, dados) {
  const { usuario } = await container.services.authService.registrar({
    senha: '123456',
    cidade: 'São Paulo',
    ...dados,
  });
  return container.repositories.usuarios.findById(usuario.id);
}

async function cenarioBasico(container) {
  const doador = await criarUsuario(container, {
    nome: 'Doador Teste',
    email: 'doador@teste.com',
    tipo: 'DOADOR',
  });
  const beneficiario = await criarUsuario(container, {
    nome: 'Beneficiário Teste',
    email: 'benef@teste.com',
    tipo: 'BENEFICIARIO',
  });
  const item = await container.services.itemService.cadastrar(
    doador,
    {
      titulo: 'Cadeira de escritório',
      descricao: 'Cadeira giratória em bom estado',
      categoria: 'MOVEIS',
      condicao: 'USADO',
    },
    fotoFake,
  );
  return { doador, beneficiario, item };
}

module.exports = { createTestContainer, criarUsuario, cenarioBasico, fotoFake };
