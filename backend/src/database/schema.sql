-- DPB: Doe Para O Bem — esquema inicial (PostgreSQL)

CREATE TABLE IF NOT EXISTS usuarios (
  id                  SERIAL PRIMARY KEY,
  nome                VARCHAR(120) NOT NULL,
  email               VARCHAR(160) NOT NULL UNIQUE,
  senha_hash          VARCHAR(100) NOT NULL,
  tipo                VARCHAR(20)  NOT NULL CHECK (tipo IN ('DOADOR', 'BENEFICIARIO', 'ADMIN')),
  tipo_pessoa         VARCHAR(10)  NOT NULL DEFAULT 'FISICA' CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
  documento           VARCHAR(14),
  telefone            VARCHAR(20),
  cidade              VARCHAR(80)  NOT NULL,
  bairro              VARCHAR(80),
  status_verificacao  VARCHAR(10)  NOT NULL DEFAULT 'APROVADO'
                      CHECK (status_verificacao IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
  motivo_rejeicao     TEXT,
  verificado_em       TIMESTAMPTZ,
  criado_em           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens (
  id          SERIAL PRIMARY KEY,
  doador_id   INTEGER      NOT NULL REFERENCES usuarios(id),
  titulo      VARCHAR(120) NOT NULL,
  descricao   TEXT         NOT NULL,
  categoria   VARCHAR(20)  NOT NULL,
  condicao    VARCHAR(10)  NOT NULL CHECK (condicao IN ('NOVO', 'SEMINOVO', 'USADO')),
  cidade      VARCHAR(80)  NOT NULL,
  bairro      VARCHAR(80),
  imagem_url  TEXT,
  status      VARCHAR(12)  NOT NULL DEFAULT 'DISPONIVEL'
              CHECK (status IN ('DISPONIVEL', 'RESERVADO', 'DOADO', 'REMOVIDO')),
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para a busca por categoria e região (RNF03 — respostas < 3s)
CREATE INDEX IF NOT EXISTS idx_itens_status_categoria ON itens (status, categoria);
CREATE INDEX IF NOT EXISTS idx_itens_cidade ON itens (LOWER(cidade));
CREATE INDEX IF NOT EXISTS idx_itens_doador ON itens (doador_id);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id               SERIAL PRIMARY KEY,
  item_id          INTEGER     NOT NULL REFERENCES itens(id),
  beneficiario_id  INTEGER     NOT NULL REFERENCES usuarios(id),
  mensagem         TEXT,
  status           VARCHAR(12) NOT NULL DEFAULT 'PENDENTE'
                   CHECK (status IN ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA', 'CONCLUIDA')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  respondido_em    TIMESTAMPTZ
);

-- Garante no banco a regra do UC05/FA02: no máximo uma solicitação pendente por item e beneficiário
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitacao_pendente
  ON solicitacoes (item_id, beneficiario_id) WHERE status = 'PENDENTE';

CREATE TABLE IF NOT EXISTS notificacoes (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id),
  mensagem    TEXT        NOT NULL,
  lida        BOOLEAN     NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes (usuario_id);
