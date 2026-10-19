export const ROTULOS_CATEGORIA = {
  ROUPAS: 'Roupas',
  MOVEIS: 'Móveis',
  ELETRONICOS: 'Eletrônicos',
  LIVROS: 'Livros',
  BRINQUEDOS: 'Brinquedos',
  UTENSILIOS: 'Utensílios',
  OUTROS: 'Outros',
};

export const ROTULOS_CONDICAO = { NOVO: 'Novo', SEMINOVO: 'Seminovo', USADO: 'Usado' };

export const ROTULOS_STATUS = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  DOADO: 'Doado',
};

export const formatarData = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
