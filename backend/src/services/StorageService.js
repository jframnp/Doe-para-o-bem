const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

/**
 * Armazena imagens no disco local e devolve a URL pública.
 * Mantém a mesma interface (salvar(arquivo) -> url) que uma futura
 * implementação com AWS S3 ou Cloudinary, prevista na arquitetura.
 */
class LocalStorageService {
  constructor({ diretorio }) {
    this.diretorio = path.resolve(diretorio);
  }

  async salvar(arquivo) {
    await fs.mkdir(this.diretorio, { recursive: true });
    const nome = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSOES[arquivo.mimetype] || ''}`;
    await fs.writeFile(path.join(this.diretorio, nome), arquivo.buffer);
    return `/uploads/${nome}`;
  }
}

module.exports = { LocalStorageService, TIPOS_IMAGEM_ACEITOS: Object.keys(EXTENSOES) };
