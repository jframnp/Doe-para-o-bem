const TOKEN_KEY = 'dpb_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, detalhes) {
    super(message);
    this.status = status;
    this.detalhes = detalhes || [];
  }
}

/** Cliente HTTP da API REST. Envia o JWT automaticamente. */
async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(`/api${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([k, v]) => v && url.searchParams.set(k, v));

  const headers = {};
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: payload });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.erro || 'Erro ao comunicar com o servidor', res.status, data?.detalhes);
  }
  return data;
}

export const api = {
  meta: () => request('/meta'),

  registrar: (dados) => request('/auth/registro', { method: 'POST', body: dados }),
  login: (dados) => request('/auth/login', { method: 'POST', body: dados }),
  me: () => request('/auth/me'),

  buscarItens: (filtros) => request('/itens', { query: filtros }),
  meusItens: () => request('/itens/meus'),
  item: (id) => request(`/itens/${id}`),
  cadastrarItem: (formData) => request('/itens', { method: 'POST', body: formData }),

  solicitarItem: (itemId, mensagem) =>
    request(`/itens/${itemId}/solicitacoes`, { method: 'POST', body: { mensagem } }),
  solicitacoesRecebidas: (status) => request('/solicitacoes/recebidas', { query: { status } }),
  minhasSolicitacoes: () => request('/solicitacoes/minhas'),
  aceitarSolicitacao: (id) => request(`/solicitacoes/${id}/aceitar`, { method: 'PATCH' }),
  recusarSolicitacao: (id) => request(`/solicitacoes/${id}/recusar`, { method: 'PATCH' }),

  notificacoes: () => request('/notificacoes'),
  marcarNotificacaoLida: (id) => request(`/notificacoes/${id}/lida`, { method: 'PATCH' }),

  beneficiariosPendentes: () => request('/admin/beneficiarios/pendentes'),
  aprovarBeneficiario: (id) => request(`/admin/beneficiarios/${id}/aprovar`, { method: 'PATCH' }),
  rejeitarBeneficiario: (id, motivo) =>
    request(`/admin/beneficiarios/${id}/rejeitar`, { method: 'PATCH', body: { motivo } }),
};
