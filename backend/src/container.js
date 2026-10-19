const env = require('./config/env');
const { createRepositories } = require('./repositories');
const AuthService = require('./services/AuthService');
const ItemService = require('./services/ItemService');
const SolicitacaoService = require('./services/SolicitacaoService');
const AdminService = require('./services/AdminService');
const NotificacaoService = require('./services/NotificacaoService');
const { LocalStorageService } = require('./services/StorageService');
const AuthController = require('./controllers/AuthController');
const ItemController = require('./controllers/ItemController');
const SolicitacaoController = require('./controllers/SolicitacaoController');
const AdminController = require('./controllers/AdminController');
const NotificacaoController = require('./controllers/NotificacaoController');

/**
 * Composition root: monta as camadas (Repository -> Service -> Controller)
 * e injeta as dependências. Nos testes, recebe implementações alternativas.
 */
function createContainer(overrides = {}) {
  const config = { ...env, ...overrides.config };
  const repos = overrides.repositories || createRepositories(config.dbDriver);
  const storageService =
    overrides.storageService || new LocalStorageService({ diretorio: config.uploadDir });

  const notificacaoService = new NotificacaoService({ notificacaoRepository: repos.notificacoes });
  const authService = new AuthService({
    usuarioRepository: repos.usuarios,
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn,
  });
  const itemService = new ItemService({ itemRepository: repos.itens, storageService });
  const solicitacaoService = new SolicitacaoService({
    solicitacaoRepository: repos.solicitacoes,
    itemRepository: repos.itens,
    notificacaoService,
  });
  const adminService = new AdminService({ usuarioRepository: repos.usuarios, notificacaoService });

  return {
    config,
    repositories: repos,
    authService,
    services: { authService, itemService, solicitacaoService, adminService, notificacaoService },
    controllers: {
      auth: new AuthController({ authService }),
      itens: new ItemController({ itemService }),
      solicitacoes: new SolicitacaoController({ solicitacaoService }),
      admin: new AdminController({ adminService }),
      notificacoes: new NotificacaoController({ notificacaoService }),
    },
  };
}

module.exports = { createContainer };
