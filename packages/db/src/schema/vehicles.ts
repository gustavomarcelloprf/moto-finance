import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { VEHICLE_TYPES } from '@motofinance/shared/constants';

import { profiles } from './profiles';

export const vehicleTypeEnum = pgEnum(
  'vehicle_type',
  VEHICLE_TYPES.map((v) => v.id) as [string, ...string[]]
);

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  type: vehicleTypeEnum('type').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  plate: text('plate'),
  odometerInitialKm: integer('odometer_initial_km').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
