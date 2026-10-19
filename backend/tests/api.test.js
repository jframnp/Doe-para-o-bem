const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestContainer } = require('./helpers');

/**
 * Teste de integração da API: percorre o fluxo completo
 * cadastro -> doar item -> buscar -> solicitar -> aceitar.
 */
describe('API — fluxo completo de doação', () => {
  let app;

  beforeAll(() => {
    app = createApp(createTestContainer());
  });

  const registrar = (dados) =>
    request(app)
      .post('/api/auth/registro')
      .send({ senha: '123456', cidade: 'São Paulo', ...dados });

  test('cadastro, item, solicitação e aceite', async () => {
    const doador = await registrar({ nome: 'Doador API', email: 'd@api.com', tipo: 'DOADOR' });
    expect(doador.status).toBe(201);
    const tokenDoador = doador.body.token;

    const benef = await registrar({ nome: 'Benef API', email: 'b@api.com', tipo: 'BENEFICIARIO' });
    const tokenBenef = benef.body.token;

    // UC01 — cadastrar item (multipart com foto)
    const item = await request(app)
      .post('/api/itens')
      .set('Authorization', `Bearer ${tokenDoador}`)
      .field('titulo', 'Ventilador de mesa')
      .field('descricao', 'Ventilador 40cm funcionando')
      .field('categoria', 'ELETRONICOS')
      .field('condicao', 'USADO')
      .attach('foto', Buffer.from('fake-png'), { filename: 'foto.png', contentType: 'image/png' });
    expect(item.status).toBe(201);

    // RF03 — busca pública
    const busca = await request(app).get('/api/itens').query({ categoria: 'ELETRONICOS' });
    expect(busca.body.map((i) => i.titulo)).toContain('Ventilador de mesa');

    // UC05 — solicitar
    const solicitacao = await request(app)
      .post(`/api/itens/${item.body.id}/solicitacoes`)
      .set('Authorization', `Bearer ${tokenBenef}`)
      .send({ mensagem: 'Minha casa é muito quente' });
    expect(solicitacao.status).toBe(201);

    // UC06 — doador vê e aceita
    const recebidas = await request(app)
      .get('/api/solicitacoes/recebidas?status=PENDENTE')
      .set('Authorization', `Bearer ${tokenDoador}`);
    expect(recebidas.body).toHaveLength(1);

    const aceite = await request(app)
      .patch(`/api/solicitacoes/${solicitacao.body.id}/aceitar`)
      .set('Authorization', `Bearer ${tokenDoador}`);
    expect(aceite.status).toBe(200);
    expect(aceite.body.status).toBe('ACEITA');

    // Item reservado some da busca
    const buscaDepois = await request(app).get('/api/itens');
    expect(buscaDepois.body).toHaveLength(0);

    // Beneficiário recebeu notificação
    const notificacoes = await request(app)
      .get('/api/notificacoes')
      .set('Authorization', `Bearer ${tokenBenef}`);
    expect(notificacoes.body[0].mensagem).toContain('foi aceita');
  });

  test('rotas protegidas exigem login', async () => {
    const res = await request(app).get('/api/solicitacoes/recebidas');
    expect(res.status).toBe(401);
  });

  test('beneficiário não pode cadastrar item', async () => {
    const benef = await registrar({ nome: 'Outro Benef', email: 'ob@api.com', tipo: 'BENEFICIARIO' });
    const res = await request(app)
      .post('/api/itens')
      .set('Authorization', `Bearer ${benef.body.token}`)
      .field('titulo', 'Teste');
    expect(res.status).toBe(403);
  });

  test('rejeita imagem em formato inválido', async () => {
    const doador = await registrar({ nome: 'Doador PDF', email: 'pdf@api.com', tipo: 'DOADOR' });
    const res = await request(app)
      .post('/api/itens')
      .set('Authorization', `Bearer ${doador.body.token}`)
      .attach('foto', Buffer.from('%PDF'), { filename: 'doc.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    expect(res.body.erro).toContain('Formato de imagem inválido');
  });

  test('erros de validação retornam detalhes', async () => {
    const res = await registrar({ nome: 'A', email: 'invalido', tipo: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.detalhes.length).toBeGreaterThanOrEqual(3);
  });
});
