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

Os prompts iniciais de cada persona (`agent_db`, `agent_frontend`, `agent_backend`, `agent_auditor`) são entregues fora deste repositório — gerados pela orquestração humano + IA conforme o sprint atual. **Não devem ser commitados aqui** para evitar duplicação com `AGENTS.md` (fonte de verdade da identidade das personas) e para permitir iteração rápida sem inflar histórico de docs.

A regra é: cada Claude CLI dedicada deve receber, como **primeira mensagem da sessão**:

1. Sua identidade (`agent_<X>`) — referenciar `AGENTS.md > AGENT-SECTION: agent_<X>`.
2. Os arquivos que pode tocar (escopo de escrita).
3. A primeira `T-NNN` a executar de `TASKS.md`.
4. Eventuais dependências (`blocked_by`) a verificar antes de começar.
5. A mensagem de commit a usar quando concluir.

Template canônico em uma frase: _"Você é `agent_<X>`. Leia `AGENTS.md > AGENT-SECTION: agent*<X>`e`AGENTS.md > AGENT-SECTION: universal`. Sua primeira task é `T-NNN`. Antes de mexer em qualquer arquivo, atualize status para `in_progress`em`TASKS.md`. Após concluir, commit `<conventional-commit-message>`e prossiga para a próxima`pending` no seu escopo."*

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
