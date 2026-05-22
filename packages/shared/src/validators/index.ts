import { z } from 'zod';
import {
  EXPENSE_CATEGORIES,
  FUEL_TYPES,
  PLATFORMS,
  SHIFTS,
  VEHICLE_TYPES
} from '../constants/index.js';

// Helpers
const uuid = z.string().uuid();
const cents = z.number().int().min(0).max(99_999_999); // até R$ 999.999,99
const positiveCents = z.number().int().min(1).max(99_999_999);
const isoDate = z.string().datetime();

// -----------------------------------------------------------------------------
// Earnings (Ganhos)
// -----------------------------------------------------------------------------
const platformEnum = z.enum(PLATFORMS.map((p) => p.id) as [string, ...string[]]);
const shiftEnum = z.enum(SHIFTS.map((s) => s.id) as [string, ...string[]]);

export const createEarningInput = z.object({
  clientId: uuid,
  platform: platformEnum,
  amountCents: positiveCents,
  earnedAt: isoDate,
  shift: shiftEnum.optional(),
  note: z.string().max(500).optional()
});
export type CreateEarningInput = z.infer<typeof createEarningInput>;

export const updateEarningInput = z.object({
  id: uuid,
  platform: platformEnum.optional(),
  amountCents: positiveCents.optional(),
  earnedAt: isoDate.optional(),
  shift: shiftEnum.optional(),
  note: z.string().max(500).nullable().optional()
});
export type UpdateEarningInput = z.infer<typeof updateEarningInput>;

// -----------------------------------------------------------------------------
// Expenses (Gastos)
// -----------------------------------------------------------------------------
const expenseCategoryEnum = z.enum(EXPENSE_CATEGORIES.map((c) => c.id) as [string, ...string[]]);

export const createExpenseInput = z.object({
  clientId: uuid,
  category: expenseCategoryEnum,
  amountCents: positiveCents,
  spentAt: isoDate,
  description: z.string().max(500).optional()
});
export type CreateExpenseInput = z.infer<typeof createExpenseInput>;

// -----------------------------------------------------------------------------
// Fuel entries (Abastecimentos)
// -----------------------------------------------------------------------------
const fuelTypeEnum = z.enum(FUEL_TYPES.map((f) => f.id) as [string, ...string[]]);

export const createFuelEntryInput = z.object({
  clientId: uuid,
  vehicleId: uuid,
  fuelType: fuelTypeEnum,
  liters: z.number().positive().max(200),
  totalCents: positiveCents,
  odometerKm: z.number().int().positive().max(999_999),
  filledAt: isoDate
});
export type CreateFuelEntryInput = z.infer<typeof createFuelEntryInput>;

// -----------------------------------------------------------------------------
// Vehicles
// -----------------------------------------------------------------------------
const vehicleTypeEnum = z.enum(VEHICLE_TYPES.map((v) => v.id) as [string, ...string[]]);

export const createVehicleInput = z.object({
  type: vehicleTypeEnum,
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  year: z
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  plate: z.string().max(10).optional(),
  odometerInitialKm: z.number().int().min(0).max(999_999)
});
export type CreateVehicleInput = z.infer<typeof createVehicleInput>;

// -----------------------------------------------------------------------------
// Profile (onboarding)
// -----------------------------------------------------------------------------
export const updateProfileInput = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Formato E.164 (ex: +5511999999999)')
    .optional(),
  city: z.string().max(80).optional(),
  state: z.string().length(2).optional()
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;

// -----------------------------------------------------------------------------
// Range/Filter helpers
// -----------------------------------------------------------------------------
export const dateRangeInput = z
  .object({
    from: isoDate,
    to: isoDate
  })
  .refine((d) => new Date(d.from) <= new Date(d.to), {
    message: 'from deve ser ≤ to'
  });
export type DateRangeInput = z.infer<typeof dateRangeInput>;

export const summaryRangeInput = z.enum(['today', 'week', 'month']);
export type SummaryRangeInput = z.infer<typeof summaryRangeInput>;
