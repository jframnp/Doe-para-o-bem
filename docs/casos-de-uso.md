# Casos de uso implementados na Sprint 1

As especificações completas estão no documento do projeto (seção 5.2). Aqui está o mapeamento de **cada passo e fluxo alternativo para o código** que o implementa.

---

## UC01: Cadastrar Item

**Ator:** Doador · **Requisito:** RF02

| Passo / Fluxo | Implementação |
|---|---|
| 1–2. Formulário com foto, título, descrição, categoria, condição e localização | `frontend/src/pages/CadastrarItem.jsx` |
| 4. Validar campos obrigatórios, formato e tamanho da imagem | `backend/src/dtos/itemDTO.js` (`parseCadastro`), `backend/src/middlewares/upload.js` (JPG/PNG/WEBP, máx. 5 MB) |
| 5. Armazenar imagem e obter URL | `backend/src/services/StorageService.js` (disco local; mesma interface para S3/Cloudinary) |
| 6. Registrar item `DISPONIVEL` associado ao doador | `ItemService.cadastrar` |
| 7. Exibir a página do item | redireciona para `/itens/:id` |
| **FA01:** dados inválidos | resposta `400` com a lista `detalhes`, exibida no formulário |
| **FA02:** falha no upload | resposta `502` "Falha no upload da imagem. Tente novamente" |
| **FA03:** cancelar | botão "Cancelar" volta à página anterior |

## UC05: Solicitar Item

**Ator:** Beneficiário · **Requisito:** RF04

| Passo / Fluxo | Implementação |
|---|---|
| 1–2. Página de detalhes do item | `frontend/src/pages/ItemDetalhe.jsx`, `GET /api/itens/:id` |
| 3–5. Botão "Solicitar Item" e mensagem opcional | `ItemDetalhe.jsx` |
| 7. Registrar solicitação `PENDENTE` (item continua `DISPONIVEL`) | `SolicitacaoService.solicitar` |
| 8. Notificar o doador | `NotificacaoService.notificar` |
| 9. Confirmar envio ao beneficiário | alerta de sucesso na tela |
| **FA01:** item indisponível | `409` "Este item não está mais disponível" |
| **FA02:** solicitação duplicada | `409` + índice único parcial no PostgreSQL (`uq_solicitacao_pendente`) |
| **FA03:** não logado | redireciona para `/entrar` e volta ao item depois do login |
| Regra extra (UC13) | ONG não aprovada recebe `403` |

## UC06: Responder Solicitação

**Ator:** Doador · **Requisitos:** RF05, RF06

| Passo / Fluxo | Implementação |
|---|---|
| 1–2. Lista de solicitações pendentes (item, beneficiário, mensagem, data) | `frontend/src/pages/SolicitacoesRecebidas.jsx`, `GET /api/solicitacoes/recebidas` |
| 4. Verificar se o item ainda está disponível | `SolicitacaoService.aceitar` |
| 5–7. Solicitação `ACEITA`, item `RESERVADO`, demais pendentes `RECUSADA` | `SolicitacaoRepository.aceitar`, em **uma transação** no PostgreSQL |
| 8–9. Notificar beneficiário aceito e os demais | `SolicitacaoService.aceitar` |
| **FA01:** recusar | `SolicitacaoService.recusar`: status `RECUSADA`, item continua `DISPONIVEL` |
| **FA02:** item já reservado/doado | solicitação vira `CANCELADA` e retorna `409` |
| **FA03:** cancelar | nenhuma alteração é feita até o clique em Aceitar/Recusar |

## UC13: Aprovar Beneficiário (adiantado)

**Ator:** Administrador · **Requisito:** RF10

| Passo / Fluxo | Implementação |
|---|---|
| 1–2. Lista de beneficiários pendentes (nome, tipo, data, documento) | `frontend/src/pages/AdminBeneficiarios.jsx`, `AdminService.listarBeneficiariosPendentes` |
| 5–8. Aprovar, registrar data da verificação e notificar | `AdminService.aprovar` |
| **FA01:** rejeitar com motivo | `AdminService.rejeitar` (motivo obrigatório) |
| **FA02:** solicitar documentos adicionais | ⏳ próxima sprint (depende do upload de documentos) |

---

## Testes automatizados

| Arquivo | O que cobre |
|---|---|
| `backend/tests/auth.service.test.js` | RF01, RNF02 (hash, JWT, email duplicado, ONG pendente) |
| `backend/tests/item.service.test.js` | UC01 (fluxo principal, FA01, FA02) e RF03 (filtros) |
| `backend/tests/solicitacao.service.test.js` | UC05 (FA01, FA02, ONG pendente) e UC06 (aceite, recusa automática, FA01, FA02) |
| `backend/tests/admin.service.test.js` | UC13 (aprovar, rejeitar com motivo) |
| `backend/tests/api.test.js` | Fluxo completo via HTTP: cadastro → item → busca → solicitação → aceite |

Cobertura atual das regras de negócio (`services/` + `dtos/`): **~88% das linhas** (meta RNF07: > 70%).
