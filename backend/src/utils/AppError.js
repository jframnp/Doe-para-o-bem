/**
 * Erro de negócio com status HTTP associado.
 * Lançado pelos services e convertido em resposta pelo errorHandler.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, detalhes) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
