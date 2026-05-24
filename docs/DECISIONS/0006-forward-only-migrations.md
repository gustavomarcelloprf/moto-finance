---
adr: 0006
title: Migrations forward-only (sem down-migrations)
date: 2026-05-22
status: accepted
deciders: [owner]
supersedes: []
superseded_by: []
---

# ADR-0006 — Migrations forward-only

## Contexto

`drizzle-kit` 0.25 (versão atual do projeto) **não gera down-migrations automaticamente**. Cada `pnpm db:generate` produz somente o arquivo `.sql` forward (CREATE/ALTER); nenhum `.down.sql` é criado.

Isso entra em tensão direta com o princípio do `agent_db` declarado em `docs/AGENTS.md > AGENT-SECTION: agent_db`:

> "Migrations sempre **reversíveis** (`up` + `down`)."

A questão precisa ser resolvida antes que o time consolide o padrão e descubra a tensão em produção.

## Decisão

**Adotar migrations forward-only**. O princípio de reversibilidade em `AGENTS.md` será revisado para refletir esta decisão.

Regras operacionais:

1. **Não escrever `.down.sql` manualmente.** A complexidade de manter rollback scripts confiáveis (especialmente com transformações de dados) excede o valor que entregam num MVP de 90 dias com 1 dev.
2. **Rollback se necessário = nova migration forward.** Se uma mudança precisa ser revertida em produção, escreve-se uma nova migration que desfaz o efeito (drop coluna, drop tabela, etc.), sempre com cuidado para preservar dados.
3. **Antes de cada migration crítica** (renomeação de coluna, drop, mudança de tipo), o `agent_db` faz:
   - Backup do schema atual (`pg_dump --schema-only`).
   - Análise de impacto em `docs/runbooks/migrations.md` (a criar quando necessário).
   - Plano de rollback FORWARD documentado no PR.
4. **Em produção (M2+)**, toda migration roda dentro de um `BEGIN ... COMMIT` quando possível. Se falhar, Postgres reverte automaticamente.

## Alternativas Consideradas

| Alternativa                                                     | Por que descartada                                                                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escrever `.down.sql` manualmente para cada migration            | Custo alto + risco de drift entre `up` e `down`. Em produção real, raramente se executa rollback puro — geralmente se faz nova migration corrigindo o problema. |
| Trocar Drizzle por outro tool com rollback (Prisma, Knex, etc.) | Drizzle é escolha consolidada via ADR-0001. Custo de troca > benefício.                                                                                         |
| Esperar Drizzle implementar down-migrations                     | Não há roadmap público. Bloqueio indefinido.                                                                                                                    |
| Adotar tool híbrido (`sqitch`, `goose`) ao lado do Drizzle      | Adiciona ferramenta extra, scripts paralelos, complexidade operacional. Não justifica num MVP.                                                                  |

## Consequências

### Positivas

- **Velocidade**: zero tempo gasto escrevendo/testando down-migrations.
- **Clareza**: cada migration é uma operação no histórico, irreversível por design — mesmo padrão de produção PostgreSQL maduro (Stripe, GitHub, etc.).
- **Compatível com a stack**: aproveita 100% do que Drizzle gera.

### Negativas / Trade-offs

- **Sem comando "voltar uma versão"**: se uma migration foi aplicada errada localmente, precisa de `DROP TABLE` manual ou reset do DB de dev.
- **Risco em produção**: migration ruim em prod exige migration corretiva (não reversão), o que pode requerer mais tempo de remediação.

### Mitigações

- **DB local descartável**: usar Supabase free tier separado para dev. Resetar via `supabase db reset` quando necessário.
- **Migrations pequenas e atômicas**: nunca combinar múltiplas mudanças num arquivo. Cada migration faz UMA coisa.
- **Testes de migration em CI (M2+)**: aplicar migration nova num DB efêmero antes de merge.
- **Snapshots Drizzle (`__journal__.json`)**: mantém histórico de schemas — útil para auditar drift.

### Riscos a Monitorar

- Equipe maior (M2+) pode querer rollback rápido — reavaliar.
- Bugs de produção que exigem reversão imediata — considerar feature flags como mitigação preferencial sobre rollback de schema.

## Atualização em `AGENTS.md`

O princípio "Migrations sempre reversíveis (`up` + `down`)" em `AGENTS.md > AGENT-SECTION: agent_db` deve ser substituído por:

> "Migrations são forward-only (ver ADR-0006). Rollback, quando necessário, é feito via nova migration corretiva."

Esta substituição entra em um commit `chore(docs): align agent_db migrations principle with ADR-0006` separado.

## Revisitar quando

- Drizzle 1.0+ introduzir geração automática de down-migrations.
- Time crescer para ≥3 engenheiros e o custo cognitivo do "nunca reverter" pesar.
- Incidente de produção exigir rollback que uma migration corretiva não consegue resolver rápido o suficiente.
