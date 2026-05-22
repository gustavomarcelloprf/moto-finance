---
file: WORKFLOW.md
version: 1.0
last_updated: 2026-05-22
owner: tech-lead
purpose: Padrão de execução paralela com múltiplos Claude CLI em git worktrees + auditor.
read_when: Antes de iniciar uma sessão de desenvolvimento paralela. Antes de configurar uma nova worktree.
---

# WORKFLOW.md — Execução Paralela Multi-Worktree

## Visão Geral

O MotoFinance é desenvolvido em **modo solo dev + IA, full-time**. Para acelerar wall-clock, usamos:

- **git worktrees** — múltiplos diretórios físicos compartilhando o mesmo `.git/`.
- **N sessões Claude CLI** rodando em paralelo, **uma por worktree**.
- **1 sessão Claude CLI auditora** (persona `agent_auditor`) rodando no worktree principal.

Cada worktree tem sua própria branch `feat/*` e seu próprio `node_modules` (pnpm reaproveita do store global).

---

## Topologia

```
~/Documents/
├── moto-finance/                    ← MAIN worktree (branch: main)
│   └── (auditor roda aqui)
│
├── moto-finance--db/                ← worktree (branch: feat/db-foundation)
│   └── (agent_db roda aqui)
│
├── moto-finance--ui/                ← worktree (branch: feat/ui-foundation)
│   └── (agent_frontend roda aqui)
│
└── moto-finance--auth/              ← worktree (branch: feat/auth-onboarding)
    └── (agent_backend + agent_frontend coordenam aqui)
```

> **Convenção de naming:** `moto-finance--<slug-curto>`. Duplo hífen para distinguir worktree de subdir. Slug bate com a parte após `feat/` da branch.

---

## Regras de Ouro

1. **`main` é sagrada.** Ninguém commita em `main` direto. Sempre via PR de uma worktree.
2. **Cada worktree, uma branch, um agente.** Não rodar 2 Claude CLI na mesma worktree.
3. **`.env.local` é por-worktree.** Use symlink para `main` ou copie:
   ```bash
   ln -s "../moto-finance/.env.local" .env.local
   ```
4. **`pnpm install` em cada worktree nova.** Rápido (~20-40s) por causa do pnpm store.
5. **Conflitos de merge resolvidos no worktree de origem**, nunca no main.
6. **Auditor não escreve código.** Só lê, comenta e propõe.
7. **Sincronização de SSOT.** Se uma worktree precisa atualizar `docs/TASKS.md`, faz commit nessa branch, abre PR, auditor revisa, merge para main.

---

## Setup Inicial

Após o commit inicial em `main`, criar as worktrees:

```bash
# Estando dentro de ~/Documents/moto-finance/ (main)
cd ~/Documents/moto-finance

# Criar 3 worktrees iniciais com branches novas
git worktree add ../moto-finance--db        -b feat/db-foundation
git worktree add ../moto-finance--ui        -b feat/ui-foundation
git worktree add ../moto-finance--auth      -b feat/auth-onboarding

# Verificar
git worktree list

# Em cada worktree, instalar deps e linkar .env.local
for wt in db ui auth; do
  cd "../moto-finance--$wt"
  pnpm install
  ln -s "../moto-finance/.env.local" .env.local
  cd -
done
```

---

## Atribuição de Worktrees a Tasks

Cada worktree recebe tasks específicas do `TASKS.md` baseado em escopo do agente (ver `AGENTS.md`).

| Worktree              | Branch                 | Agente principal                   | Tasks iniciais                                                                         |
| --------------------- | ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `moto-finance` (main) | `main`                 | `agent_auditor` (read-only)        | —                                                                                      |
| `moto-finance--db`    | `feat/db-foundation`   | `agent_db`                         | T-011 (schema profiles+vehicles), T-028, T-036, T-043 (schemas earnings/expenses/fuel) |
| `moto-finance--ui`    | `feat/ui-foundation`   | `agent_frontend`                   | T-026 (PlatformChip), T-039 (CategoryChip), T-057 (NumberCard), T-002 retoques         |
| `moto-finance--auth`  | `feat/auth-onboarding` | `agent_backend` + `agent_frontend` | T-012..T-020                                                                           |

> **Importante:** worktree `--auth` **depende** de `--db` terminar T-011 antes (schema `profiles` precisa existir). Coordenação manual ou via auditor.

---

## Fluxo de uma Sessão Paralela

```
T0 (humano)
  └─► git worktree add ... (terminal raw)

T1 (3 Claude CLI abertos em paralelo)
  ├─ Tab A: cd ../moto-finance--db        && claude   → executa tasks T-011, T-028...
  ├─ Tab B: cd ../moto-finance--ui        && claude   → executa T-026, T-039...
  └─ Tab C: cd ../moto-finance--auth      && claude   → executa T-012... (espera T-011 OK)

T2 (cada agente termina suas tasks, commita, push)
  └─► git push origin feat/<branch>

T3 (auditor — Claude CLI no main)
  ├─ git fetch --all
  ├─ Para cada branch feat/*:
  │   ├─ git diff main..origin/feat/<branch> --stat
  │   ├─ Aplicar 14 checks do agent_auditor
  │   └─ Escrever docs/audits/YYYY-MM-DD-<branch>.md
  └─► Reportar findings ao humano

T4 (humano)
  ├─ Lê audit reports
  ├─ Aprova ou pede ajustes
  └─► git merge feat/<branch> (ou via gh pr merge)
```

---

## Prompts Iniciais para cada Worktree

> **Para cada Claude CLI dedicada**, cole **PRIMEIRA mensagem** o prompt da sua persona abaixo. Isso "ancora" a sessão.

### Prompt inicial — `agent_db` (em `moto-finance--db/`)

```
Você é o agent_db do MotoFinance. Leia EXATAMENTE estes arquivos antes de qualquer ação:

1. docs/AGENTS.md (seção AGENT-SECTION: agent_db)
2. docs/AGENTS.md (seção AGENT-SECTION: universal)
3. docs/ARCHITECTURE.md (seção AGENT-SECTION: data-model)
4. docs/ROADMAP.md (seção AGENT-SECTION: status-global, m1-epics)
5. docs/TASKS.md (apenas tasks com epic E-M1-02, E-M1-04, E-M1-05, E-M1-06)

Seu escopo de escrita: APENAS packages/db/src/schema/**, packages/db/migrations/**.

Sua primeira task é T-011 (Schema Drizzle: profiles, vehicles). Atualize o status para in_progress em TASKS.md ANTES de começar. Implemente conforme os tipos descritos em data-model. Crie a migration SQL. Aplique RLS owner_only em todas as tabelas com user_id.

Depois de terminar, marque T-011 como completed em TASKS.md, faça commit com mensagem "feat(db): schema profiles e vehicles com RLS (T-011)", e prossiga para T-028.

NÃO toque em apps/web/**, packages/ui/**, ou docs/ (exceto TASKS.md status). Se precisar de decisão arquitetural não documentada, PARE e escreva uma proposta de ADR em docs/DECISIONS/.
```

### Prompt inicial — `agent_frontend` (em `moto-finance--ui/`)

```
Você é o agent_frontend do MotoFinance. Leia EXATAMENTE:

1. docs/AGENTS.md (AGENT-SECTION: agent_frontend, universal)
2. docs/ARCHITECTURE.md (AGENT-SECTION: ui-contract, dir-structure)
3. docs/ROADMAP.md (AGENT-SECTION: status-global, m1-epics)
4. docs/TASKS.md (apenas T-026, T-039, T-057, T-054)

Seu escopo de escrita: apps/web/components/**, apps/web/app/**, packages/ui/src/**.

Sua primeira task é T-026 (PlatformChip). Atualize status para in_progress em TASKS.md. Implemente em packages/ui/src/platform-chip.tsx. Touch target ≥56dp. Contraste AAA. Acessibilidade: aria-label, role="button", focus visível.

Depois marque completed, commit "feat(ui): componente PlatformChip (T-026)", e prossiga para T-039.

NÃO toque em packages/db/**, apps/web/actions/**, ou apps/web/api/**.
```

### Prompt inicial — `agent_backend` (em `moto-finance--auth/`)

```
Você é o agent_backend do MotoFinance. Leia EXATAMENTE:

1. docs/AGENTS.md (AGENT-SECTION: agent_backend, universal)
2. docs/ARCHITECTURE.md (AGENT-SECTION: api-contracts, conventions, data-model)
3. docs/ROADMAP.md (AGENT-SECTION: m1-epics)
4. docs/TASKS.md (épico E-M1-02, especialmente T-012, T-016, T-017, T-018)

Seu escopo de escrita: apps/web/actions/**, apps/web/api/**, apps/web/lib/server/**, packages/shared/validators/**, packages/shared/types/**.

IMPORTANTE: Sua primeira task (T-012) DEPENDE de T-011 (executada pelo agent_db em outra worktree). Antes de começar, faça `git fetch --all` e verifique se origin/feat/db-foundation já tem T-011 completed. Se não, marque T-012 como blocked em TASKS.md (status: blocked, blocked_by: T-011) e PARE.

Quando T-011 estiver disponível, faça `git merge origin/feat/db-foundation` (ou rebase), atualize T-012 para in_progress, implemente o trigger Postgres createProfileOnSignup, commit "feat(auth): trigger profile on signup (T-012)".

NÃO toque em packages/ui/**, packages/db/src/schema/** (já feito por agent_db).
```

### Prompt inicial — `agent_auditor` (em `moto-finance/` main)

```
Você é o agent_auditor do MotoFinance. Sua função é REVISAR, não escrever código.

Leia primeiro:
1. docs/AGENTS.md (AGENT-SECTION: agent_auditor) — toda sua spec
2. docs/AGENTS.md (AGENT-SECTION: universal) — regras gerais
3. docs/WORKFLOW.md — entender a topologia

Seu fluxo:
1. `git fetch --all` para pegar todas branches remotas.
2. `git branch -r | grep feat/` para listar branches em desenvolvimento.
3. Para cada branch `feat/*`:
   a. `git log main..origin/feat/<branch> --oneline` — listar commits novos.
   b. `git diff main..origin/feat/<branch> --stat` — quais arquivos mudaram.
   c. Aplicar os 14 checks listados em AGENTS.md > AGENT-SECTION: agent_auditor.
   d. Escrever relatório em docs/audits/YYYY-MM-DD-<branch>.md no formato canônico.
4. Reportar para o humano: quantas branches auditadas, total de findings críticos.

NÃO commite código de produção. NÃO mude TASKS.md status. NÃO edite ARCHITECTURE/ROADMAP — proponha via ADR.

Comece: faça os 3 primeiros passos e me reporte quantas branches existem e o status de cada uma.
```

---

## Comandos de Manutenção

```bash
# Listar todas as worktrees
git worktree list

# Remover uma worktree quando o feature terminar
git worktree remove ../moto-finance--db
git branch -d feat/db-foundation     # se já mergeado
git push origin --delete feat/db-foundation

# Sincronizar uma worktree com main (atualiza após merge)
cd ../moto-finance--<x>
git fetch origin
git rebase origin/main

# Limpar worktrees órfãs (referências quebradas)
git worktree prune
```

---

## Antipatterns

| ❌ Não faça                                       | ✅ Faça                                             |
| ------------------------------------------------- | --------------------------------------------------- |
| Rodar 2 Claude CLI na mesma worktree              | 1 Claude CLI por worktree, exclusivo                |
| Commitar `.env.local` em qualquer worktree        | Symlink ou copy local; `.env.local` em `.gitignore` |
| Auditor escrevendo código de feature              | Auditor só lê + propõe ADRs                         |
| Merge sem audit report                            | Sempre rodar auditor antes de merge                 |
| Worktree tocando arquivo fora do escopo do agente | Cada agente respeita `AGENTS.md > agent_X`          |
| Push para `main` direto                           | Sempre PR de uma branch `feat/*`                    |
| Múltiplas branches feature em uma worktree        | 1 branch por worktree                               |

---

## Métricas de Sucesso do Workflow

| Métrica                                   | Alvo               |
| ----------------------------------------- | ------------------ |
| Tempo médio de feedback do auditor        | <10 min por branch |
| % de findings críticos resolvidos em <24h | >90%               |
| Worktrees abertas simultaneamente         | 2-4 (sweet spot)   |
| Tasks completadas em paralelo por dia     | 3-6                |
