---
file: TASKS.md
version: 1.1
last_updated: 2026-05-22
owner: tech-lead
purpose: Backlog atômico. Cada task tem ID estável e status machine-readable.
read_when: IA precisa decidir o que executar agora. Atualizar status sempre que iniciar/concluir.
---

# TASKS.md — MotoFinance

## Como ler este arquivo

- Cada task tem `id` estável (`T-NNN`). **IDs nunca são reutilizados.**
- Status: `pending | in_progress | blocked | completed | deleted`.
- Pegue a primeira task com `status: pending` cujo `blocked_by` está vazio ou completo, e cujo `owner` é seu agente (ou está vazio).
- Marque `in_progress` ao começar; `completed` somente quando todos os critérios de aceite forem cumpridos.
- Cada task referencia 1 épico de `ROADMAP.md` e (quando aplicável) arquivos a tocar e endpoints a respeitar de `ARCHITECTURE.md`.

## Convenção dos campos

```yaml
- id: T-NNN # estável
  title: 'verbo no infinitivo, escopo'
  epic: E-MX-YY # ref ROADMAP
  owner: agent_backend|frontend|db|qa|devops|""
  status: pending|in_progress|blocked|completed|deleted
  blocked_by: [] # IDs de outras tasks
  estimate_h: 1|2|4|8 # 8 max — se maior, quebrar
  files_touch:
    - 'caminho/arquivo'
  acceptance:
    - 'critério verificável 1'
    - 'critério verificável 2'
  notes: 'opcional'
```

---

## M1 — Validação

> **Mudança v1.1:** M1 roda 100% local. CI/CD (T-008), Vercel (T-009) e Sentry/PostHog (T-010) foram movidos para `E-M2-00` (Deploy Web em M2). Em M1 ficam apenas T-001..T-007.

### E-M1-01 — Setup repo + DX local

```yaml
- id: T-001
  title: 'Inicializar monorepo pnpm + Next.js 14 + TS estrito'
  epic: E-M1-01
  owner: agent_devops
  status: pending
  estimate_h: 2
  files_touch:
    ['package.json', 'pnpm-workspace.yaml', 'tsconfig.base.json', 'apps/web/package.json']
  acceptance:
    - 'pnpm install roda limpo'
    - 'pnpm --filter web dev sobe Next.js em :3000'
    - 'tsconfig com strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes'

- id: T-002
  title: 'Configurar Tailwind + shadcn/ui base'
  epic: E-M1-01
  owner: agent_frontend
  status: pending
  blocked_by: [T-001]
  estimate_h: 2
  files_touch: ['apps/web/app/globals.css', 'apps/web/tailwind.config.ts', 'components.json']
  acceptance:
    - 'Tailwind compila'
    - 'shadcn init OK'
    - 'paleta MotoFinance definida em globals.css (CSS vars)'

- id: T-003
  title: 'Criar packages/shared, packages/db, packages/ui'
  epic: E-M1-01
  owner: agent_devops
  status: pending
  blocked_by: [T-001]
  estimate_h: 1
  acceptance:
    - 'Path aliases @shared/* @db/* @ui/* funcionam em imports'

- id: T-004
  title: 'Configurar ESLint + Prettier + Conventional Commits hook'
  epic: E-M1-01
  owner: agent_devops
  status: pending
  blocked_by: [T-001]
  estimate_h: 2
  acceptance:
    - 'pnpm lint zero erros no scaffold'
    - 'commitlint bloqueia mensagens não-convencionais'

- id: T-005
  title: 'Configurar Vitest + Playwright'
  epic: E-M1-01
  owner: agent_qa
  status: pending
  blocked_by: [T-001]
  estimate_h: 3
  acceptance:
    - 'vitest roda um teste smoke'
    - 'playwright roda um teste smoke contra localhost:3000'

- id: T-006
  title: 'Criar projeto Supabase (apenas dev em M1)'
  epic: E-M1-01
  owner: agent_devops
  status: pending
  estimate_h: 1
  acceptance:
    - '.env.example documentado com SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY'
    - '.env.local criado e funcional'
  notes: 'Requer ação humana — criar conta no supabase.com. Bloqueia T-011. Projeto staging entra em E-M2-00.'

- id: T-007
  title: 'Configurar Drizzle ORM + cliente Supabase'
  epic: E-M1-01
  owner: agent_db
  status: pending
  blocked_by: [T-003, T-006]
  estimate_h: 3
  files_touch: ['packages/db/client.ts', 'packages/db/drizzle.config.ts']
  acceptance:
    - 'pnpm db:generate cria migration vazia'
    - 'Cliente conecta no Supabase dev'

- id: T-008
  title: '[MOVIDO para E-M2-00] Pipeline CI GitHub Actions'
  epic: E-M2-00
  owner: agent_devops
  status: pending
  blocked_by: [T-004, T-005]
  estimate_h: 3
  notes: 'Movido para M2. M1 não tem CI/CD; testes rodam local antes de commitar.'

- id: T-009
  title: '[MOVIDO para E-M2-00] Conectar Vercel + deploy preview por PR'
  epic: E-M2-00
  owner: agent_devops
  status: pending
  blocked_by: [T-082]
  estimate_h: 2
  notes: 'Movido para M2. M1 roda em localhost; expor via ngrok se precisar testar com beta.'

- id: T-010
  title: '[MOVIDO para E-M2-00] Configurar Sentry + PostHog em produção'
  epic: E-M2-00
  owner: agent_devops
  status: pending
  blocked_by: [T-009]
  estimate_h: 2
  notes: 'Movido para M2. M1 pode usar PostHog em dev se quiser, mas não é bloqueante.'
```

### E-M1-02 — Auth + Onboarding

```yaml
- id: T-011
  title: 'Schema Drizzle: profiles, vehicles'
  epic: E-M1-02
  owner: agent_db
  status: completed
  blocked_by: [T-007]
  estimate_h: 3
  files_touch:
    ['packages/db/schema/profiles.ts', 'packages/db/schema/vehicles.ts', 'packages/db/migrations/*']
  acceptance:
    - 'Tabelas criadas com RLS policy owner_only'
    - 'Trigger updated_at funcionando'

- id: T-012
  title: 'Server Action: createProfileOnSignup (trigger)'
  epic: E-M1-02
  owner: agent_backend
  status: pending
  blocked_by: [T-011]
  estimate_h: 2
  acceptance:
    - 'Após signup, row em profiles criada via trigger Postgres'

- id: T-013
  title: 'Tela de signup (email + senha) + onboarding'
  epic: E-M1-02
  owner: agent_frontend
  status: pending
  blocked_by: [T-011]
  estimate_h: 4
  files_touch: ['apps/web/app/(auth)/signup/page.tsx']
  acceptance:
    - 'Form valida com Zod (email RFC, senha ≥8 caracteres)'
    - 'Sucesso redireciona para /onboarding'
    - 'Acessível: labels associadas, foco visível, contraste AAA'

- id: T-014
  title: 'Tela de login + recover password'
  epic: E-M1-02
  owner: agent_frontend
  status: pending
  blocked_by: [T-011]
  estimate_h: 3
  acceptance:
    - 'Login funcional'
    - 'Recover envia email Supabase Auth'

- id: T-015
  title: 'Wizard de onboarding (3 passos)'
  epic: E-M1-02
  owner: agent_frontend
  status: pending
  blocked_by: [T-013]
  estimate_h: 4
  acceptance:
    - 'Passo 1: nome, cidade, UF'
    - 'Passo 2: tipo de veículo + marca/modelo/ano + km atual'
    - 'Passo 3: plataformas em que trabalha (multi-select chips)'
    - 'Cada passo salva incrementalmente'

- id: T-016
  title: 'Middleware: rotas autenticadas + redirect'
  epic: E-M1-02
  owner: agent_backend
  status: pending
  blocked_by: [T-013]
  estimate_h: 2
  files_touch: ['apps/web/middleware.ts']
  acceptance:
    - '/(app)/* sem sessão → redirect /login'
    - '/(auth)/* com sessão → redirect /dashboard'

- id: T-017
  title: 'Server Action: updateProfile'
  epic: E-M1-02
  owner: agent_backend
  status: pending
  blocked_by: [T-011]
  estimate_h: 2

- id: T-018
  title: 'Server Action: createVehicle + listVehicles'
  epic: E-M1-02
  owner: agent_backend
  status: pending
  blocked_by: [T-011]
  estimate_h: 2

- id: T-019
  title: 'E2E: fluxo signup → onboarding → dashboard vazio'
  epic: E-M1-02
  owner: agent_qa
  status: pending
  blocked_by: [T-015, T-016]
  estimate_h: 2

- id: T-020
  title: 'E2E: fluxo login + logout'
  epic: E-M1-02
  owner: agent_qa
  status: pending
  blocked_by: [T-014]
  estimate_h: 1
```

### E-M1-03 — Perfil + Veículo

```yaml
- id: T-021
  title: 'Tela /perfil — visualizar dados do usuário'
  epic: E-M1-03
  owner: agent_frontend
  status: pending
  blocked_by: [T-017]
  estimate_h: 3

- id: T-022
  title: 'Tela /perfil/editar — editar dados básicos'
  epic: E-M1-03
  owner: agent_frontend
  status: pending
  blocked_by: [T-021]
  estimate_h: 3

- id: T-023
  title: 'Tela /perfil/veiculo — gerenciar veículo'
  epic: E-M1-03
  owner: agent_frontend
  status: pending
  blocked_by: [T-018]
  estimate_h: 3

- id: T-024
  title: 'Server Action: updateVehicle + deleteVehicle'
  epic: E-M1-03
  owner: agent_backend
  status: pending
  blocked_by: [T-018]
  estimate_h: 2

- id: T-025
  title: 'Tela /perfil/notificacoes — opt-in push (stub)'
  epic: E-M1-03
  owner: agent_frontend
  status: pending
  blocked_by: [T-021]
  estimate_h: 2
  notes: 'Push real entra em E-M2-05; aqui só toggle persistido.'

- id: T-026
  title: 'Componente compartilhado: PlatformChip (iFood/Rappi/Uber/99/Direct/Other)'
  epic: E-M1-03
  owner: agent_frontend
  status: pending
  blocked_by: [T-002]
  estimate_h: 2
  files_touch: ['packages/ui/platform-chip.tsx']

- id: T-027
  title: 'Constants: PLATFORMS, FUEL_TYPES, EXPENSE_CATEGORIES, SHIFTS'
  epic: E-M1-03
  owner: agent_backend
  status: pending
  blocked_by: [T-003]
  estimate_h: 1
  files_touch: ['packages/shared/constants/index.ts']
```

### E-M1-04 — Registro de Ganho

```yaml
- id: T-028
  title: 'Schema Drizzle: earnings'
  epic: E-M1-04
  owner: agent_db
  status: completed
  blocked_by: [T-011]
  estimate_h: 2

- id: T-029
  title: 'Validator Zod: CreateEarningInput, UpdateEarningInput'
  epic: E-M1-04
  owner: agent_backend
  status: pending
  blocked_by: [T-027]
  estimate_h: 1

- id: T-030
  title: 'Server Action: createEarning (idempotente por client_id)'
  epic: E-M1-04
  owner: agent_backend
  status: pending
  blocked_by: [T-028, T-029]
  estimate_h: 3
  acceptance:
    - 'Cria earning'
    - 'Duplicate client_id retorna CONFLICT sem criar duplicata'

- id: T-031
  title: 'Server Action: listEarnings(range), updateEarning, deleteEarning'
  epic: E-M1-04
  owner: agent_backend
  status: pending
  blocked_by: [T-028]
  estimate_h: 3

- id: T-032
  title: 'Tela /ganhos — listagem com filtros (plataforma, período)'
  epic: E-M1-04
  owner: agent_frontend
  status: pending
  blocked_by: [T-031, T-026]
  estimate_h: 4

- id: T-033
  title: 'Sheet bottom-up: registrar ganho (form ≤ 5s)'
  epic: E-M1-04
  owner: agent_frontend
  status: pending
  blocked_by: [T-030, T-026]
  estimate_h: 4
  acceptance:
    - 'Campos: valor (input numérico nativo), plataforma (chips), data (default hoje)'
    - 'Turno inferido por horário, editável'
    - 'Submit chama Server Action e fecha sheet'
    - 'Funciona offline (grava em fila)'

- id: T-034
  title: 'Tela /ganhos/[id] — detalhes + editar/excluir'
  epic: E-M1-04
  owner: agent_frontend
  status: pending
  blocked_by: [T-031]
  estimate_h: 3

- id: T-035
  title: 'E2E: criar ganho online + offline + dedupe'
  epic: E-M1-04
  owner: agent_qa
  status: pending
  blocked_by: [T-033]
  estimate_h: 3
```

### E-M1-05 — Registro de Gasto

```yaml
- id: T-036
  title: 'Schema Drizzle: expenses'
  epic: E-M1-05
  owner: agent_db
  status: pending
  blocked_by: [T-011]
  estimate_h: 2

- id: T-037
  title: 'Validator Zod: CreateExpenseInput, UpdateExpenseInput'
  epic: E-M1-05
  owner: agent_backend
  status: pending
  blocked_by: [T-027]
  estimate_h: 1

- id: T-038
  title: 'Server Action: createExpense + list + update + delete'
  epic: E-M1-05
  owner: agent_backend
  status: pending
  blocked_by: [T-036, T-037]
  estimate_h: 3

- id: T-039
  title: 'Componente: CategoryChip (com ícone + cor + label)'
  epic: E-M1-05
  owner: agent_frontend
  status: pending
  blocked_by: [T-002]
  estimate_h: 2

- id: T-040
  title: 'Sheet bottom-up: registrar gasto'
  epic: E-M1-05
  owner: agent_frontend
  status: pending
  blocked_by: [T-038, T-039]
  estimate_h: 3

- id: T-041
  title: 'Tela /gastos — listagem com filtros'
  epic: E-M1-05
  owner: agent_frontend
  status: pending
  blocked_by: [T-038, T-039]
  estimate_h: 3

- id: T-042
  title: 'E2E: criar gasto + filtrar por categoria'
  epic: E-M1-05
  owner: agent_qa
  status: pending
  blocked_by: [T-040]
  estimate_h: 2
```

### E-M1-06 — Combustível (CRÍTICO para MVP)

```yaml
- id: T-043
  title: 'Schema Drizzle: fuel_entries + view derivada (kml, cost_per_km)'
  epic: E-M1-06
  owner: agent_db
  status: pending
  blocked_by: [T-011, T-018]
  estimate_h: 3
  acceptance:
    - 'View SQL retorna kml e cost_per_km com window function LAG por veículo'

- id: T-044
  title: 'Validator Zod: CreateFuelEntryInput (liters>0, total>0, km>0)'
  epic: E-M1-06
  owner: agent_backend
  status: pending
  blocked_by: [T-027]
  estimate_h: 1

- id: T-045
  title: 'Server Action: createFuelEntry + list + update + delete'
  epic: E-M1-06
  owner: agent_backend
  status: pending
  blocked_by: [T-043, T-044]
  estimate_h: 3
  acceptance:
    - 'Valida que odometer_km > último odometer registrado do veículo'

- id: T-046
  title: 'Server Action: getFuelStats(vehicle_id, range) — média km/L, R$/km, R$/L'
  epic: E-M1-06
  owner: agent_backend
  status: pending
  blocked_by: [T-043]
  estimate_h: 3

- id: T-047
  title: 'Sheet bottom-up: registrar abastecimento'
  epic: E-M1-06
  owner: agent_frontend
  status: pending
  blocked_by: [T-045]
  estimate_h: 4

- id: T-048
  title: 'Tela /combustivel — histórico + cards de média km/L e R$/km'
  epic: E-M1-06
  owner: agent_frontend
  status: pending
  blocked_by: [T-046]
  estimate_h: 4

- id: T-049
  title: 'Test unit: cálculo de km/L e R$/km com casos de borda'
  epic: E-M1-06
  owner: agent_qa
  status: pending
  blocked_by: [T-046]
  estimate_h: 2
  acceptance:
    - 'Primeiro abastecimento sem prévio: kml=null'
    - 'Odômetro retroativo: rejeita'
    - 'Combustível misturado (etanol+gasolina): trata como entradas separadas'

- id: T-050
  title: 'E2E: registrar 3 abastecimentos sequenciais + ver médias'
  epic: E-M1-06
  owner: agent_qa
  status: pending
  blocked_by: [T-047, T-048]
  estimate_h: 2

- id: T-051
  title: 'Server Action: getOperationalCostPerKm — combina fuel + manut. histórica'
  epic: E-M1-06
  owner: agent_backend
  status: pending
  blocked_by: [T-046]
  estimate_h: 3

- id: T-052
  title: 'Card no dashboard: R$/km operacional (visível e destacado)'
  epic: E-M1-06
  owner: agent_frontend
  status: pending
  blocked_by: [T-051]
  estimate_h: 2
```

### E-M1-07 — Dashboard

```yaml
- id: T-053
  title: 'Server Action: getDashboardSummary(range)'
  epic: E-M1-07
  owner: agent_backend
  status: pending
  blocked_by: [T-030, T-038, T-045]
  estimate_h: 3
  acceptance:
    - 'Retorna {gross_cents, costs_cents, net_cents, fuel_cents, expenses_cents, top_platform, count}'

- id: T-054
  title: 'Layout principal /(app)/ — bottom nav 4 itens + FAB'
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-002]
  estimate_h: 3
  acceptance:
    - 'Bottom nav: Início, Ganhos, Combustível, Mais'
    - 'FAB 64dp canto inferior direito com 3 atalhos'

- id: T-055
  title: 'Tela /dashboard — 3 números grandes + lista 7 últimos'
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-053, T-054]
  estimate_h: 4
  acceptance:
    - 'Receita, Custos, Lucro em fonte ≥28px tabular-nums'
    - 'Contraste AAA verificado'
    - 'Skeleton durante load'

- id: T-056
  title: 'Tela /dashboard — toggle Dia/Semana/Mês'
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-055]
  estimate_h: 2

- id: T-057
  title: 'Componente: NumberCard (positive/negative/neutral)'
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-002]
  estimate_h: 2
  files_touch: ['packages/ui/number-card.tsx']

- id: T-058
  title: "Botão 'Encerrar turno' — modal resumo do dia"
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-053]
  estimate_h: 3

- id: T-059
  title: 'Empty state coerente (3 ilustrações texto/ícone simples)'
  epic: E-M1-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-055]
  estimate_h: 2

- id: T-060
  title: 'Lighthouse mobile ≥85 perf, =100 a11y na /dashboard'
  epic: E-M1-07
  owner: agent_qa
  status: pending
  blocked_by: [T-055]
  estimate_h: 2
```

### E-M1-08 — Offline-first + Sync

```yaml
- id: T-061
  title: 'Adicionar Dexie + setup IndexedDB stores'
  epic: E-M1-08
  owner: agent_frontend
  status: pending
  blocked_by: [T-001]
  estimate_h: 3

- id: T-062
  title: 'Hook useOfflineQueue — push/pull operações'
  epic: E-M1-08
  owner: agent_frontend
  status: pending
  blocked_by: [T-061]
  estimate_h: 4

- id: T-063
  title: 'Worker de sync: tenta enviar batch quando online'
  epic: E-M1-08
  owner: agent_frontend
  status: pending
  blocked_by: [T-062]
  estimate_h: 4

- id: T-064
  title: 'Route Handler: POST /api/sync/batch (idempotente)'
  epic: E-M1-08
  owner: agent_backend
  status: pending
  blocked_by: [T-030, T-038, T-045]
  estimate_h: 4

- id: T-065
  title: "Badge global: 'N lançamentos pendentes' + offline pill"
  epic: E-M1-08
  owner: agent_frontend
  status: pending
  blocked_by: [T-063]
  estimate_h: 2

- id: T-066
  title: 'PWA manifest + service worker (next-pwa ou custom)'
  epic: E-M1-08
  owner: agent_frontend
  status: pending
  blocked_by: [T-001]
  estimate_h: 3
  acceptance:
    - 'Instalável em Android Chrome'
    - 'Ícones e splash configurados'

- id: T-067
  title: 'E2E: criar ganho offline → reconectar → sync'
  epic: E-M1-08
  owner: agent_qa
  status: pending
  blocked_by: [T-064, T-063]
  estimate_h: 3

- id: T-068
  title: 'Test: dedupe de batch com client_id duplicado'
  epic: E-M1-08
  owner: agent_qa
  status: pending
  blocked_by: [T-064]
  estimate_h: 1
```

### E-M1-09 — PDF mensal básico

```yaml
- id: T-069
  title: 'Adicionar @react-pdf/renderer e template base'
  epic: E-M1-09
  owner: agent_backend
  status: pending
  estimate_h: 3

- id: T-070
  title: 'Route Handler: GET /api/pdf/relatorio?month=&year= (streaming)'
  epic: E-M1-09
  owner: agent_backend
  status: pending
  blocked_by: [T-053, T-069]
  estimate_h: 4

- id: T-071
  title: 'Template PDF: cabeçalho + tabela ganhos + tabela gastos + totais'
  epic: E-M1-09
  owner: agent_backend
  status: pending
  blocked_by: [T-069]
  estimate_h: 4

- id: T-072
  title: 'Tela /relatorios — seletor de mês + botão exportar PDF'
  epic: E-M1-09
  owner: agent_frontend
  status: pending
  blocked_by: [T-070]
  estimate_h: 3

- id: T-073
  title: 'Plan gating: PDF apenas no Pro (mostrar paywall stub)'
  epic: E-M1-09
  owner: agent_backend
  status: pending
  blocked_by: [T-070]
  estimate_h: 2

- id: T-074
  title: 'Compartilhamento Web Share API (Android) + fallback download'
  epic: E-M1-09
  owner: agent_frontend
  status: pending
  blocked_by: [T-072]
  estimate_h: 2

- id: T-075
  title: 'E2E: gerar PDF mês corrente + abrir'
  epic: E-M1-09
  owner: agent_qa
  status: pending
  blocked_by: [T-074]
  estimate_h: 2
```

### E-M1-10 — Beta fechado + Telemetria

```yaml
- id: T-076
  title: 'Eventos PostHog: signup, first_earning, first_fuel, dashboard_open'
  epic: E-M1-10
  owner: agent_frontend
  status: pending
  blocked_by: [T-010, T-033, T-047, T-055]
  estimate_h: 3

- id: T-077
  title: 'Feature flag (PostHog): beta_access — barra acesso por flag'
  epic: E-M1-10
  owner: agent_backend
  status: pending
  blocked_by: [T-010, T-016]
  estimate_h: 2

- id: T-078
  title: 'Lista de espera pública (form simples /espera)'
  epic: E-M1-10
  owner: agent_frontend
  status: pending
  blocked_by: [T-002]
  estimate_h: 2

- id: T-079
  title: 'Email de boas-vindas + convite beta (Resend)'
  epic: E-M1-10
  owner: agent_backend
  status: pending
  blocked_by: [T-012]
  estimate_h: 3

- id: T-080
  title: 'Funnel PostHog: signup → first_earning → D2 return'
  epic: E-M1-10
  owner: agent_devops
  status: pending
  blocked_by: [T-076]
  estimate_h: 1

- id: T-081
  title: 'Runbook beta: como adicionar usuário, debug, suporte'
  epic: E-M1-10
  owner: agent_devops
  status: pending
  blocked_by: [T-077]
  estimate_h: 2
  files_touch: ['docs/runbooks/beta-operations.md']

- id: T-082
  title: 'Critério de saída M1: 30 beta users + ≥10 com ≥5 lançamentos'
  epic: E-M1-10
  owner: ''
  status: pending
  blocked_by: [T-076, T-077, T-079]
  estimate_h: 0
  notes: 'Gate manual — humano valida e libera M2.'
```

---

## M2 — Monetização (resumido; expandir antes de M2 começar)

```yaml
- id: T-083
  title: 'Schema Drizzle: subscriptions'
  epic: E-M2-01
  owner: agent_db
  status: pending

- id: T-084
  title: 'Cliente Asaas (lib/server/asaas.ts)'
  epic: E-M2-01
  owner: agent_backend
  status: pending

- id: T-085
  title: 'Server Action: startCheckout (cria assinatura Asaas)'
  epic: E-M2-01
  owner: agent_backend
  status: pending

- id: T-086
  title: 'Route Handler: POST /api/webhooks/asaas (HMAC + dedupe)'
  epic: E-M2-01
  owner: agent_backend
  status: pending

# (T-087..T-136 a expandir ao iniciar M2 — manter placeholders abaixo)

- id: T-087
  title: 'Lógica de trial 14d + relógio de fim'
  epic: E-M2-01
  owner: agent_backend
  status: pending

- id: T-088
  title: 'Tela /assinar (paywall) com 3 cards de plano'
  epic: E-M2-03
  owner: agent_frontend
  status: pending

- id: T-089
  title: 'Plan gating completo (todas as features Pro/Premium)'
  epic: E-M2-02
  owner: agent_backend
  status: pending

- id: T-090
  title: 'Extrato de renda PDF formatado (template financeiro)'
  epic: E-M2-04
  owner: agent_backend
  status: pending

- id: T-091
  title: 'OneSignal Web Push setup + opt-in'
  epic: E-M2-05
  owner: agent_frontend
  status: pending

- id: T-092
  title: "Cron: notificação 'fim de turno' baseada em GPS/horário"
  epic: E-M2-05
  owner: agent_backend
  status: pending

- id: T-093
  title: 'Comparativo de meses + ranking de plataformas'
  epic: E-M2-06
  owner: agent_frontend
  status: pending

- id: T-094
  title: 'Compartilhamento via WhatsApp do extrato'
  epic: E-M2-07
  owner: agent_frontend
  status: pending
```

> Tasks T-095 a T-136 a expandir ao final de M1 conforme aprendizados do beta.

---

## M3 — Retenção (resumido)

```yaml
- id: T-137
  title: 'Schema goals + Server Actions'
  epic: E-M3-01
  owner: agent_db
  status: pending

- id: T-138
  title: 'Tela /metas + tracking de progresso'
  epic: E-M3-01
  owner: agent_frontend
  status: pending

- id: T-145
  title: 'Schema maintenance_logs + alertas (km/tempo)'
  epic: E-M3-02
  owner: agent_db
  status: pending

- id: T-146
  title: 'Engine de alertas + push de manutenção'
  epic: E-M3-02
  owner: agent_backend
  status: pending

- id: T-153
  title: 'Sistema de dicas (regras estáticas v1)'
  epic: E-M3-03
  owner: agent_backend
  status: pending

- id: T-159
  title: 'Ranking de melhores dias/horas (query analítica)'
  epic: E-M3-04
  owner: agent_backend
  status: pending

- id: T-165
  title: 'Schema multi-vehicle + Premium gating'
  epic: E-M3-05
  owner: agent_db
  status: pending

- id: T-173
  title: 'Streak de dias + notificações de retenção'
  epic: E-M3-06
  owner: agent_backend
  status: pending
```

> Tasks T-139..T-178 expandir conforme métricas reais do beta.

### E-M3-07 — Capacitor + Stores

```yaml
- id: T-179
  title: 'Adicionar Capacitor ao apps/web + configurar @capacitor/core, @capacitor/ios, @capacitor/android'
  epic: E-M3-07
  owner: agent_devops
  status: pending
  estimate_h: 4
  acceptance:
    - 'pnpm cap sync funciona'
    - 'build estático do Next.js (output: export) gera assets capacitor consumir'
    - 'Plugins configurados: SplashScreen, StatusBar, Preferences, Network'

- id: T-180
  title: 'Criar ícones + splash screens (todos os tamanhos iOS + Android)'
  epic: E-M3-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-179]
  estimate_h: 3
  acceptance:
    - 'Ícones gerados via @capacitor/assets em todas resoluções'
    - 'Branding final do owner aplicado (substitui placeholder)'

- id: T-181
  title: 'Build Android (APK + AAB) + assinatura'
  epic: E-M3-07
  owner: agent_devops
  status: pending
  blocked_by: [T-180]
  estimate_h: 4
  acceptance:
    - 'AAB assinado com keystore'
    - 'APK testado em device físico Android'
  notes: 'Requer Android Studio + JDK instalados localmente.'

- id: T-182
  title: 'Build iOS (IPA) + provisioning profile'
  epic: E-M3-07
  owner: agent_devops
  status: pending
  blocked_by: [T-180]
  estimate_h: 6
  acceptance:
    - 'IPA gerado via Xcode'
    - 'Testado em device físico iOS via TestFlight'
  notes: 'Requer macOS + Xcode + Apple Developer ativo ($99/ano). Owner precisa providenciar.'

- id: T-183
  title: 'Submeter Play Store (release interno → fechado → produção)'
  epic: E-M3-07
  owner: agent_devops
  status: pending
  blocked_by: [T-181]
  estimate_h: 4
  acceptance:
    - 'App listado em Internal Testing'
    - 'Política de privacidade e termos publicados'
    - 'Screenshots + descrição em PT-BR submetidos'

- id: T-184
  title: 'Submeter App Store (TestFlight → review)'
  epic: E-M3-07
  owner: agent_devops
  status: pending
  blocked_by: [T-182]
  estimate_h: 4
  acceptance:
    - 'Build em TestFlight com 5+ testadores externos'
    - 'Privacy Nutrition Label preenchida'
    - "Submissão para Review (status: 'Waiting for Review')"

- id: T-185
  title: 'Configurar deep links + universal links (motofinance:// + /open)'
  epic: E-M3-07
  owner: agent_frontend
  status: pending
  blocked_by: [T-179]
  estimate_h: 3
  acceptance:
    - 'Notificações OneSignal abrem rota correta dentro do app'
    - 'Compartilhamento de extrato via WhatsApp abre o app se instalado'
```

---

## Convenções de Estimativa

| Estimativa | Significado                                    |
| ---------- | ---------------------------------------------- |
| 1h         | Mudança trivial, 1 arquivo, sem teste          |
| 2h         | 1-2 arquivos, com teste simples                |
| 3h         | 3+ arquivos OU lógica com 1 caso de borda      |
| 4h         | 4+ arquivos OU múltiplos casos de borda        |
| 8h         | Limite máximo. Acima: **QUEBRAR EM SUBTASKS.** |

## Atualização deste arquivo

- Toda task `completed` permanece no histórico (não remover).
- Para arquivar M1 completo: criar `TASKS-M1-archive.md` e referenciar aqui.
- Sempre incrementar `last_updated` no frontmatter ao editar.
