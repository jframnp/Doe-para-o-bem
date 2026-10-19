const AppError = require('../utils/AppError');
const itemDTO = require('../dtos/itemDTO');
const usuarioDTO = require('../dtos/usuarioDTO');
const { TipoUsuario, StatusItem } = require('../models/enums');

/**
 * RF02 / UC01 — Cadastrar Item
 * RF03 / UC04 — Buscar Itens
 */
class ItemService {
  constructor({ itemRepository, storageService }) {
    this.itens = itemRepository;
    this.storage = storageService;
  }

  async cadastrar(doador, body, foto) {
    if (doador.tipo !== TipoUsuario.DOADOR) {
      throw new AppError('Apenas doadores podem cadastrar itens', 403);
    }

    // UC01 passo 4 / FA01 — validação dos campos obrigatórios e da foto
    const dados = itemDTO.parseCadastro({
      ...body,
      cidade: body.cidade || doador.cidade,
      bairro: body.bairro || doador.bairro,
    });
    if (!foto) throw new AppError('Dados do item inválidos', 400, ['a foto do item é obrigatória']);

    // UC01 passo 5 / FA02 — upload da imagem
    let imagemUrl;
    try {
      imagemUrl = await this.storage.salvar(foto);
    } catch {
      throw new AppError('Falha no upload da imagem. Tente novamente', 502);
    }

    // UC01 passo 6 — item criado como DISPONIVEL e associado ao doador
    const item = await this.itens.create({ ...dados, imagemUrl, doadorId: doador.id });
    return { ...item, doador: usuarioDTO.toPublico(doador) };
  }

  buscar(query) {
    return this.itens.search({ ...itemDTO.parseFiltros(query), status: StatusItem.DISPONIVEL });
  }

  async detalhar(id) {
    const item = await this.itens.findById(id);
    if (!item || item.status === StatusItem.REMOVIDO) {
      throw new AppError('Item não encontrado', 404);
    }
    return item;
  }

  listarDoDoador(doador) {
    return this.itens.findByDoador(doador.id);
  }
}

module.exports = ItemService;
