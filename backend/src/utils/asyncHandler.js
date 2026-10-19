/** Encaminha erros de handlers assíncronos para o errorHandler do Express. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
