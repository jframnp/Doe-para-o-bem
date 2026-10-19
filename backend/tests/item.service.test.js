const { createTestContainer, criarUsuario, fotoFake } = require('./helpers');

describe('UC01 — Cadastrar Item / RF03 — Buscar Itens', () => {
  let container;
  let itemService;
  let doador;

  const dadosItem = {
    titulo: 'Bicicleta aro 20',
    descricao: 'Bicicleta infantil com rodinhas',
    categoria: 'brinquedos',
    condicao: 'usado',
  };

  beforeEach(async () => {
    container = createTestContainer();
    itemService = container.services.itemService;
    doador = await criarUsuario(container, {
      nome: 'Carlos',
      email: 'carlos@teste.com',
      tipo: 'DOADOR',
      cidade: 'Campinas',
      bairro: 'Centro',
    });
  });

  test('fluxo principal: item criado DISPONIVEL com a localização do doador', async () => {
    const item = await itemService.cadastrar(doador, dadosItem, fotoFake);

    expect(item).toMatchObject({
      status: 'DISPONIVEL',
      categoria: 'BRINQUEDOS',
      condicao: 'USADO',
      cidade: 'Campinas',
      bairro: 'Centro',
      imagemUrl: '/uploads/teste.png',
      doadorId: doador.id,
    });
  });

  test('FA01: campos obrigatórios ausentes', async () => {
    await expect(itemService.cadastrar(doador, { titulo: 'x' }, fotoFake)).rejects.toMatchObject({
      statusCode: 400,
      detalhes: expect.arrayContaining(['categoria inválida']),
    });
  });

  test('FA01: foto obrigatória', async () => {
    await expect(itemService.cadastrar(doador, dadosItem, undefined)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('FA02: falha no upload da imagem', async () => {
    container = createTestContainer({
      storageService: { salvar: async () => { throw new Error('S3 fora do ar'); } },
    });
    await expect(
      container.services.itemService.cadastrar(doador, dadosItem, fotoFake),
    ).rejects.toMatchObject({ statusCode: 502 });
  });

  test('somente doadores cadastram itens', async () => {
    const benef = await criarUsuario(container, {
      nome: 'Bia',
      email: 'bia@teste.com',
      tipo: 'BENEFICIARIO',
    });
    await expect(itemService.cadastrar(benef, dadosItem, fotoFake)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('busca filtra por categoria, cidade (sem acento/caixa) e texto', async () => {
    await itemService.cadastrar(doador, dadosItem, fotoFake);
    await itemService.cadastrar(
      doador,
      { ...dadosItem, titulo: 'Livro de receitas', descricao: 'Livro de culinária brasileira', categoria: 'LIVROS' },
      fotoFake,
    );

    expect(await itemService.buscar({ categoria: 'LIVROS' })).toHaveLength(1);
    expect(await itemService.buscar({ cidade: 'CAMPINAS' })).toHaveLength(2);
    expect(await itemService.buscar({ cidade: 'Santos' })).toHaveLength(0);
    expect(await itemService.buscar({ q: 'culinaria' })).toHaveLength(1);
  });

  test('busca não retorna itens reservados', async () => {
    const item = await itemService.cadastrar(doador, dadosItem, fotoFake);
    await container.repositories.itens.updateStatus(item.id, 'RESERVADO');
    expect(await itemService.buscar({})).toHaveLength(0);
  });

  test('detalhar item inexistente retorna 404', async () => {
    await expect(itemService.detalhar(999)).rejects.toMatchObject({ statusCode: 404 });
  });
});
