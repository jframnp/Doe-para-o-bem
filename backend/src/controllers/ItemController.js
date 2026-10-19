class ItemController {
  constructor({ itemService }) {
    this.itemService = itemService;
  }

  cadastrar = async (req, res) => {
    const item = await this.itemService.cadastrar(req.usuario, req.body, req.file);
    res.status(201).json(item);
  };

  buscar = async (req, res) => {
    res.json(await this.itemService.buscar(req.query));
  };

  detalhar = async (req, res) => {
    res.json(await this.itemService.detalhar(req.params.id));
  };

  meus = async (req, res) => {
    res.json(await this.itemService.listarDoDoador(req.usuario));
  };
}

module.exports = ItemController;
