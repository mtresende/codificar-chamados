# Codificar Chamados

Solução full-stack para registro, acompanhamento e **distribuição automática** de chamados (tickets) internos.

O problema: em equipes pequenas, pedidos internos frequentemente se perdem em conversas de chat, e-mails soltos ou anotações físicas, sem rastreabilidade de quem é o responsável, qual a prioridade e em que estágio está o atendimento. Este sistema centraliza esses pedidos em uma fila única, atribui automaticamente cada novo chamado ao atendente com menor carga de trabalho e oferece uma visão clara do status de cada solicitação e da distribuição de carga da equipe.

---

## Sumário

- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura e Decisões de Design](#arquitetura-e-decisões-de-design)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Instalação e Execução Local](#instalação-e-execução-local)
- [Testes](#testes)
- [Bibliotecas Externas e Referências](#bibliotecas-externas-e-referências)
- [Estrutura do Repositório](#estrutura-do-repositório)

---

## Stack Tecnológica

### Backend (`/api`)

| Tecnologia | Versão | Finalidade |
| --- | --- | --- |
| **Go** | 1.27 | Linguagem do serviço HTTP |
| **chi** | v5 | Roteador HTTP (leve, idiomático, compatível com `net/http`) |
| **pgx / pgxpool** | v5 | Driver e pool de conexões PostgreSQL |
| **goose** | v3 | Migrations de banco de dados (executadas automaticamente no boot) |
| **go-playground/validator** | v10 | Validação declarativa de payloads |
| **godotenv** | v1 | Carregamento de variáveis de ambiente via `.env` |
| **testcontainers-go** | v0.44 | Testes de integração com PostgreSQL real em container |
| **PostgreSQL** | 16 (alpine) | Banco de dados relacional |

### Frontend (`/web`)

| Tecnologia | Versão | Finalidade |
| --- | --- | --- |
| **React** | 19 | Biblioteca de UI |
| **TypeScript** | 5.9 | Tipagem estática do frontend |
| **Vite** | 8 | Build tool e dev server (com proxy `/api` → `localhost:8080`) |
| **Tailwind CSS** | 4 | Estilização utility-first (plugin oficial `@tailwindcss/vite`) |
| **TanStack Query** | v5 | Gerenciamento de estado servidor (cache, invalidação, mutações otimistas) |
| **React Router** | v7 | Roteamento SPA |
| **openapi-fetch / openapi-typescript** | — | Cliente HTTP com tipos gerados a partir do `openapi.yaml` da API |
| **lucide-react** | — | Ícones |

### Infraestrutura local

- **Docker Compose** para subir o PostgreSQL 16 com volume persistente.

---

## Arquitetura e Decisões de Design

### Visão geral

A aplicação é composta por dois serviços em um único repositório (monorepo): um frontend React (SPA) que consome uma API REST escrita em Go, que por sua vez conversa com o PostgreSQL.

```
Browser ──▶ SPA React (Vite :5173) ──proxy /api──▶ API Go (chi :8080) ──▶ PostgreSQL 16
```

Separar frontend e backend permite que a interface evolua de forma independente e que a API seja reaproveitada por outros clientes no futuro.

### Backend (API)

- **Go + chi**: compilação rápida, binário único e um router minimalista.
- **pgx**: o driver PostgreSQL mais ativo e performático, com suporte nativo a transações e contexto.
- **Código organizado por responsabilidade**: um arquivo para HTTP (`handler`), um para banco de dados (`store`), um para a regra de distribuição (`assignment`) e um para os tipos do domínio (`model`) — cada parte pode ser testada e evoluída isoladamente.
- **Migrations executadas automaticamente ao iniciar o servidor**, sem passo manual de banco para rodar o projeto.
- **Contrato OpenAPI (`openapi.yaml`) como fonte única de verdade**: os tipos TypeScript do frontend são gerados a partir dele, evitando divergências entre as duas pontas.

### Banco de dados

Duas tabelas, deliberadamente simples:

- **`assignees`** — os atendentes. O campo `last_assigned_at` serve apenas para desempate na distribuição automática.
- **`tickets`** — os chamados. Prioridade e status têm valores restritos pelo próprio banco, e todo chamado sempre possui um responsável.

Há ainda um índice sobre os chamados ativos por responsável, que mantém a consulta de distribuição rápida mesmo com o histórico crescendo.

### Frontend (Web)

- **TanStack Query** cuida da comunicação com a API: cache, atualização e alterações "otimistas" (ex.: exclusão que reflete na hora e é desfeita se falhar).
- **Tipos gerados pelo contrato OpenAPI**: erros de integração entre as pontas são pegos em tempo de compilação, não em runtime.
- **Componentes organizados por responsabilidade** (tabela, badges, modais, cards de carga) e hooks que centralizam o acesso aos dados.
- **Tailwind CSS**: estilo junto do markup, sem CSS morto e com consistência visual entre componentes — a escolha de maior produtividade para uma equipe pequena e prazo curto.

---

## Funcionalidades Principais

### Gestão de chamados

- Crie, visualize, edite e exclua chamados. Cada chamado tem título, descrição, prioridade (baixa, média, alta), status (aberto, em andamento, resolvido, fechado), responsável e data/hora de abertura.
- A mudança de status é feita em um modal dedicado, acessado a partir dos detalhes do chamado.
- A exclusão sempre pede confirmação e, se a operação falhar, a lista é restaurada automaticamente.

### Responsáveis

- O sistema já vem com um conjunto fixo de responsáveis (Ana, Bruno e João), carregado na primeira execução.
- Ao abrir ou editar um chamado, é possível escolher um responsável específico ou deixar a atribuição por conta da distribuição automática.

### Distribuição automática

- Ao criar um chamado sem definir responsável — ou ao solicitar reatribuição — o sistema entrega o chamado a quem tiver **menos chamados em andamento** naquele momento.
- Um chamado só conta como carga de trabalho enquanto está **aberto** ou **em andamento**: resolvidos e fechados não pesam mais para o atendente. Assim, a distribuição reflete o trabalho realmente pendente.
- Em caso de empate, recebe o chamado quem está há mais tempo sem receber, equilibrando a equipe ao longo do tempo (efeito round-robin).
- A página **Distribuição** mostra a carga atual de cada responsável e sugere quem deveria receber o próximo chamado, com atalho para atribuir diretamente.

### Listagem e acompanhamento

- Dashboard com contadores por situação: total, abertos, em andamento e resolvidos.
- Tabela com busca por título e descrição e filtros combináveis por status, prioridade e responsável.
- Badges coloridos de prioridade e status facilitam a leitura rápida da fila.
- Clicar no título de um chamado abre a tela de detalhes, de onde é possível editar ou alterar o status.

O contrato completo da API (rotas, payloads e respostas) está documentado em [`api/openapi.yaml`](api/openapi.yaml).

---

## Instalação e Execução Local

### Pré-requisitos

- **Docker** e **Docker Compose** (para o PostgreSQL)
- **Go 1.27+**
- **Node.js 20+** e npm

### 1. Clonar o repositório

```bash
git clone https://github.com/mtresende/codificar-chamados.git
cd codificar-chamados
```

### 2. Configurar o ambiente

O repositório já inclui os arquivos `.env` necessários. Caso precise recriá-los:

**Raiz** (credenciais usadas pelo Docker Compose):

```env
POSTGRES_DB=<nome_do_banco>
POSTGRES_USER=<usuario>
POSTGRES_PASSWORD=<senha>
```

**`api/.env`**:

```env
DATABASE_URL=postgres://<usuario>:<senha>@<host>:<porta>/<nome_do_banco>?sslmode=disable
```

**`web/.env`**:

```env
VITE_API_BASE_URL=/api
```

> O frontend usa o proxy do Vite (`/api` → `http://localhost:8080`), então não há necessidade de configurar CORS para desenvolvimento.

### 3. Subir o banco de dados

```bash
docker compose up -d postgres
```

### 4. Executar a API

```bash
cd api
go run ./cmd/server
```

O servidor aplica **automaticamente as migrations e o seed** (goose) ao iniciar e passa a escutar em `http://localhost:8080`. Não há passo manual de migrate nem de carga de dados iniciais.

### 5. Executar o frontend

Em outro terminal:

```bash
cd web
npm install
npm run dev
```

Acesse **http://localhost:5173**. Os responsáveis iniciais (Ana, Bruno e João) já estarão cadastrados pelo seed.

---

## Testes

### Backend (API)

A suíte de testes usa **testcontainers-go** para subir um PostgreSQL 16 real e efêmero a cada execução — não há mocks de banco. Isso garante que as consultas mais sensíveis, como o lock `FOR UPDATE` na distribuição automática e o índice parcial de chamados em aberto, sejam validadas contra o motor real, e não contra uma simulação em memória.

**Pré-requisito:** Docker em execução. Na primeira execução, o `go test` baixa a imagem `postgres:16-alpine`, então a primeira rodada pode demorar um pouco mais; as seguintes levam poucos segundos.

```bash
cd api
go test ./...
```

Flags úteis durante o desenvolvimento:

```bash
go test ./... -v            # saída detalhada, teste por teste
go test ./... -count=1      # ignora o cache de resultados
go test ./... -race         # detecta race conditions (recomendado no teste de concorrência)
go test ./... -run TestStore_Create_AutoAssign  # roda só um teste específico
```

O que cada arquivo cobre, em `api/internal/`:

| Arquivo | Pacote | Cobertura |
|---|---|---|
| `tickets/setup_test.go` | `tickets_test` | `TestMain`: sobe o container Postgres, roda as migrations e expõe `resetDB()` para reiniciar o estado a cada teste |
| `tickets/store_test.go` | `tickets_test` | Persistência (CRUD), filtros de listagem (status, prioridade, responsável, busca), distribuição automática (menor carga, desempate, chamados resolvidos não contam), reatribuição manual, e um teste de concorrência que valida o `FOR UPDATE` com 9 criações simultâneas |
| `tickets/handler_test.go` | `tickets_test` | Contrato HTTP: ciclo de vida completo de um chamado (create → get → update → delete → 404) e uma tabela de status codes para payloads inválidos, IDs inexistentes e validação |
| `httpx/httpx_test.go` | `httpx_test` | Helpers puros: formato de erro em JSON, rejeição de campos desconhecidos no `DecodeJSON`, e comportamento do middleware de CORS no preflight |

Os testes de `tickets` são de integração (dependem do Postgres); os de `httpx` são unitários e rodam em milissegundos, sem Docker.

### Frontend (Web)

```bash
cd web
npm run lint   # ESLint
npm run build  # verificação de tipos (tsc) + build de produção
```

## Bibliotecas Externas e Referências

### Backend

| Pacote | Finalidade |
| --- | --- |
| [`go-chi/chi`](https://github.com/go-chi/chi) | Router HTTP minimalista sobre `net/http` |
| [`jackc/pgx`](https://github.com/jackc/pgx) | Driver PostgreSQL de alta performance + pool de conexões |
| [`pressly/goose`](https://github.com/pressly/goose) | Migrations SQL versionadas |
| [`go-playground/validator`](https://github.com/go-playground/validator) | Validação estrutural via tags |
| [`joho/godotenv`](https://github.com/joho/godotenv) | Carregamento de `.env` |
| [`testcontainers-go`](https://github.com/testcontainers/testcontainers-go) (+ módulo postgres) | Containers efêmeros para testes de integração |

### Frontend

| Pacote | Finalidade |
| --- | --- |
| [`@tanstack/react-query`](https://tanstack.com/query) | Estado servidor: cache, invalidação, mutações otimistas |
| [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/) / [`openapi-typescript`](https://openapi-ts.dev/openapi-typescript/) | Cliente HTTP tipado gerado a partir do `openapi.yaml` |
| [`react-router-dom`](https://reactrouter.com/) | Roteamento SPA |
| [`tailwindcss`](https://tailwindcss.com/) (+ `@tailwindcss/vite`) | Framework CSS utility-first |
| [`lucide-react`](https://lucide.dev/) | Biblioteca de ícones |
| [`axios`](https://axios-http.com/) | Cliente HTTP auxiliar |

### Referências

- Contrato da API: [`api/openapi.yaml`](api/openapi.yaml)
- Documentação do PostgreSQL sobre [índices parciais](https://www.postgresql.org/docs/current/indexes-partial.html) e [locking](https://www.postgresql.org/docs/current/explicit-locking.html)

---

## Estrutura do Repositório

```
.
├─ docker-compose.yml        # PostgreSQL 16 para desenvolvimento
├─ api/                      # Serviço HTTP em Go
│  ├─ cmd/server/main.go     # Entrypoint: env, migrations, pool, rotas
│  ├─ internal/
│  │  ├─ tickets/            # Domínio: handler, store, model, assignment (+ testes)
│  │  └─ httpx/              # Helpers de JSON, erros e CORS
│  ├─ migrations/            # Schema inicial + seed de responsáveis
│  └─ openapi.yaml           # Contrato da API (fonte dos tipos do frontend)
└─ web/                      # SPA React + TypeScript
   └─ src/
      ├─ api/                # Cliente OpenAPI tipado, hooks de dados, query keys
      ├─ components/         # Tabela, badges, modais, cards de carga, layout
      ├─ hooks/              # useTickets, useAssignees, useAssigneeWorkload
      ├─ pages/              # Dashboard (chamados) e Distribuição (carga)
      └─ types/              # Tipos de domínio do frontend
```
