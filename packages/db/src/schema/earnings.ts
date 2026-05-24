import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

import { PLATFORMS, SHIFTS } from '@motofinance/shared/constants';

import { profiles } from './profiles';

export const platformEnum = pgEnum(
  'platform',
  PLATFORMS.map((p) => p.id) as unknown as [string, ...string[]]
);

export const shiftEnum = pgEnum(
  'shift',
  SHIFTS.map((s) => s.id) as unknown as [string, ...string[]]
);

export const earnings = pgTable(
  'earnings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    platform: platformEnum('platform').notNull(),
    amountCents: bigint('amount_cents', { mode: 'bigint' }).notNull(),
    earnedAt: timestamp('earned_at', { withTimezone: true }).notNull(),
    shift: shiftEnum('shift').notNull(),
    note: text('note'),
    clientId: uuid('client_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
  },
  (t) => ({
    earnedAtIdx: index('earnings_user_earned_at_idx').on(t.userId, t.earnedAt.desc()),
    clientIdUniq: uniqueIndex('earnings_user_client_id_uniq').on(t.userId, t.clientId)
  })
);

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;
