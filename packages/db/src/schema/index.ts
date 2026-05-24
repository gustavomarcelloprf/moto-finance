/**
 * Drizzle schema — barrel export.
 *
 * Tabelas adicionadas progressivamente:
 *   - T-011: profiles.ts, vehicles.ts ✅
 *   - T-028: earnings.ts
 *   - T-036: expenses.ts
 *   - T-043: fuel_entries.ts
 *   - T-083: subscriptions.ts
 *   - T-137: goals.ts
 *   - T-145: maintenance_logs.ts
 *
 * Ver: docs/ARCHITECTURE.md > AGENT-SECTION: data-model
 */

export * from './profiles';
export * from './vehicles';
export * from './earnings';
