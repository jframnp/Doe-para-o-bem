const { createTestContainer } = require('./helpers');

describe('RF01 — Cadastro de usuários e login', () => {
  let container;
  let auth;

  beforeEach(() => {
    container = createTestContainer();
    auth = container.services.authService;
  });

  const doador = {
    nome: 'Ana Souza',
    email: 'Ana@Email.com',
    senha: 'senha123',
    tipo: 'DOADOR',
    cidade: 'São Paulo',
  };

  test('cadastra doador, normaliza email e não expõe a senha', async () => {
    const { usuario, token } = await auth.registrar(doador);

    expect(usuario.email).toBe('ana@email.com');
    expect(usuario.verificado).toBe(true);
    expect(usuario).not.toHaveProperty('senhaHash');
    expect(token).toEqual(expect.any(String));
  });

  test('armazena a senha com hash (RNF02)', async () => {
    await auth.registrar(doador);
    const salvo = await container.repositories.usuarios.findByEmail('ana@email.com');
    expect(salvo.senhaHash).not.toBe('senha123');
    expect(salvo.senhaHash).toMatch(/^\$2[aby]\$/);
  });

  test('impede email duplicado', async () => {
    await auth.registrar(doador);
    await expect(auth.registrar(doador)).rejects.toMatchObject({ statusCode: 409 });
  });

  test('ONG começa com cadastro PENDENTE de aprovação', async () => {
    const { usuario } = await auth.registrar({
      ...doador,
      email: 'ong@email.com',
      tipo: 'BENEFICIARIO',
      tipoPessoa: 'JURIDICA',
      documento: '12.345.678/0001-99',
    });
    expect(usuario.statusVerificacao).toBe('PENDENTE');
    expect(usuario.verificado).toBe(false);
  });

  test('ONG sem CNPJ válido é rejeitada', async () => {
    await expect(
      auth.registrar({ ...doador, tipo: 'BENEFICIARIO', tipoPessoa: 'JURIDICA', documento: '123' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('não permite se cadastrar como ADMIN', async () => {
    await expect(auth.registrar({ ...doador, tipo: 'ADMIN' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('login com credenciais corretas devolve token válido', async () => {
    await auth.registrar(doador);
    const { token } = await auth.login({ email: 'ana@email.com', senha: 'senha123' });
    const usuario = await auth.autenticarToken(token);
    expect(usuario.nome).toBe('Ana Souza');
  });

  test('login com senha errada falha com 401', async () => {
    await auth.registrar(doador);
    await expect(auth.login({ email: 'ana@email.com', senha: 'errada' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test('token inválido é recusado', async () => {
    await expect(auth.autenticarToken('abc.def.ghi')).rejects.toMatchObject({ statusCode: 401 });
  });
});
