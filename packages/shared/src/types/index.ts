/**
 * Tipos compartilhados entre client e server.
 * Tipos derivados de schemas Drizzle ficam em @motofinance/db.
 */

export type Money = {
  /** Valor em centavos (bigint serializado como number para envio JSON). */
  cents: number;
  /** Moeda — sempre BRL no MVP. */
  currency: 'BRL';
};

export const money = (cents: number): Money => ({ cents, currency: 'BRL' });

export type DateRange = {
  from: Date;
  to: Date;
};

export type DashboardSummary = {
  grossCents: number;
  costsCents: number;
  netCents: number;
  fuelCents: number;
  expensesCents: number;
  earningsCount: number;
  topPlatform: string | null;
};
