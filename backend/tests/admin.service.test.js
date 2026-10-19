const { createTestContainer, criarUsuario } = require('./helpers');

describe('UC13 — Aprovar Beneficiário', () => {
  let container;
  let admin;
  let ong;

  beforeEach(async () => {
    container = createTestContainer();
    admin = container.services.adminService;
    ong = await criarUsuario(container, {
      nome: 'ONG Esperança',
      email: 'ong@teste.com',
      tipo: 'BENEFICIARIO',
      tipoPessoa: 'JURIDICA',
      documento: '12345678000199',
    });
  });

  test('lista beneficiários pendentes com o documento', async () => {
    const pendentes = await admin.listarBeneficiariosPendentes();
    expect(pendentes).toHaveLength(1);
    expect(pendentes[0]).toMatchObject({ nome: 'ONG Esperança', documento: '12345678000199' });
  });

  test('aprovar marca como verificado e notifica', async () => {
    const aprovado = await admin.aprovar(ong.id);
    expect(aprovado.verificado).toBe(true);
    expect(await admin.listarBeneficiariosPendentes()).toHaveLength(0);

    const [notif] = await container.services.notificacaoService.listar(ong.id);
    expect(notif.mensagem).toContain('aprovado');
  });

  test('FA01: rejeitar exige motivo e notifica com o motivo', async () => {
    await expect(admin.rejeitar(ong.id, {})).rejects.toMatchObject({ statusCode: 400 });

    const rejeitado = await admin.rejeitar(ong.id, { motivo: 'CNPJ inválido' });
    expect(rejeitado).toMatchObject({ statusVerificacao: 'REJEITADO', verificado: false });
    const [notif] = await container.services.notificacaoService.listar(ong.id);
    expect(notif.mensagem).toContain('CNPJ inválido');
  });

  test('não aprova usuário que não está pendente', async () => {
    await admin.aprovar(ong.id);
    await expect(admin.aprovar(ong.id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
