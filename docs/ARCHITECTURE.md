---
file: ARCHITECTURE.md
version: 1.1
last_updated: 2026-05-22
owner: tech-lead
purpose: Contrato técnico canônico. Toda decisão de código deriva daqui.
read_when: IA vai escrever código, criar arquivo, modificar schema, ou desenhar endpoint.
---

# ARCHITECTURE.md — MotoFinance

## Estratégia de Deploy por Milestone

| Milestone | Ambiente     | Hospedagem                                                                                          |
| --------- | ------------ | --------------------------------------------------------------------------------------------------- |
| **M1**    | Local        | `localhost:3000` + Supabase cloud (free tier). Sem CI/CD. Beta via ngrok ou compartilhamento local. |
| **M2**    | Produção web | Vercel + Supabase paid + Sentry + PostHog + domínio próprio.                                        |
| **M3**    | Stores       | Capacitor empacota o PWA → IPA (App Store) + AAB (Play Store).                                      |

---

## Princípios Inegociáveis

0. **Banco de Dados é PostgreSQL** (versão 15+). Esquema, queries, tipos, migrations — tudo derivado de Postgres puro via Drizzle ORM. Supabase é apenas um _provedor gerenciado_ convenientemente integrado com Auth e Storage. Migrar para outro provedor Postgres (Neon, Railway, RDS, self-hosted) significa trocar `DATABASE_URL` e reimplementar Auth — o domínio de aplicação é intocado.
1. **Mobile-first PWA**, instalável. Capacitor entra em M3 (não opcional — necessário para stores).
2. **Offline-first** para os 4 fluxos quentes: Ganho, Gasto, Combustível, Dashboard.
3. **Server-authoritative** para dados financeiros — cliente nunca calcula lucro final; sempre lê do servidor.
4. **Row-Level Security (RLS) ativada em todas as tabelas de usuário**. Sem exceção.
5. **Type-safety end-to-end**: schema Drizzle → tipos TS → validators Zod → componentes.
6. **Sem prematura otimização**: nada de Redis, microservices, mensageria, GraphQL no MVP.
7. **Cada PR toca 1 escopo** definido em `AGENTS.md`. Sem PRs multi-domínio.

---

## Stack Final

<!-- AGENT-SECTION: stack -->

| Camada             | Tecnologia                                                                                                   | Versão alvo |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ----------- |
| Frontend           | Next.js (App Router)                                                                                         | 14.x        |
| UI                 | Tailwind CSS + shadcn/ui                                                                                     | latest      |
| Linguagem          | TypeScript                                                                                                   | 5.x estrito |
| Backend            | Next.js Route Handlers + Server Actions                                                                      | nativo      |
| **Banco de Dados** | **PostgreSQL** (provedor: Supabase — trocável por Neon/Railway/RDS)                                          | **15+**     |
| Auth               | Supabase Auth (email + OTP SMS opcional) — pode ser trocada por Auth.js + JWT custom se mudar provedor de DB | latest      |
| ORM                | Drizzle ORM                                                                                                  | latest      |
| Validação          | Zod                                                                                                          | latest      |
| Pagamento          | Asaas (PIX + cartão + boleto)                                                                                | API v3      |
| Push               | OneSignal Web Push                                                                                           | latest      |
| Erros              | Sentry                                                                                                       | latest      |
| Analytics          | PostHog (cloud)                                                                                              | latest      |
| Hospedagem         | Vercel (M2+) / `localhost` (M1)                                                                              | —           |
| App Wrapper        | Capacitor (iOS + Android, M3)                                                                                | 6.x         |
| PDF                | `@react-pdf/renderer`                                                                                        | latest      |
| Storage            | Supabase Storage (logos, comprovantes)                                                                       | latest      |

**Justificativa registrada em** `docs/DECISIONS/0001-stack-lean-brasil.md`.

---

## Estrutura de Diretórios

<!-- AGENT-SECTION: dir-structure -->

```
motofinance/
├── README.md
├── docs/
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md         ← este arquivo
│   ├── AGENTS.md
│   ├── TASKS.md
│   ├── DECISIONS/
│   └── prompts/
├── apps/
│   └── web/                    ← Next.js app
│       ├── app/
│       │   ├── (auth)/         ← rotas públicas (login, signup)
│       │   ├── (app)/          ← rotas autenticadas
│       │   │   ├── dashboard/
│       │   │   ├── ganhos/
│       │   │   ├── gastos/
│       │   │   ├── combustivel/
│       │   │   ├── relatorios/
│       │   │   └── perfil/
│       │   ├── api/            ← Route Handlers (webhooks, PDF, etc.)
│       │   │   ├── webhooks/asaas/
│       │   │   └── pdf/extrato/
│       │   └── layout.tsx
│       ├── components/         ← UI específica
│       ├── lib/                ← clients (supabase, asaas), utils
│       ├── actions/            ← Server Actions
│       └── public/
├── packages/
│   ├── db/
│   │   ├── schema/             ← Drizzle schemas
│   │   ├── migrations/
│   │   └── client.ts
│   ├── ui/                     ← componentes shadcn customizados
│   └── shared/
│       ├── types/
│       ├── validators/         ← schemas Zod compartilhados
│       └── constants/          ← planos, limites, plataformas
├── .claude/
│   └── settings.json
├── .env.example
└── package.json
```

**Regra de ouro:** se a lógica é compartilhada entre Route Handler e Server Action, mora em `packages/shared` ou `packages/db`. Nunca duplicar.

---

## Convenções de Código

<!-- AGENT-SECTION: conventions -->

### Naming

- Arquivos: `kebab-case.ts`.
- Componentes React: `PascalCase` em `kebab-case.tsx` (export default).
- Hooks: `useCamelCase` em `use-kebab-case.ts`.
- Server Actions: prefixadas com verbo: `createEarning`, `deleteFuelEntry`.
- Tipos: `PascalCase`. Sufixo `Input` para validators de entrada (`CreateEarningInput`).
- Constantes: `SCREAMING_SNAKE_CASE`.

### Imports

- Path alias `@/*` para `apps/web/*`.
- Path alias `@db/*`, `@ui/*`, `@shared/*` para packages.
- Ordem: react → libs externas → aliases internos → relativo.

### Componentes

- Server Components por padrão. `"use client"` apenas quando precisar de estado, evento, ou browser API.
- Forms: React Hook Form + Zod resolver. Sem state manual de form.
- Sem CSS inline; sem styled-components. Apenas Tailwind.

### Tratamento de Erros

- Server Actions retornam `{ data, error }` — nunca lançam para o cliente.
- API routes retornam `{ error: { code, message } }` com HTTP correto.
- Errors operacionais conhecidos têm `code` enumerado em `@shared/errors.ts`.
- Sentry captura apenas erros não-tratados.

### Testes

- Unit: `vitest` para `@shared`, validators e funções puras.
- E2E: `playwright` para fluxos críticos (signup, criar ganho, paywall).
- Cobertura alvo MVP: 60% em `@shared` + smoke E2E nos 4 fluxos quentes. Sem perseguição de 100%.

### Commits

- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `chore: ...`.
- Scopes válidos: `auth | earnings | expenses | fuel | maintenance | dashboard | billing | infra | docs`.
- Cada commit cita ao menos 1 `T-NNN` quando aplicável: `feat(fuel): cálculo km/L (T-045)`.

---

## Modelagem de Dados

<!-- AGENT-SECTION: data-model -->

### Princípios

- **UUID v7** como PK em todas as tabelas (ordenado por tempo, bom para índices).
- `created_at`, `updated_at` (timestamptz) em todas as tabelas. Trigger SQL para `updated_at`.
- **Soft delete** via `deleted_at` em `earnings`, `expenses`, `fuel_entries`, `maintenance_logs`.
- **Valores monetários em centavos (`bigint`)** — nunca `float`/`decimal` parsing.
- Tudo isolado por `user_id` com RLS policy.

### Tabelas (resumido)

#### `users` (gerenciado por Supabase Auth, espelhado em `public.profiles`)

| Coluna             | Tipo                         | Notas           |
| ------------------ | ---------------------------- | --------------- |
| id                 | uuid (PK = auth.users.id)    |                 |
| full_name          | text                         |                 |
| phone              | text                         | E.164, opcional |
| city               | text                         |                 |
| state              | text(2)                      | UF              |
| plan               | enum('free','pro','premium') | default 'free'  |
| trial_ends_at      | timestamptz                  | nullable        |
| current_period_end | timestamptz                  | nullable        |
| created_at         | timestamptz                  |                 |
| updated_at         | timestamptz                  |                 |

#### `vehicles`

| Coluna              | Tipo                               | Notas    |
| ------------------- | ---------------------------------- | -------- |
| id                  | uuid (PK)                          |          |
| user_id             | uuid (FK profiles)                 |          |
| type                | enum('motorcycle','bicycle','car') |          |
| brand               | text                               |          |
| model               | text                               |          |
| year                | int                                |          |
| plate               | text                               | nullable |
| odometer_initial_km | int                                |          |
| created_at          | timestamptz                        |          |

#### `earnings` (Ganhos)

| Coluna                             | Tipo                                                       | Notas                             |
| ---------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| id                                 | uuid (PK)                                                  |                                   |
| user_id                            | uuid (FK)                                                  |                                   |
| platform                           | enum('ifood','rappi','ubereats','99food','direct','other') |                                   |
| amount_cents                       | bigint                                                     | >=0                               |
| earned_at                          | timestamptz                                                |                                   |
| shift                              | enum('morning','afternoon','night','dawn')                 |                                   |
| note                               | text                                                       | nullable                          |
| client_id                          | uuid                                                       | idempotency key gerado no cliente |
| created_at, updated_at, deleted_at | timestamptz                                                |                                   |

#### `expenses` (Gastos não-combustível)

| Coluna                             | Tipo                                                                                | Notas       |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ----------- |
| id                                 | uuid (PK)                                                                           |             |
| user_id                            | uuid (FK)                                                                           |             |
| category                           | enum('food','maintenance','tolls','tires','oil','brakes','insurance','tax','other') |             |
| amount_cents                       | bigint                                                                              |             |
| description                        | text                                                                                | nullable    |
| spent_at                           | timestamptz                                                                         |             |
| client_id                          | uuid                                                                                | idempotency |
| created_at, updated_at, deleted_at |                                                                                     |             |

#### `fuel_entries` (Abastecimentos)

| Coluna                             | Tipo                                      | Notas              |
| ---------------------------------- | ----------------------------------------- | ------------------ |
| id                                 | uuid (PK)                                 |                    |
| user_id                            | uuid (FK)                                 |                    |
| vehicle_id                         | uuid (FK)                                 |                    |
| fuel_type                          | enum('gasoline','ethanol','diesel','gnv') |                    |
| liters                             | numeric(8,3)                              |                    |
| total_cents                        | bigint                                    |                    |
| odometer_km                        | int                                       | leitura no momento |
| filled_at                          | timestamptz                               |                    |
| client_id                          | uuid                                      |                    |
| created_at, updated_at, deleted_at |                                           |                    |

**Derivados (calculados em view ou query, NÃO armazenados):**

- `price_per_liter_cents = total_cents / liters`
- `km_since_last_fill = odometer_km - LAG(odometer_km) OVER (ORDER BY filled_at)`
- `kml = km_since_last_fill / liters`
- `cost_per_km_cents = total_cents / km_since_last_fill`

#### `maintenance_logs`

| Coluna                             | Tipo                                                         | Notas    |
| ---------------------------------- | ------------------------------------------------------------ | -------- |
| id                                 | uuid (PK)                                                    |          |
| user_id                            | uuid (FK)                                                    |          |
| vehicle_id                         | uuid (FK)                                                    |          |
| service_type                       | enum('oil_change','brakes','tires','chain','review','other') |          |
| amount_cents                       | bigint                                                       |          |
| odometer_km                        | int                                                          |          |
| performed_at                       | timestamptz                                                  |          |
| next_due_km                        | int                                                          | nullable |
| next_due_at                        | timestamptz                                                  | nullable |
| created_at, updated_at, deleted_at |                                                              |          |

#### `goals`

| Coluna                 | Tipo                     | Notas |
| ---------------------- | ------------------------ | ----- |
| id                     | uuid (PK)                |       |
| user_id                | uuid (FK)                |       |
| period                 | enum('weekly','monthly') |       |
| target_cents           | bigint                   |       |
| period_start           | date                     |       |
| period_end             | date                     |       |
| created_at, updated_at |                          |       |

#### `subscriptions`

| Coluna                 | Tipo                                                     | Notas    |
| ---------------------- | -------------------------------------------------------- | -------- |
| id                     | uuid (PK)                                                |          |
| user_id                | uuid (FK)                                                |          |
| asaas_subscription_id  | text                                                     | unique   |
| plan                   | enum('pro','premium')                                    |          |
| status                 | enum('active','trialing','past_due','canceled','paused') |          |
| billing_cycle          | enum('monthly','yearly')                                 |          |
| current_period_start   | timestamptz                                              |          |
| current_period_end     | timestamptz                                              |          |
| canceled_at            | timestamptz                                              | nullable |
| created_at, updated_at |                                                          |          |

#### `events` (analytics fallback se PostHog falhar; opcional)

| Coluna      | Tipo            |
| ----------- | --------------- |
| id          | uuid            |
| user_id     | uuid (nullable) |
| name        | text            |
| properties  | jsonb           |
| occurred_at | timestamptz     |

### RLS Policy Padrão

Para toda tabela com `user_id`:

```sql
CREATE POLICY "owner_only" ON {table}
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Índices Obrigatórios

- `earnings(user_id, earned_at DESC)`
- `expenses(user_id, spent_at DESC)`
- `fuel_entries(user_id, filled_at DESC)`
- `fuel_entries(vehicle_id, odometer_km)`
- `subscriptions(asaas_subscription_id)` unique

---

## Contratos de API

<!-- AGENT-SECTION: api-contracts -->

### Padrão

- Server Actions para todas as mutações iniciadas pelo cliente Next.js.
- Route Handlers (`app/api/*`) **apenas** para: webhooks externos, geração de PDF (streaming), endpoints chamados por SDK offline (sync queue).
- Toda mutação valida com Zod antes de tocar o banco.
- Toda mutação aceita `client_id` (UUID gerado no cliente) para idempotência.

### Endpoints Críticos (Route Handlers)

| ID                 | Método + Path                    | Função                                                                       |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------- |
| `EP-webhook-asaas` | POST `/api/webhooks/asaas`       | Recebe eventos Asaas, valida HMAC, atualiza `subscriptions`                  |
| `EP-pdf-extrato`   | GET `/api/pdf/extrato?from=&to=` | Gera extrato de renda PDF (streaming)                                        |
| `EP-sync-batch`    | POST `/api/sync/batch`           | Recebe array de operações offline, processa com idempotência por `client_id` |

### Server Actions (resumo, completo em código)

| ID                         | Action              | Input (Zod)                                                                       | Plano mínimo                |
| -------------------------- | ------------------- | --------------------------------------------------------------------------------- | --------------------------- | --------- | ---- |
| `SA-earning-create`        | createEarning       | `{platform, amount_cents, earned_at, shift?, note?, client_id}`                   | free                        |
| `SA-earning-update`        | updateEarning       | `{id, ...partial}`                                                                | free                        |
| `SA-earning-delete`        | deleteEarning       | `{id}`                                                                            | free                        |
| `SA-expense-create`        | createExpense       | similar                                                                           | free                        |
| `SA-fuel-create`           | createFuelEntry     | `{vehicle_id, fuel_type, liters, total_cents, odometer_km, filled_at, client_id}` | free                        |
| `SA-dashboard-summary`     | getDashboardSummary | `{range: 'today'                                                                  | 'week'                      | 'month'}` | free |
| `SA-report-month`          | getMonthReport      | `{year, month}`                                                                   | free=current month, pro=all |
| `SA-extrato-generate`      | requestExtratoPdf   | `{from, to}`                                                                      | **pro**                     |
| `SA-subscription-checkout` | startCheckout       | `{plan, cycle}`                                                                   | n/a                         |

### Códigos de Erro Canônicos

```
AUTH_REQUIRED        — usuário não autenticado
PLAN_LIMIT           — feature requer plano superior
VALIDATION           — entrada inválida (detalhes em error.details)
NOT_FOUND            — recurso inexistente ou outro user
RATE_LIMITED         — limite de requisições
CONFLICT             — client_id já processado (idempotência)
EXTERNAL_FAILURE     — Asaas/OneSignal/Sentry falhou
INTERNAL             — bug
```

---

## Sync Offline

<!-- AGENT-SECTION: offline -->

1. Cliente escreve em `IndexedDB` (via `Dexie`) toda mutação.
2. Worker tenta `POST /api/sync/batch` quando online.
3. Idempotência via `client_id` UUID — servidor retorna 409 `CONFLICT` se já processou; cliente trata como sucesso.
4. Ordem de aplicação: por `created_at` local crescente.
5. Conflitos de schema (e.g. campo enum novo) → cliente desatualizado faz upgrade obrigatório (banner "atualize o app").

---

## Plano Gating (Feature Flags por Plano)

<!-- AGENT-SECTION: plan-gating -->

Centralizado em `packages/shared/constants/plans.ts`:

```ts
export const PLAN_CAPABILITIES = {
  free: {
    history_months: 1,
    pdf_export: false,
    extrato_renda: false,
    maintenance_alerts: false,
    multi_vehicle: false,
    priority_support: false
  },
  pro: {
    history_months: Infinity,
    pdf_export: true,
    extrato_renda: true,
    maintenance_alerts: true,
    multi_vehicle: false,
    priority_support: false
  },
  premium: {
    history_months: Infinity,
    pdf_export: true,
    extrato_renda: true,
    maintenance_alerts: true,
    multi_vehicle: true, // até 5
    priority_support: true
  }
} as const;
```

**Regra:** toda Server Action que oferece feature paga lê `PLAN_CAPABILITIES[user.plan]` e retorna `PLAN_LIMIT` se negado. Nunca duplicar a checagem em mais de um lugar.

---

## Padrões de UI (Contrato de Design)

<!-- AGENT-SECTION: ui-contract -->

Resumo dos princípios mandatórios (rationale em `CRITIQUE.md` Pilar 3):

1. **Touch target mínimo 56dp.** Tailwind: `min-h-14 min-w-14`.
2. **Tipografia base 18px.** Números financeiros classe `text-3xl font-bold tabular-nums`.
3. **Contraste WCAG AAA (≥7:1).** Validado por CI (axe-core).
4. **Paleta máxima 4 cores funcionais:**
   - `--bg`: `#0B0B0F` (dark default) / `#FFFFFF` (light)
   - `--fg`: `#F5F5F7` / `#0B0B0F`
   - `--accent`: `#FF6B00` (laranja MotoFinance)
   - `--positive`: `#16A34A`
   - `--negative`: `#DC2626`
5. **Sem ilustrações decorativas. Sem ícones puramente estéticos.** Cada ícone tem função.
6. **Zero modais empilhados.** Sheets bottom-up substituem modais.
7. **FAB único** com 3 ações (`+ Ganho`, `+ Gasto`, `+ Combustível`).
8. **Offline indicator persistente** quando há fila pendente.
9. **Form de Ganho ≤ 5s para preencher** (medido em E2E).

---

## Segurança

- **RLS sempre on.** Migrations falham CI se criar tabela sem policy.
- **Service Role Key nunca usada no client.** Reside apenas em Route Handlers.
- **Tokens Asaas em env vars.** Rotação a cada 90d.
- **Webhook Asaas valida HMAC.**
- **PII (telefone, CPF se coletado) cifrada em repouso** (Supabase Vault para CPF).
- **Logs Sentry filtram** `amount_cents`, `cpf`, `email`, `phone`.
- **Rate limit** por user_id: 60 req/min em mutações; 10/min em PDF/extrato.

---

## Performance

- LCP ≤2.5s em 4G mediana.
- Bundle inicial ≤180KB gzip.
- Imagens via `next/image` com `loading="lazy"` exceto hero.
- Queries de dashboard cobertas por índice (sem seq scan permitido — verificado via `EXPLAIN` em CI).
- `revalidate` de páginas estáticas: 60s para marketing; 0 (dinâmico) para app autenticado.

---

## Observabilidade

| Métrica                   | Origem          | Alerta        |
| ------------------------- | --------------- | ------------- |
| Crashfree rate            | Sentry          | <99%          |
| Erro 5xx                  | Vercel + Sentry | >1% req/min   |
| Webhook Asaas falho       | Sentry          | qualquer      |
| Sync queue >5min de delay | PostHog custom  | qualquer      |
| Tempo médio criar Ganho   | PostHog timing  | >8s           |
| Trial→Pro conversion      | PostHog funnel  | <3% (warning) |

---

## ADRs

Cada decisão arquitetural relevante vira ADR numerada em `docs/DECISIONS/NNNN-titulo.md`. Template em `docs/DECISIONS/_template.md`.

ADRs iniciais a criar:

- `0001-stack-lean-brasil.md` — por que Next.js+Supabase+Asaas vs spec original.
- `0002-offline-first-dexie.md` — por que IndexedDB+Dexie.
- `0003-money-as-cents-bigint.md` — por que sem floats.
- `0004-rls-as-security-default.md` — por que toda tabela com RLS.
- `0005-no-redis-in-mvp.md` — quando Redis entra.
