const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { autenticar, autorizar } = require('../middlewares/auth');
const { uploadFoto } = require('../middlewares/upload');
const { TipoUsuario, Categoria, Condicao } = require('../models/enums');

const { DOADOR, BENEFICIARIO, ADMIN } = TipoUsuario;

function createRoutes({ controllers, authService, config }) {
  const { auth, itens, solicitacoes, admin, notificacoes } = controllers;
  const router = Router();
  const logado = autenticar(authService);

  router.get('/health', (req, res) => res.json({ status: 'ok' }));
  router.get('/meta', (req, res) =>
    res.json({ categorias: Object.values(Categoria), condicoes: Object.values(Condicao) }),
  );

  // RF01 — cadastro e autenticação
  router.post('/auth/registro', h(auth.registrar));
  router.post('/auth/login', h(auth.login));
  router.get('/auth/me', logado, h(auth.me));

  // RF02 / RF03 — itens
  router.get('/itens', h(itens.buscar));
  router.get('/itens/meus', logado, autorizar(DOADOR), h(itens.meus));
  router.get('/itens/:id', h(itens.detalhar));
  router.post(
    '/itens',
    logado,
    autorizar(DOADOR),
    uploadFoto({ maxBytes: config.maxImageSizeBytes }),
    h(itens.cadastrar),
  );

  // RF04 — solicitar item
  router.post('/itens/:id/solicitacoes', logado, autorizar(BENEFICIARIO), h(solicitacoes.solicitar));

  // RF05 / RF06 — solicitações
  router.get('/solicitacoes/recebidas', logado, autorizar(DOADOR), h(solicitacoes.recebidas));
  router.get('/solicitacoes/minhas', logado, autorizar(BENEFICIARIO), h(solicitacoes.minhas));
  router.patch('/solicitacoes/:id/aceitar', logado, autorizar(DOADOR), h(solicitacoes.aceitar));
  router.patch('/solicitacoes/:id/recusar', logado, autorizar(DOADOR), h(solicitacoes.recusar));

  // RF12 — notificações
  router.get('/notificacoes', logado, h(notificacoes.listar));
  router.patch('/notificacoes/:id/lida', logado, h(notificacoes.marcarLida));

  // RF10 — administração
  router.get('/admin/beneficiarios/pendentes', logado, autorizar(ADMIN), h(admin.pendentes));
  router.patch('/admin/beneficiarios/:id/aprovar', logado, autorizar(ADMIN), h(admin.aprovar));
  router.patch('/admin/beneficiarios/:id/rejeitar', logado, autorizar(ADMIN), h(admin.rejeitar));

  return router;
}

module.exports = { createRoutes };
