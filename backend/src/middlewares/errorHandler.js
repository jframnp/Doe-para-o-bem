const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message, detalhes: err.detalhes });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { notFound, errorHandler };
