/**
 * Constants compartilhadas entre client e server.
 * Ver: docs/ARCHITECTURE.md > AGENT-SECTION: data-model
 */

// -----------------------------------------------------------------------------
// Plataformas de entrega
// -----------------------------------------------------------------------------
export const PLATFORMS = [
  { id: 'ifood', label: 'iFood', color: '#EA1D2C' },
  { id: 'rappi', label: 'Rappi', color: '#FF441F' },
  { id: 'ubereats', label: 'Uber Eats', color: '#06C167' },
  { id: '99food', label: '99Food', color: '#FFD600' },
  { id: 'direct', label: 'Direto', color: '#6366F1' },
  { id: 'other', label: 'Outro', color: '#9CA3AF' }
] as const;

export type PlatformId = (typeof PLATFORMS)[number]['id'];

// -----------------------------------------------------------------------------
// Tipos de combustível
// -----------------------------------------------------------------------------
export const FUEL_TYPES = [
  { id: 'gasoline', label: 'Gasolina' },
  { id: 'ethanol', label: 'Etanol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'gnv', label: 'GNV' }
] as const;

export type FuelTypeId = (typeof FUEL_TYPES)[number]['id'];

// -----------------------------------------------------------------------------
// Categorias de gasto (não-combustível)
// -----------------------------------------------------------------------------
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Alimentação', icon: 'utensils' },
  { id: 'maintenance', label: 'Manutenção', icon: 'wrench' },
  { id: 'tolls', label: 'Pedágio', icon: 'circle-dollar-sign' },
  { id: 'tires', label: 'Pneus', icon: 'circle-dot' },
  { id: 'oil', label: 'Óleo', icon: 'droplet' },
  { id: 'brakes', label: 'Freios', icon: 'disc' },
  { id: 'insurance', label: 'Seguro', icon: 'shield' },
  { id: 'tax', label: 'Imposto/Taxa', icon: 'receipt' },
  { id: 'other', label: 'Outro', icon: 'more-horizontal' }
] as const;

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number]['id'];

// -----------------------------------------------------------------------------
// Turnos
// -----------------------------------------------------------------------------
export const SHIFTS = [
  { id: 'dawn', label: 'Madrugada', range: '00:00–05:59' },
  { id: 'morning', label: 'Manhã', range: '06:00–11:59' },
  { id: 'afternoon', label: 'Tarde', range: '12:00–17:59' },
  { id: 'night', label: 'Noite', range: '18:00–23:59' }
] as const;

export type ShiftId = (typeof SHIFTS)[number]['id'];

/**
 * Infere o turno baseado em uma data.
 * Usado quando o usuário registra ganho sem especificar turno.
 */
export function inferShift(date: Date): ShiftId {
  const h = date.getHours();
  if (h < 6) return 'dawn';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'night';
}

// -----------------------------------------------------------------------------
// Tipos de veículo
// -----------------------------------------------------------------------------
export const VEHICLE_TYPES = [
  { id: 'motorcycle', label: 'Moto' },
  { id: 'bicycle', label: 'Bicicleta' },
  { id: 'car', label: 'Carro' }
] as const;

export type VehicleTypeId = (typeof VEHICLE_TYPES)[number]['id'];

// -----------------------------------------------------------------------------
// Planos
// -----------------------------------------------------------------------------
export const PLANS = ['free', 'pro', 'premium'] as const;
export type Plan = (typeof PLANS)[number];

/**
 * Capacidades por plano — fonte única para gating.
 * Ver: docs/ARCHITECTURE.md > AGENT-SECTION: plan-gating
 */
export const PLAN_CAPABILITIES: Record<
  Plan,
  {
    historyMonths: number; // Infinity = sem limite (use Number.POSITIVE_INFINITY)
    pdfExport: boolean;
    extratoRenda: boolean;
    maintenanceAlerts: boolean;
    multiVehicle: number; // quantidade máxima de veículos (1 para free/pro, 5 para premium)
    prioritySupport: boolean;
  }
> = {
  free: {
    historyMonths: 1,
    pdfExport: false,
    extratoRenda: false,
    maintenanceAlerts: false,
    multiVehicle: 1,
    prioritySupport: false
  },
  pro: {
    historyMonths: Number.POSITIVE_INFINITY,
    pdfExport: true,
    extratoRenda: true,
    maintenanceAlerts: true,
    multiVehicle: 1,
    prioritySupport: false
  },
  premium: {
    historyMonths: Number.POSITIVE_INFINITY,
    pdfExport: true,
    extratoRenda: true,
    maintenanceAlerts: true,
    multiVehicle: 5,
    prioritySupport: true
  }
};

export const PLAN_PRICING_CENTS: Record<Plan, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 1490, yearly: 9900 },
  premium: { monthly: 2490, yearly: 19900 }
};

export const TRIAL_DAYS = 14;
