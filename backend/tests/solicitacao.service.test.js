const { createTestContainer, criarUsuario, cenarioBasico } = require('./helpers');

describe('UC05 — Solicitar Item', () => {
  let container;
  let service;
  let ctx;

  beforeEach(async () => {
    container = createTestContainer();
    service = container.services.solicitacaoService;
    ctx = await cenarioBasico(container);
  });

  test('fluxo principal: cria PENDENTE, item segue DISPONIVEL e doador é notificado', async () => {
    const s = await service.solicitar(ctx.beneficiario, ctx.item.id, { mensagem: 'Preciso para estudar' });

    expect(s.status).toBe('PENDENTE');
    expect(s.mensagem).toBe('Preciso para estudar');
    expect((await container.repositories.itens.findById(ctx.item.id)).status).toBe('DISPONIVEL');

    const notificacoes = await container.services.notificacaoService.listar(ctx.doador.id);
    expect(notificacoes[0].mensagem).toContain('Cadeira de escritório');
  });

  test('FA01: item indisponível', async () => {
    await container.repositories.itens.updateStatus(ctx.item.id, 'RESERVADO');
    await expect(service.solicitar(ctx.beneficiario, ctx.item.id, {})).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test('FA02: solicitação duplicada', async () => {
    await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    await expect(service.solicitar(ctx.beneficiario, ctx.item.id, {})).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('em andamento'),
    });
  });

  test('ONG não aprovada não pode solicitar (UC13)', async () => {
    const ong = await criarUsuario(container, {
      nome: 'ONG Teste',
      email: 'ong@teste.com',
      tipo: 'BENEFICIARIO',
      tipoPessoa: 'JURIDICA',
      documento: '12345678000199',
    });
    await expect(service.solicitar(ong, ctx.item.id, {})).rejects.toMatchObject({ statusCode: 403 });
  });

  test('item inexistente retorna 404', async () => {
    await expect(service.solicitar(ctx.beneficiario, 999, {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('UC06 — Responder Solicitação', () => {
  let container;
  let service;
  let ctx;
  let outroBenef;

  beforeEach(async () => {
    container = createTestContainer();
    service = container.services.solicitacaoService;
    ctx = await cenarioBasico(container);
    outroBenef = await criarUsuario(container, {
      nome: 'Outro Beneficiário',
      email: 'outro@teste.com',
      tipo: 'BENEFICIARIO',
    });
  });

  test('doador lista as solicitações pendentes recebidas', async () => {
    await service.solicitar(ctx.beneficiario, ctx.item.id, { mensagem: 'Oi' });
    const lista = await service.listarRecebidas(ctx.doador, { status: 'PENDENTE' });

    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      mensagem: 'Oi',
      item: { titulo: 'Cadeira de escritório' },
      beneficiario: { nome: 'Beneficiário Teste' },
    });
  });

  test('aceitar: solicitação ACEITA, item RESERVADO e demais recusadas automaticamente', async () => {
    const s1 = await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    const s2 = await service.solicitar(outroBenef, ctx.item.id, {});

    const aceita = await service.aceitar(ctx.doador, s1.id);

    expect(aceita.status).toBe('ACEITA');
    expect((await container.repositories.itens.findById(ctx.item.id)).status).toBe('RESERVADO');
    expect((await container.repositories.solicitacoes.findById(s2.id)).status).toBe('RECUSADA');

    const [notifAceito] = await container.services.notificacaoService.listar(ctx.beneficiario.id);
    const [notifOutro] = await container.services.notificacaoService.listar(outroBenef.id);
    expect(notifAceito.mensagem).toContain('foi aceita');
    expect(notifOutro.mensagem).toContain('já foi reservado');
  });

  test('FA01: recusar mantém o item DISPONIVEL e notifica o beneficiário', async () => {
    const s = await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    const recusada = await service.recusar(ctx.doador, s.id);

    expect(recusada.status).toBe('RECUSADA');
    expect((await container.repositories.itens.findById(ctx.item.id)).status).toBe('DISPONIVEL');
    const [notif] = await container.services.notificacaoService.listar(ctx.beneficiario.id);
    expect(notif.mensagem).toContain('recusada');
  });

  test('FA02: item já reservado cancela a solicitação', async () => {
    const s = await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    await container.repositories.itens.updateStatus(ctx.item.id, 'DOADO');

    await expect(service.aceitar(ctx.doador, s.id)).rejects.toMatchObject({ statusCode: 409 });
    expect((await container.repositories.solicitacoes.findById(s.id)).status).toBe('CANCELADA');
  });

  test('não permite responder solicitação de item de outro doador', async () => {
    const s = await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    const outroDoador = await criarUsuario(container, {
      nome: 'Outro Doador',
      email: 'outrodoador@teste.com',
      tipo: 'DOADOR',
    });
    await expect(service.aceitar(outroDoador, s.id)).rejects.toMatchObject({ statusCode: 403 });
  });

  test('não permite responder duas vezes', async () => {
    const s = await service.solicitar(ctx.beneficiario, ctx.item.id, {});
    await service.recusar(ctx.doador, s.id);
    await expect(service.aceitar(ctx.doador, s.id)).rejects.toMatchObject({ statusCode: 409 });
  });
});
