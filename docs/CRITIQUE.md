# CRITIQUE.md — Análise Estratégica do MotoFinance

> Documento de referência para decisões de produto, arquitetura e UX.
> Lido por humanos para decisões; lido por IAs para entender o **porquê** das escolhas registradas em `ARCHITECTURE.md` e `ROADMAP.md`.
> Versão: 1.0 · Base: `MotoFinance Especificacao.pdf v1.0 (Maio/2026)`

---

## TL;DR para Agentes de IA

- **MVP em 90 dias é viável SE** (a) stack mudar para PWA + BaaS (Supabase) e (b) Fase 1 absorver o controle de combustível.
- **Pagamento NÃO pode estar na Fase 3** — sem cobrança no D90, não há SaaS, só app.
- **O limite de 30 lançamentos/mês quebra o produto** — converter limite por VOLUME para limite por FEATURE.
- **UX deve ser projetada para "uma mão, sol forte, capacete" — não para escritório.**
- **React Native + NestJS + Redis para 1 dev em 90 dias = irrealista.** Reduzir stack.

---

## Pilar 1 — Escopo do MVP (90 dias)

### Diagnóstico

A divisão em 3 fases mistura prioridade de produto (o que o usuário precisa) com prioridade de engenharia (o que é fácil construir). **A cobrança via assinatura está na Fase 3, o que significa que ao final dos 90 dias o produto não é SaaS — é um app gratuito.**

O **controle de combustível na Fase 2 é o erro de escopo mais grave**. Sem combustível, o "lucro líquido" do dashboard (Fase 1) é falso: combustível é tipicamente 30-45% do custo operacional do entregador. Lançar Fase 1 sem combustível significa lançar um app que mente sobre lucro real.

### Riscos Críticos

1. **Cobrança em Fase 3 → 90 dias sem MRR.** Inverter: Fase 1 deve incluir o pipeline Stripe/Iugu mínimo (paywall + 1 checkout), mesmo que com 1 só plano.
2. **Sem combustível na Fase 1, a proposta de valor "lucro líquido real" é uma mentira do produto.** Churn precoce garantido.
3. **90 dias com React Native + backend custom + auth + push + PDF + pagamentos por 1 dev é irrealista.** Estimativa realista: 150-180 dias. Solução: cortar stack, não cortar escopo.
4. **Manutenção & depreciação são features complexas (modelagem de tabelas de revisão por marca/modelo, regras de alerta).** Fase 3 está correto, mas o roadmap não conta o custo de obter esses dados.

### Quick Wins (cortar/simplificar na Fase 1)

- **Cortar:** gráfico de ganhos por plataforma (substituir por lista simples agrupada). Charts custam tempo e quase ninguém entende em mobile.
- **Cortar:** rentabilidade por hora trabalhada (depende de cronômetro de turno, que não existe ainda).
- **Cortar:** meta diária/semanal com barra de progresso (Fase 2).
- **Cortar:** "futuramente: importação via extrato PDF dos apps" — não escrever isso na Fase 1, é distração.
- **Simplificar:** dashboard = 3 números grandes (Receita, Custo, Lucro) + 1 lista (últimos 7 lançamentos). Pronto.

### Sugestões de Longo Prazo

- Substituir o roadmap por fases nomeadas: **M1 (Validação), M2 (Monetização), M3 (Retenção)** — não "Fase 1, 2, 3". Fase numérica não comunica intent.
- Adotar trunk-based + feature flags para que Fase 2/3 possa ser feature-flag liberada por coorte, não release sequencial.

### Recomendação Final (Pilar 1)

**Re-priorizar assim:**

| Fase         | Renomeada       | Conteúdo                                                                                                                                                |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 (D0-D45)  | **Validação**   | Auth, perfil, registro de ganho, registro de gasto, **registro de combustível com cálculo custo/km**, dashboard simples (3 números + lista), PDF básico |
| M2 (D45-D75) | **Monetização** | Paywall, Stripe/Iugu, trial 30d, limite de features Free, extrato de renda formatado, notificações push                                                 |
| M3 (D75-D90) | **Retenção**    | Metas, alertas de manutenção, dicas personalizadas, ranking de dias                                                                                     |

---

## Pilar 2 — Arquitetura e Stack Tecnológica

### Diagnóstico

A stack sugerida (React Native/Flutter + Node NestJS/Django + Postgres + Redis + Firebase Auth + Stripe + AWS) é **stack de empresa Série A com 4-6 engenheiros**, não de MVP solo em 90 dias. Cada peça custa tempo de integração, debugging, deploy e contas separadas.

Cada peça extra é um **ponto de identidade fragmentada** (Firebase user_id ≠ Postgres user_id) e um **ponto de falha em produção**.

### Riscos Críticos

1. **Firebase Auth + Postgres separados** = 2 fontes de verdade para "quem é o usuário". Bug clássico, todo MVP cai nisso.
2. **NestJS é overkill** para um CRUD com 6 tabelas. Decorators, DI, modules, guards, interceptors — custo de aprendizado e LOC alto para pouco ganho.
3. **Redis no MVP é prematura otimização.** Postgres aguenta sessões, cache, rate-limit até ~10k usuários ativos concorrentes. Adicionar Redis quando for medido como necessário.
4. **AWS sem time de DevOps = sangramento de tempo.** Configurar VPC, RDS, ECS, ALB, IAM, CloudWatch leva semanas que não temos.
5. **React Native + Flutter custam build time, store review, push certs, deep linking.** Para MVP de validação, PWA cobre 95% do uso e publica em 1 hora.

### Quick Wins (stack alternativa proposta)

| Camada                     | Trocar para                                                                                           | Por quê                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend único**         | **Next.js 14 (App Router) + Tailwind + Capacitor (futuro)**                                           | PWA instalável, 1 codebase, deploy em segundos. Capacitor empacota em app store quando atingir tração.                         |
| **Backend**                | **Server Actions + Route Handlers no próprio Next.js**, OU **FastAPI (Python) se preferir separação** | Elimina serviço separado. FastAPI é a alternativa correta a Django/NestJS: ~3x mais rápido, async nativo, OpenAPI auto-gerado. |
| **Banco + Auth + Storage** | **Supabase** (Postgres gerenciado + Auth + Storage + Realtime + RLS)                                  | Elimina Firebase Auth, S3, e ainda dá RLS para isolar dados por usuário. 1 conta, 1 painel.                                    |
| **ORM**                    | **Drizzle ORM** (se Next.js) ou **SQLAlchemy 2.0** (se FastAPI)                                       | Type-safe, migrations versionadas.                                                                                             |
| **Pagamento**              | **Asaas** ou **Iugu** (BR-first com PIX nativo)                                                       | Stripe Brasil tem fricção fiscal. PIX é obrigatório para esse público.                                                         |
| **Push**                   | **OneSignal** ou **Web Push API nativa**                                                              | FCM exige projeto Firebase só pra isso.                                                                                        |
| **Hospedagem**             | **Vercel** (frontend) + **Supabase** (backend/db)                                                     | Zero DevOps. Custo $0-25/mês até 10k MAU.                                                                                      |
| **Observabilidade**        | **Sentry** (erros) + **PostHog** (analytics + feature flags)                                          | Substitui Datadog/Mixpanel em 1 conta.                                                                                         |

**Redução de superfície:** de 8 serviços para 4 (Vercel, Supabase, Asaas, Sentry/PostHog).

### Sugestões de Longo Prazo

- Quando atingir 5k MAU pago, avaliar mover backend para FastAPI standalone (escalabilidade horizontal melhor que Next.js para jobs).
- Redis entra quando: (a) latência de leitura do dashboard >300ms, OU (b) >50 req/s por usuário em horário de pico.
- Migrar para app nativo (Capacitor → React Native) somente após validar retenção D30 >40%.

### Recomendação Final (Pilar 2)

Adotar **Stack Lean Brasil**: `Next.js 14 + Supabase + Asaas + Vercel`. Detalhes em `ARCHITECTURE.md`.

---

## Pilar 3 — UX/UI e Design Contextual (Mobile-First)

### Diagnóstico

O documento descreve funcionalidades, **mas não descreve o contexto físico de uso**. O entregador opera o app:

- Em movimento ou parado por 30-90 segundos entre corridas.
- Com **uma mão** (a outra segura capacete, celular do app de entrega, comida, troco).
- Sob **sol direto** — telas a 200 nits são ilegíveis.
- Frequentemente com **luva** ou mão suja.
- Sob **stress de tempo** (próxima corrida toca a qualquer momento).
- Com **bateria preocupando** (já roda 2-3 apps simultâneos).

Nenhum item das telas atuais reflete isso.

### Riscos Críticos

1. **Forms multi-campo (valor + plataforma + data + turno + descrição) levam 20+ segundos para preencher.** Entregador desiste e a base fica vazia → produto morre por dados ausentes.
2. **Gráficos coloridos em dashboard saturam tela ao sol.** Usuário não consegue ler.
3. **Modal stacks (modal abre modal) quebram fluxo com uma mão.**
4. **Sem modo offline = perde lançamento em túnel/elevador/região ruim.**
5. **Notificações push genéricas treinam o usuário a ignorar.**

### Quick Wins (ergonomia)

- **Touch targets ≥ 56dp** (padrão Material é 48; aqui exige mais).
- **Tipografia base 18px**, números financeiros **28-36px bold**.
- **Contraste WCAG AAA** (7:1), não AA. Modo "alto contraste sol forte" ativável manualmente E automaticamente via sensor de luz (`window.matchMedia('(prefers-contrast: more)')` + `Ambient Light Sensor API` quando disponível).
- **Paleta máxima 4 cores funcionais:** preto/fundo, branco/texto, laranja/ação, verde/receita, vermelho/custo. **NÃO usar paletas degradê, neon, ou ilustrações decorativas.**
- **FAB único de 64dp no canto inferior direito (alcance do polegar destro).** Tap abre 3 atalhos: `+ Ganho`, `+ Gasto`, `+ Combustível`. Esses 3 são os fluxos quentes.
- **Form de Ganho em 1 tela, 2 toques:** (1) digitar valor no teclado numérico nativo, (2) tap em chip de plataforma (iFood/Rappi/Uber/99/Outro), (3) auto-salvar com data=hoje e turno inferido por horário. Total: ~5 segundos.
- **Botão "Encerrar turno"** na home: mostra resumo (ganhou X, gastou Y, lucro Z, melhor app foi W). É o **momento de delight** que vira screenshot no WhatsApp.
- **Offline-first com fila local (IndexedDB).** Sincroniza ao voltar online. Mostrar badge "3 lançamentos pendentes".
- **Voz opcional:** botão de microfone no FAB que aciona Web Speech API: _"Ganhei trinta e cinco no iFood"_ → parser regex extrai valor e plataforma.

### Sugestões de Longo Prazo

- Modo "Em corrida" simplificado: tela bloqueia em 1 botão "Iniciar corrida" / "Finalizar corrida" — registra automaticamente duração e km via GPS.
- Widget de tela inicial Android/iOS (após app nativo): saldo do dia sem abrir o app.
- Atalho do Shortcuts iOS / Tasker Android: "Acabei de ganhar X reais" via comando de voz Siri/Google.

### Recomendação Final (Pilar 3)

Princípios de design a colocar em `ARCHITECTURE.md` como contrato:

1. **3 toques para registrar qualquer evento financeiro.**
2. **Zero modais empilhados.**
3. **Toda informação primária legível ao sol (contraste ≥7:1, fonte ≥18px).**
4. **Funciona offline para os 4 fluxos quentes (ganho/gasto/combustível/dashboard).**

---

## Pilar 4 — Modelo de Negócio, Precificação e Métricas

### Diagnóstico

O modelo freemium está estruturado em **limite de volume (30 lançamentos/mês)** — esse é o vetor errado de fricção. Entregador típico faz 25-45 corridas/dia. Se cada corrida = 1 lançamento, atinge limite em 1 dia útil. Se agregação for por turno (1 lançamento = soma do turno), 30 turnos/mês cobre 30 dias — sem fricção, ninguém converte.

Qualquer regra de volume aqui ou frustra (fricção precoce, abandono antes de virar hábito) ou não converte (limite folgado demais).

### Riscos Críticos

1. **Limite por volume é hostil ao hábito.** Entregador que abandona nos primeiros 7 dias não volta — não atinge nem D30 retenção.
2. **R$14,90/mês para classe C/D em renda volátil é desafiador.** Não é proibitivo, mas é cancelável no primeiro mês ruim.
3. **Meta de 8-12% conversão em freemium puro é alta** — média de mercado é 2-5%. Atingir 8% exige (a) features pagas com valor claro E (b) gancho emocional forte (status, comprovação de renda).
4. **Meta de 1.000 MAU no 1º mês é otimista sem CAC pago.** Orgânico via grupos de WhatsApp tem taxa de install ~3-8% sobre exposição. Para 1k MAU = ~15-30k impressões qualificadas no primeiro mês.
5. **Churn <5% mensal é meta de SaaS B2B madura.** Para B2C de renda volátil, churn realista é 10-15% mensal nos primeiros 6 meses.

### Quick Wins

- **Trocar limite por volume → limite por FEATURE:**
  - **Free:** ganho/gasto/combustível ilimitados, dashboard do mês atual apenas, sem PDF, sem extrato, sem alertas.
  - **Pro (R$14,90):** histórico ilimitado, PDF, extrato de renda, alertas de manutenção, comparativo entre meses.
  - **Premium (R$24,90):** múltiplas motos, suporte prioritário, IA insights ("você gasta 12% mais em combustível que a média de SP").
- **Adicionar plano anual:** R$99/ano (= R$8,25/mês, 44% off). Aumenta LTV e reduz churn — entregador paga 1 dia ruim de trabalho e fica 12 meses.
- **PIX único de R$2,90/semana** como opção (cobrança via Asaas QR Code). Reduz fricção de cartão de crédito que muitos não têm.
- **Extrato de renda em PDF é o gancho de conversão #1.** Posicionar Pro como _"a forma de comprovar renda pra financiar uma moto nova"_, não como _"plano com mais features"_.

### Sugestões de Longo Prazo

- **Anti-churn:**
  - Notificação de "fim de turno" inteligente: aciona quando GPS detecta parada >20min após >2h de movimento. Lembra de fechar o dia.
  - **Streak de dias registrados** (gamificação leve). Quebrar streak dispara CRM de retenção.
  - **Comparativo com média da cidade** (anonimizado): "Você ganha 14% mais que motoboys de Campinas nos sábados". Vira screenshot orgânico.
  - **Feature "comprovação automatizada"**: convênio com 1-2 fintechs/financeiras (Mercado Pago Crédito, Will Bank) para autenticar extrato via API → motoboy aceita oferta de crédito sem papel.
- **Métricas alternativas mais úteis que MAU:**
  - **WAU** (semanal): mais relevante para hábito.
  - **% usuários com ≥10 lançamentos no mês**: indicador de adoção real.
  - **Tempo até primeiro lançamento de combustível**: principal preditor de retenção D30.
  - **NPS por coorte de plataforma de origem** (iFood vs Rappi vs Direto).

### Recomendação Final (Pilar 4)

- Plano Pro com **trial de 14 dias** (não 30 — psicologia de urgência), gatilho na 1ª geração de PDF.
- Plano anual obrigatório em destaque.
- Limites por feature, NUNCA por volume.
- Metas iniciais recalibradas: **300 MAU mês 1**, **1.500 MAU mês 3**, **5.000 MAU mês 6**, **conversão 4-6%**, **churn D90 <12%**.

---

## Pilar 5 — Estrutura de Contexto para Engenharia Baseada em IA

### Diagnóstico

Para que agentes de IA (Claude Code, Cursor, MCPs) operem autonomamente e com mínimo gasto de tokens, o repositório precisa de **Single Source of Truth** legível por máquina e por humanos. A estrutura deve responder a 4 perguntas que toda IA faz ao abrir o repo:

1. **O que estou construindo?** → `ROADMAP.md`
2. **Como devo construir?** → `ARCHITECTURE.md`
3. **Quem eu sou e o que posso fazer?** → `AGENTS.md`
4. **O que faço agora?** → `TASKS.md`

### Princípios de Design dos `.md`

- **Densidade > prosa.** Tabelas, listas, blocos de código. Evitar parágrafos explicativos longos.
- **IDs estáveis.** Toda tarefa, tabela, endpoint, agente tem ID curto que não muda (`T-001`, `tbl_earning`, `EP-earnings-create`, `agent_backend`).
- **Cross-referências por ID, nunca por nome longo.**
- **Status machine-readable.** `status: pending|in_progress|blocked|completed` em frontmatter YAML quando possível.
- **Frontmatter no topo de cada arquivo** com `version`, `last_updated`, `owner`.
- **Append-only quando possível.** IA pode adicionar; modificar exige diff explícito.
- **Sem ambiguidade.** Cada regra de negócio tem 1 lugar canônico — duplicar é proibido.

### Estrutura Recomendada do Repositório

```
motofinance/
├── README.md                  # Ponto de entrada — onde ler o quê
├── docs/
│   ├── ROADMAP.md             # Marcos, fases, dependências, status
│   ├── ARCHITECTURE.md        # Padrões, stack, ER, contratos de API
│   ├── AGENTS.md              # Personas de IA, regras, restrições
│   ├── TASKS.md               # Backlog atômico, status, owners
│   ├── DECISIONS/             # ADRs (Architecture Decision Records)
│   │   ├── 0001-stack-lean-brasil.md
│   │   └── ...
│   └── prompts/               # Prompts reutilizáveis para agentes
│       ├── new-endpoint.md
│       └── new-screen.md
├── apps/
│   ├── web/                   # Next.js
│   └── mobile-wrap/           # Capacitor (futuro)
├── packages/
│   ├── db/                    # Schema Drizzle + migrations
│   ├── ui/                    # Componentes shadcn customizados
│   └── shared/                # Tipos, validators (zod), constants
└── .claude/
    └── settings.json          # Permissões e MCPs habilitados
```

### Conteúdo Essencial por Arquivo

| Arquivo           | Função principal            | O que IA encontra aqui                          |
| ----------------- | --------------------------- | ----------------------------------------------- |
| `README.md`       | Roteador da SSOT            | Qual arquivo abrir para qual pergunta           |
| `ROADMAP.md`      | Visão temporal              | Em qual milestone estamos, o que está bloqueado |
| `ARCHITECTURE.md` | Regras de escrita de código | Stack, padrões, schema, contratos               |
| `AGENTS.md`       | Identidade e escopo da IA   | Quem ela é, o que pode tocar                    |
| `TASKS.md`        | Próxima ação concreta       | A unidade atômica de trabalho                   |
| `DECISIONS/*.md`  | Memória institucional       | Por que escolhemos X em vez de Y                |

(Conteúdo detalhado nos respectivos arquivos.)

### Riscos Críticos

1. **Sem IDs estáveis, IA reescreve tarefas já feitas.**
2. **Sem `AGENTS.md`, IA toca arquivos fora do escopo (ex.: muda schema do banco quando deveria só ajustar UI).**
3. **Sem ADRs, IA reabre decisões já resolvidas a cada nova sessão.**
4. **Documentação em texto livre consome 5-10x mais tokens** que tabelas estruturadas. Tabela com 10 linhas substitui 2 páginas de prosa.

### Quick Wins

- Manter cada `.md` abaixo de 400 linhas (limite de contexto por leitura).
- Usar `<!-- AGENT-SECTION: id -->` como âncoras para IAs lerem trechos específicos.
- Versionar TASKS.md por sprint (TASKS-M1.md, TASKS-M2.md) quando exceder 100 itens.

### Sugestões de Longo Prazo

- Adicionar MCP customizado para o repo que expõe `getTask`, `updateTaskStatus`, `getArchitectureRule` — IA não precisa ler arquivo inteiro.
- CI que valida frontmatter YAML e referências cruzadas (`task T-042 cita endpoint EP-xyz mas EP-xyz não existe`).
- Geração automática de embeddings dos `.md` para RAG, reduzindo carga de contexto.

---

## Síntese Executiva — Top 5 Decisões Críticas

| #   | Decisão                                            | Impacto se ignorada                     |
| --- | -------------------------------------------------- | --------------------------------------- |
| 1   | **Mover combustível para Fase 1 (M1)**             | Lucro líquido é falso → churn no D7     |
| 2   | **Adotar Stack Lean (Next.js + Supabase + Asaas)** | 90 dias viram 180 com a stack original  |
| 3   | **Trocar limite por volume → limite por feature**  | Free frustra antes de virar hábito      |
| 4   | **Mover paywall para M2 (não M3)**                 | 90 dias sem MRR — sem prova de SaaS     |
| 5   | **Adotar SSOT estruturado para agentes de IA**     | Custo de tokens 5-10x maior, retrabalho |

---

## Próximos Artefatos a Produzir

- `ROADMAP.md` — milestones M1/M2/M3 com tarefas top-level.
- `ARCHITECTURE.md` — stack final, schema, contratos API, convenções.
- `AGENTS.md` — definir 5 personas: Backend, Frontend, DB, QA, DevOps.
- `TASKS.md` — backlog atômico (T-001…T-NNN) com IDs estáveis.
- `docs/DECISIONS/0001-stack-lean-brasil.md` — ADR registrando a troca de stack.
