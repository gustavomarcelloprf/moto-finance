---
file: ROADMAP.md
version: 1.1
last_updated: 2026-05-22
owner: product
purpose: Fonte única para milestones, dependências e status de entrega.
read_when: IA precisa decidir o que construir agora ou validar se uma tarefa pertence ao milestone atual.
---

# ROADMAP.md — MotoFinance

## Visão Macro

Janela total: **90 dias corridos** (D0 a D90).
Modelo: 3 milestones sequenciais com **feature flags** para liberar coortes antes do release total.
**Estratégia de deploy:** M1 roda 100% local (Supabase free tier cloud + Next.js em `localhost`). Deploy web público entra em M2. Empacotamento Capacitor para App Store / Play Store entra em M3.

| Milestone | Janela  | Tema                     | Saída                                                                                                                   |
| --------- | ------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **M1**    | D0–D45  | Validação                | App funcional offline-first com fluxos quentes (ganho/gasto/combustível/dashboard) + PDF básico — **rodando localhost** |
| **M2**    | D45–D75 | Monetização + Deploy Web | Paywall + Asaas + trial 14d + extrato formatado + push + **Vercel + Sentry + PostHog em produção**                      |
| **M3**    | D75–D90 | Retenção + Stores        | Metas, alertas manutenção, dicas, comparativos + **Capacitor build iOS/Android + submissão App Store/Play Store**       |

> **Regra:** features marcadas `M3+` não devem ser iniciadas antes do fim de M2, exceto por feature flag desabilitada em produção.
>
> **Sprint S-1 (Discovery)**: omitido a pedido do owner. Risco aceito: hipóteses de produto serão validadas direto via beta fechado com comunidade WhatsApp existente.

---

## Status Global

<!-- AGENT-SECTION: status-global -->

| Campo            | Valor                                                        |
| ---------------- | ------------------------------------------------------------ |
| Milestone atual  | `M1`                                                         |
| Sprint atual     | `S0 (Setup)`                                                 |
| Data de início   | `2026-05-22`                                                 |
| Modo de execução | Solo dev + IA, full-time                                     |
| Próximo gate     | Fim de M1 — beta fechado com 30-50 entregadores via WhatsApp |

---

## M1 — Validação (D0–D45)

### Objetivo

Produto funcional o suficiente para que um motoboy registre o dia inteiro e veja lucro líquido **real** (incluindo combustível). Beta fechado: 30-50 entregadores da comunidade WhatsApp do owner.
**Execução 100% local** — `pnpm dev` em `localhost:3000` + Supabase free tier cloud para DB/Auth.

### Épicos

<!-- AGENT-SECTION: m1-epics -->

| ID        | Épico                                               | Status  | Tasks ref    |
| --------- | --------------------------------------------------- | ------- | ------------ |
| `E-M1-01` | Setup repo + DX local (sem CI/CD ainda)             | pending | T-001..T-008 |
| `E-M1-02` | Auth (Supabase) + onboarding                        | pending | T-011..T-020 |
| `E-M1-03` | Perfil + veículo cadastrado                         | pending | T-021..T-027 |
| `E-M1-04` | Registro de Ganho                                   | pending | T-028..T-035 |
| `E-M1-05` | Registro de Gasto                                   | pending | T-036..T-042 |
| `E-M1-06` | Registro de Combustível + cálculo km/L e R$/km      | pending | T-043..T-052 |
| `E-M1-07` | Dashboard (3 números + lista)                       | pending | T-053..T-060 |
| `E-M1-08` | Offline-first + sync queue                          | pending | T-061..T-068 |
| `E-M1-09` | PDF mensal básico                                   | pending | T-069..T-075 |
| `E-M1-10` | Beta fechado (link local/ngrok ou web) + telemetria | pending | T-076..T-082 |

### Definição de Pronto (DoD M1)

- App roda em `localhost:3000` sem erros, instalável como PWA em Android Chrome.
- 30+ usuários reais convidados via grupo WhatsApp do owner.
- Telemetria capturando: signup, primeiro lançamento, lançamento combustível, abertura dashboard D2 (pode ser PostHog ou tabela `events` interna).
- Tempo de registro de ganho médio <8s (medido).
- Beta acessível via ngrok/localhost.run OU deploy temporário Vercel preview.

### Dependências Externas (a resolver em paralelo)

- ✅ **GitHub repo** — owner está criando agora.
- ⏳ **Conta Supabase** — gratuita, criar em D0 ou D1.
- ⏳ **CNPJ/MEI** — necessário antes de M2 para Asaas (5-15 dias úteis). Sugerido abrir já.
- ⏳ **Domínio motofinance.com.br** — verificar disponibilidade. Necessário a partir de M2.
- ⏳ **Apple Developer ($99/ano)** — necessário em M3. Conta + verificação leva ~7 dias.
- ⏳ **Google Play Console ($25 único)** — necessário em M3. Aprovação ~1-3 dias.

---

## M2 — Monetização + Deploy Web (D45–D75)

### Objetivo

Produto cobra. Trial de 14 dias dispara no primeiro uso. Paywall bloqueia features Pro. PDF de extrato formatado para banco. **Primeiro deploy público em Vercel** com domínio próprio.

### Épicos

<!-- AGENT-SECTION: m2-epics -->

| ID        | Épico                                                    | Status  | Tasks ref                  |
| --------- | -------------------------------------------------------- | ------- | -------------------------- |
| `E-M2-00` | Deploy web (Vercel) + observabilidade (Sentry + PostHog) | pending | T-009, T-010, T-095..T-098 |
| `E-M2-01` | Integração Asaas (assinatura recorrente + PIX)           | pending | T-083..T-094               |
| `E-M2-02` | Lógica de plan gating (Free/Pro)                         | pending | T-099..T-102               |
| `E-M2-03` | Paywall screens + checkout                               | pending | T-103..T-110               |
| `E-M2-04` | Extrato de renda formatado (PDF profissional)            | pending | T-111..T-118               |
| `E-M2-05` | Push notifications (OneSignal Web Push)                  | pending | T-119..T-125               |
| `E-M2-06` | Histórico filtrável + comparativo de meses               | pending | T-126..T-132               |
| `E-M2-07` | Compartilhamento WhatsApp (Web Share API)                | pending | T-133..T-136               |

### Definição de Pronto (DoD M2)

- `app.motofinance.com.br` em produção (Vercel).
- 1 pagamento real concluído end-to-end (PIX e cartão).
- Webhook Asaas processando eventos (assinatura criada, renovada, cancelada, payment_failed).
- 5+ usuários convertidos para Pro em beta.
- Extrato de renda aceito por 1 instituição financeira em teste manual.

### Dependências

- E-M1-09 (PDF básico) precisa estar concluído.
- Documentação fiscal Asaas (CNPJ MotoFinance) deve estar pronta antes de T-085.

---

## M3 — Retenção + App Stores (D75–D90)

### Objetivo

Reduzir churn projetado. Engajar com metas, alertas e insights. Liberar Premium (multi-moto). **Empacotar via Capacitor e submeter para App Store + Play Store.**

### Épicos

<!-- AGENT-SECTION: m3-epics -->

| ID        | Épico                                       | Status  | Tasks ref    |
| --------- | ------------------------------------------- | ------- | ------------ |
| `E-M3-01` | Sistema de metas (mensal/semanal)           | pending | T-137..T-144 |
| `E-M3-02` | Alertas de manutenção (km/tempo)            | pending | T-145..T-152 |
| `E-M3-03` | Dicas personalizadas (regras estáticas v1)  | pending | T-153..T-158 |
| `E-M3-04` | Ranking de melhores dias/horas              | pending | T-159..T-164 |
| `E-M3-05` | Plano Premium + multi-moto                  | pending | T-165..T-172 |
| `E-M3-06` | Streak de dias + push de retenção           | pending | T-173..T-178 |
| `E-M3-07` | **Capacitor wrap + App Store + Play Store** | pending | T-179..T-185 |

### Definição de Pronto (DoD M3)

- Retenção D14 medida em coorte de beta ≥50%.
- Pelo menos 1 alerta de manutenção real disparado.
- Conversão Free→Pro acumulada ≥4% no beta.
- App submetido (em review) na App Store + Play Store.
- Branding final aplicado (substitui placeholder).

---

## Dependências Cruzadas (DAG resumido)

```
E-M1-01 (Setup) ─► E-M1-02 (Auth) ─► E-M1-03 (Perfil) ─┐
                                                        ├─► E-M1-04..06 (Lançamentos)
                                                        │
E-M1-04..06 ─► E-M1-07 (Dashboard) ─► E-M1-08 (Offline) ─► E-M1-09 (PDF) ─► E-M1-10 (Beta local)

E-M1-10 ─► E-M2-00 (Deploy web) ─► E-M2-01 (Asaas) ─► E-M2-02 (Gating) ─► E-M2-03 (Paywall) ─► E-M2-04 (Extrato Pro)
                                                                                                       │
E-M2-05 (Push) paralelo a E-M2-01..04                                                                  │
                                                                                                       ▼
                                                                                       M3 épicos E-M3-01..06
                                                                                                       │
                                                                                                       ▼
                                                                                            E-M3-07 (Stores)
```

---

## Fora de Escopo (Post-90d)

- Importação automática via OCR de extrato dos apps (iFood/Rappi).
- Integração via API oficial das plataformas (não existe API pública).
- Gestão de frota >5 motos.
- Versão React Native standalone (Capacitor cobre stores em M3).
- Tax/MEI assistido.
- Marketplace de serviços (oficinas, seguros).
- CI/CD com GitHub Actions (M1 sem; M2 opcional via Vercel auto-deploy).

---

## Sinalização para Agentes de IA

- Ao iniciar uma tarefa, **ler frontmatter de `TASKS.md`** para encontrar tasks `pending` do épico atual.
- **NÃO** abrir épicos de M2/M3 enquanto M1 não estiver `completed`.
- Se uma tarefa parece pertencer a outro milestone, abrir ADR em `docs/DECISIONS/` em vez de mover unilateralmente.
- Atualizar status do épico aqui somente quando 100% das tasks listadas estiverem `completed`.
- **M1 = sem CI/CD, sem deploy. Tudo local.** Não criar `.github/workflows/` em M1.
