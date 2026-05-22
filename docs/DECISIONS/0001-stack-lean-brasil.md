---
adr: 0001
title: Adotar Stack Lean Brasil (Next.js + Supabase + Asaas) em vez da stack original do spec
date: 2026-05-22
status: accepted
deciders: [owner]
supersedes: []
superseded_by: []
---

# ADR-0001 — Stack Lean Brasil

## Contexto

O documento `MotoFinance Especificacao.pdf v1.0` sugere a seguinte stack:

- Frontend: React.js + Tailwind (web) + React Native ou Flutter (mobile)
- Backend: Node.js (NestJS) ou Django
- DB: PostgreSQL + Redis
- Auth: Firebase Auth ou Auth0
- Pagamento: Stripe ou Iugu
- Hospedagem: AWS / Railway / Render
- Push: Firebase FCM

A execução é solo dev + IA, full-time, em janela de 90 dias. A stack original é dimensionada para uma equipe Série A (4-6 engenheiros) e tem múltiplos pontos de fricção:

1. **Duas codebases (web + mobile)** custam 2x o tempo de feature, ou exigem React Native completo.
2. **Firebase Auth + Postgres separados** = duas fontes de verdade para `user_id`, bug clássico de MVP.
3. **NestJS** é overkill para CRUD com 6 tabelas (decorators, DI, modules, guards — alto LOC para pouco ganho).
4. **Redis** é prematura otimização: Postgres aguenta sessões/cache/rate-limit até 10k MAU.
5. **AWS sem time DevOps** sangra semanas em VPC/RDS/ECS/IAM.
6. **Stripe no Brasil** tem fricção fiscal e UX ruim com PIX (público classe C/D do entregador).
7. **FCM** exige projeto Firebase só pra push.

## Decisão

Adotar **Stack Lean Brasil**:

| Camada                         | Tecnologia                                                                      | Substitui                     |
| ------------------------------ | ------------------------------------------------------------------------------- | ----------------------------- |
| Frontend único                 | **Next.js 14 (App Router) + Tailwind + shadcn/ui** + Capacitor (M3 para stores) | React + RN/Flutter            |
| Backend                        | **Server Actions + Route Handlers do próprio Next.js**                          | NestJS / Django               |
| DB + Auth + Storage + Realtime | **Supabase** (Postgres gerenciado + RLS + Auth + Storage)                       | Postgres + Firebase Auth + S3 |
| ORM                            | **Drizzle**                                                                     | TypeORM/Prisma                |
| Validação                      | **Zod**                                                                         | class-validator               |
| Pagamento                      | **Asaas** (PIX nativo + cartão + boleto, BR-first)                              | Stripe                        |
| Push                           | **OneSignal Web Push** (M2+)                                                    | Firebase FCM                  |
| Observabilidade                | **Sentry + PostHog** (M2+)                                                      | Datadog / Mixpanel            |
| Hospedagem                     | **localhost (M1)** / **Vercel (M2+)**                                           | AWS / Railway                 |
| App Wrapper                    | **Capacitor** (M3)                                                              | React Native standalone       |

## Alternativas Consideradas

| Alternativa                                      | Por que descartada                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Stack original do spec                           | Inviável em 90 dias solo; superfície operacional 8 serviços vs 4.                                          |
| FastAPI + React separados                        | Adiciona 1 serviço a manter; tipos não compartilhados; mais boilerplate.                                   |
| T3 stack (Next + tRPC + Prisma)                  | Server Actions do Next 14 já cobrem 95% do uso de tRPC; Drizzle mais simples que Prisma para o nosso caso. |
| Remix + Supabase                                 | Equivalente técnico, mas ecossistema Next.js + Vercel é mais maduro para PWA + Capacitor.                  |
| Firebase fullstack (Firestore + Cloud Functions) | NoSQL ruim para queries financeiras agregadas; Firestore custa caro em leituras de dashboard.              |

## Consequências

### Positivas

- **Superfície operacional reduzida** de 8 serviços (AWS+RDS+Firebase+Auth0+Stripe+FCM+Sentry+Mixpanel) para 4 (Vercel+Supabase+Asaas+Sentry/PostHog).
- **Type-safety end-to-end** sem código duplicado (Drizzle → TS → Zod → componentes).
- **RLS no banco** elimina classes inteiras de bugs de autorização.
- **PIX nativo via Asaas** é decisivo para o público (cartão de crédito não é universal entre entregadores).
- **Vercel deploy zero-config** quando entrarmos em M2.
- **Capacitor reusa 100% do PWA** — uma codebase, três distribuições (web, iOS, Android).
- **Custo $0-25/mês** até 10k MAU (Supabase Free + Vercel Hobby + Asaas pay-as-you-go).

### Negativas / Trade-offs

- **Lock-in moderado em Supabase** — se precisar trocar, migração de Auth é trabalhosa (mas o Postgres é portável).
- **Server Actions ainda têm DX rough edges** (debug de erros server-side é menos transparente que API routes tradicionais).
- **Capacitor** introduz uma camada de bridging entre web e nativo — performance pode ser inferior a RN puro em casos extremos (não esperado aqui).
- **PostHog** tem free tier limitado (1M eventos/mês) — pode estourar se rastrearmos muito; configurar sample rate.

### Riscos a Monitorar

- **Quando Server Actions deixam de bastar?** Se precisarmos de jobs em background (>30s), retomar FastAPI standalone (ADR futuro).
- **Asaas vs Stripe BR / Pagar.me / Mercado Pago** — Asaas tem boa UX mas é menos conhecido; validar com 1 transação real cedo (em E-M2-01).
- **Capacitor App Store review** — Apple às vezes rejeita "WebView wrappers". Mitigação: usar plugins nativos para Share, Push, Splash, e expor pelo menos 1 feature exclusiva nativa (push, biometria opcional).

## Revisitar quando

- Atingirmos **≥5.000 usuários pagos** → considerar FastAPI dedicado para jobs/relatórios pesados.
- Latência do dashboard p95 >500ms → introduzir Redis (ADR futuro).
- Apple rejeitar build em App Store por motivo de WebView → considerar React Native standalone (ADR futuro).
- Crescer time para ≥3 engenheiros → reavaliar se monorepo único é suficiente ou splitar serviços.
