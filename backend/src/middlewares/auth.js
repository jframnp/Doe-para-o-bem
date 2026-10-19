const AppError = require('../utils/AppError');

/** Exige um token JWT válido e carrega o usuário em req.usuario. */
function autenticar(authService) {
  return async (req, res, next) => {
    try {
      const [tipo, token] = (req.headers.authorization || '').split(' ');
      if (tipo !== 'Bearer' || !token) {
        throw new AppError('Faça login para continuar', 401);
      }
      req.usuario = await authService.autenticarToken(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Restringe a rota a determinados tipos de usuário. */
function autorizar(...tipos) {
  return (req, res, next) => {
    if (!tipos.includes(req.usuario.tipo)) {
      return next(new AppError('Você não tem permissão para esta ação', 403));
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
