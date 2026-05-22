# MotoFinance

> **SaaS de gestão financeira para entregadores.** Mobile-first PWA.
> Janela MVP: 90 dias — M1 Validação → M2 Monetização → M3 Retenção + Stores.

[![Status](https://img.shields.io/badge/status-MVP--em--desenvolvimento-orange)]() [![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%2B%20PostgreSQL%20%2B%20TypeScript-blue)]() [![License](https://img.shields.io/badge/license-Proprietary-red)](./LICENSE)

**Repositório público** para fins de transparência e portfólio. Código sob licença proprietária — ver [LICENSE](./LICENSE).

## Início Rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local
# (editar .env.local com chaves Supabase)

# 3. Rodar em dev
pnpm dev   # localhost:3000
```

Passo-a-passo detalhado em [`SETUP.md`](./SETUP.md).

## Stack em 1 Tela

**Frontend.** Next.js 14 (App Router) + Tailwind + shadcn/ui + TypeScript estrito.
**Backend.** Next.js Server Actions + Route Handlers (webhooks/PDF).
**Banco de Dados.** **PostgreSQL 15+** (gerenciado via Supabase) + Row-Level Security.
**Auth + Storage.** Supabase Auth + Supabase Storage (camada sobre o Postgres).
**ORM.** Drizzle. **Validação.** Zod.
**Pagamento.** Asaas (PIX + cartão + boleto). **Push.** OneSignal.
**Hospedagem.** Localhost (M1) → Vercel (M2+) → App Store/Play Store via Capacitor (M3).

> Postgres é o coração do sistema. Supabase é apenas o provedor gerenciado — pode ser trocado por Neon, Railway, RDS ou self-hosted alterando apenas `DATABASE_URL`. O ORM Drizzle e os schemas são 100% portáveis.

Justificativa: [`docs/DECISIONS/0001-stack-lean-brasil.md`](./docs/DECISIONS/0001-stack-lean-brasil.md).

## Estrutura

```
motofinance/
├── README.md
├── SETUP.md
├── docs/                       # Single Source of Truth (SSOT)
│   ├── ROADMAP.md              # Milestones, épicos, dependências
│   ├── ARCHITECTURE.md         # Stack, schema, contratos
│   ├── AGENTS.md               # Personas de IA, escopo, regras
│   ├── TASKS.md                # Backlog atômico (T-NNN)
│   ├── CRITIQUE.md             # Análise estratégica (porquês)
│   └── DECISIONS/              # ADRs
├── apps/
│   └── web/                    # Next.js
├── packages/
│   ├── db/                     # Drizzle + Supabase client
│   ├── shared/                 # Tipos, validators, constants
│   └── ui/                     # Componentes shadcn customizados
└── .husky/                     # Commit hooks
```

## Para Agentes de IA

**Roteiro de leitura por sessão (ordem importa):**

1. `README.md` (este arquivo)
2. `docs/AGENTS.md` — identidade, escopo, regras de terminal
3. `docs/WORKFLOW.md` — se for sessão paralela multi-worktree
4. `docs/ROADMAP.md` — milestone atual
5. `docs/TASKS.md` — próxima task `pending` no seu escopo
6. `docs/ARCHITECTURE.md` — **apenas** a seção relevante (use âncoras `<!-- AGENT-SECTION: id -->`)
7. `docs/CRITIQUE.md` — apenas se houver dúvida sobre o **porquê** de uma decisão
8. `docs/DECISIONS/*.md` — escolhas históricas

## Princípios Inegociáveis

- **Mobile-first PWA**, offline-first nos 4 fluxos quentes (Ganho, Gasto, Combustível, Dashboard).
- **RLS sempre on** — toda tabela com `user_id` isolada.
- **Dinheiro em centavos (bigint)** — sem floats.
- **Idempotência por `client_id`** em toda mutação.
- **Touch target ≥56dp, contraste AAA, fonte base 18px.**
- **3 toques para registrar qualquer evento financeiro.**
- **Sem Redis no MVP. Sem microservices. Sem GraphQL.**

## Comandos Comuns

```bash
pnpm dev                    # Next.js em :3000
pnpm build                  # build de produção
pnpm typecheck              # tsc --noEmit em todos os packages
pnpm lint                   # eslint
pnpm format                 # prettier --write
pnpm test                   # vitest (unit)
pnpm test:e2e               # playwright
pnpm db:generate            # gera migration nova
pnpm db:migrate:dev         # aplica no DB local
pnpm db:studio              # drizzle-kit studio (UI)
```

## Status Atual

| Item         | Valor                                 |
| ------------ | ------------------------------------- |
| Milestone    | `M1 — Validação`                      |
| Sprint       | `S0 — Setup`                          |
| Próximo gate | 30+ beta users na comunidade WhatsApp |
| Modo         | Solo dev + IA, full-time              |

---

## Contribuindo

Issues e Pull Requests são bem-vindos para discussão e sugestões. Contribuições de código serão avaliadas caso a caso. Antes de abrir PR, leia [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) e [`docs/AGENTS.md`](./docs/AGENTS.md) para entender as convenções.

## Contato

Para parcerias, licenciamento comercial ou consultas: **atendimento@sniffydoc.com.br**

## Licença

Código sob licença proprietária — todos os direitos reservados. Ver [`LICENSE`](./LICENSE).
