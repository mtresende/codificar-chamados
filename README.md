# Codificar Chamados — API

API simples de chamados (tickets) para atribuição automática e gestão de responsáveis.

**Visão geral**
- Serviço HTTP escrito em Go; router `chi`, driver `pgx`/`pgxpool` para Postgres.
- Estrutura modular: `cmd/server` (entry), `internal/tickets` (handlers, store, lógica), `internal/httpx` (helpers JSON/erros).

**Endpoints principais**
- `GET /api/tickets` — lista chamados. Query: `status`, `priority`, `assignee_id`, `search`.
- `POST /api/tickets` — cria chamado. Payload: `TicketInput` (se `assignee_id==0` faz atribuição automática).
- `GET /api/tickets/{id}` — obtém um chamado.
- `PUT /api/tickets/{id}` — atualiza chamado. Payload: `TicketInput` + `status` + `auto_reassign` (bool).
- `GET /api/assignees` — lista responsáveis.
- `GET /api/assignees/workload` — carga por responsável (contagem de chamados "abertos").

**Modelos importantes**
- `Ticket`, `TicketInput`, `Assignee` — enums `Status` (`open`, `in_progress`, `resolved`, `closed`) e `Priority` (`low`, `medium`, `high`).

**Fluxo do sistema**
- Requisição → `tickets.Handler` (validação com `go-playground/validator`) → `Store` → banco.
- Criação/edição podem chamar `PickAssignee` dentro de transação: bloqueio (`FOR UPDATE`), escolha do responsável com menor número de chamados ativos e desempate por `last_assigned_at`.
- Após atribuição, `last_assigned_at` do responsável é atualizado.

**Banco de dados**
- Migrations em `migrations/` (goose-style). Tabelas principais: `assignees`, `tickets`. Índice: `tickets_active_by_assignee` para chamados ativos por responsável.

**Como executar**
1. Defina `DATABASE_URL` para o Postgres.
2. Executar: `go run ./cmd/server` (escuta em `:8080`).

**Estrutura do projeto (resumo)**
- `cmd/server/main.go` — entrypoint e rotas.
- `internal/tickets/` — `handler.go`, `store.go`, `model.go`, `assignment.go` (lógica de atribuição).
- `internal/httpx/` — utilitários JSON e erros.
- `migrations/` — SQL de criação e seed.

Observação: o front-end será implementado no mesmo repositório (p.ex. em `/web` ou `/frontend`) e consumirá estes endpoints.

**Árvore de diretórios (compacta)**
```
.
├─ cmd/
│  └─ server/
│     └─ main.go
├─ internal/
│  ├─ httpx/
│  │  ├─ json.go
│  │  └─ errors.go
│  └─ tickets/
│     ├─ assignment.go
│     ├─ handler.go
│     ├─ model.go
│     └─ store.go
├─ migrations/
│  ├─ 20260923165058_init.sql
│  └─ 20260923165219_seed_assignees.sql
└─ README.md
```

---
Arquivo gerado automaticamente: [README.md](README.md)
