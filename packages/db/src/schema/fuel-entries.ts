import {
  bigint,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

import { FUEL_TYPES } from '@motofinance/shared/constants';

import { profiles } from './profiles';
import { vehicles } from './vehicles';

export const fuelTypeEnum = pgEnum(
  'fuel_type',
  FUEL_TYPES.map((f) => f.id) as unknown as [string, ...string[]]
);

export const fuelEntries = pgTable(
  'fuel_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    vehicleId: uuid('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    fuelType: fuelTypeEnum('fuel_type').notNull(),
    liters: numeric('liters', { precision: 8, scale: 3 }).notNull(),
    totalCents: bigint('total_cents', { mode: 'bigint' }).notNull(),
    odometerKm: integer('odometer_km').notNull(),
    filledAt: timestamp('filled_at', { withTimezone: true }).notNull(),
    clientId: uuid('client_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
  },
  (t) => ({
    filledAtIdx: index('fuel_entries_user_filled_at_idx').on(t.userId, t.filledAt.desc()),
    vehicleOdoIdx: index('fuel_entries_vehicle_odometer_idx').on(t.vehicleId, t.odometerKm),
    clientIdUniq: uniqueIndex('fuel_entries_user_client_id_uniq').on(t.userId, t.clientId)
  })
);

export type FuelEntry = typeof fuelEntries.$inferSelect;
export type InsertFuelEntry = typeof fuelEntries.$inferInsert;
