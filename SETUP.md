# SETUP.md — Primeira execução

Guia para subir o projeto pela primeira vez na sua máquina local.

## Pré-requisitos

| Ferramenta | Versão   | Como instalar                                             |
| ---------- | -------- | --------------------------------------------------------- |
| Node.js    | ≥20.10.0 | [nodejs.org](https://nodejs.org) ou `nvm install 20.10.0` |
| pnpm       | ≥9.0.0   | `npm install -g pnpm`                                     |
| Git        | qualquer | já vem no macOS/Linux                                     |

> Use `.nvmrc` na raiz: `nvm use` para travar versão correta.

## Passo 1 — Clonar e instalar

```bash
git clone <seu-repo> motofinance
cd motofinance
pnpm install
```

## Passo 2 — Criar projeto Supabase (free tier)

1. Criar conta em https://supabase.com
2. New Project → nome `motofinance-dev` → região `South America (São Paulo)` → criar
3. Aguardar ~2 minutos
4. Em **Settings → API**, copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` (clique em "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`
5. Em **Settings → Database**, copiar **Connection string** (Transaction pooler):
   - Substituir `[YOUR-PASSWORD]` pela senha definida
   - Colar em `DATABASE_URL` (porta 6543)
   - Colar a versão direct (porta 5432) em `DATABASE_DIRECT_URL`

## Passo 3 — Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Editar .env.local com os valores acima
```

Em M1 só precisa das variáveis `SUPABASE` e `DATABASE`. As demais (Asaas, OneSignal, Sentry, PostHog) entram em M2.

## Passo 4 — Rodar em dev

```bash
pnpm dev
```

Abrir http://localhost:3000 — deve aparecer a tela placeholder do MotoFinance.

## Passo 5 — Configurar hooks de commit

```bash
pnpm prepare    # instala husky (roda automaticamente no install, mas garante)
```

Testar:

```bash
echo "test" > test.txt
git add test.txt
git commit -m "mensagem ruim"   # deve FALHAR (commitlint)
git commit -m "chore(infra): teste de hook"   # deve PASSAR
rm test.txt
```

## Passo 6 — Verificar tudo

```bash
pnpm typecheck    # deve passar sem erros
pnpm lint         # deve passar
pnpm format:check # deve passar
```

## Próximos passos

Próxima task no backlog: ver [`docs/TASKS.md`](./docs/TASKS.md).
Após T-001..T-005 concluídas, próximo é **T-006: criar projeto Supabase** (você acabou de fazer) e **T-007: configurar Drizzle**.

## Troubleshooting

**`pnpm: command not found`**
→ Instalar pnpm: `npm install -g pnpm` ou via [pnpm.io/installation](https://pnpm.io/installation).

**Erro `DATABASE_URL not set`**
→ `.env.local` está faltando ou não tem `DATABASE_URL`. Ver Passo 2.

**`next dev` falha com erro de TypeScript**
→ Rodar `pnpm install` novamente, depois `pnpm typecheck` para ver erros específicos.

**Husky não roda nos commits**
→ `pnpm prepare` + garantir que `.husky/commit-msg` tem permissão de execução (`chmod +x .husky/*`).
