const multer = require('multer');
const AppError = require('../utils/AppError');
const { TIPOS_IMAGEM_ACEITOS } = require('../services/StorageService');

/**
 * Recebe a foto do item em memória e valida formato e tamanho (UC01, passo 4).
 * O arquivo é persistido depois pelo StorageService.
 */
function uploadFoto({ maxBytes }) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (req, file, cb) => {
      if (!TIPOS_IMAGEM_ACEITOS.includes(file.mimetype)) {
        return cb(new AppError('Formato de imagem inválido. Use JPG, PNG ou WEBP', 400));
      }
      cb(null, true);
    },
  }).single('foto');

  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        const mb = Math.round(maxBytes / 1024 / 1024);
        return next(new AppError(`A imagem deve ter no máximo ${mb} MB`, 400));
      }
      next(err);
    });
}

module.exports = { uploadFoto };
