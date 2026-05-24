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

import { EXPENSE_CATEGORIES } from '@motofinance/shared/constants';

import { profiles } from './profiles';

export const expenseCategoryEnum = pgEnum(
  'expense_category',
  EXPENSE_CATEGORIES.map((c) => c.id) as unknown as [string, ...string[]]
);

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    category: expenseCategoryEnum('category').notNull(),
    amountCents: bigint('amount_cents', { mode: 'bigint' }).notNull(),
    description: text('description'),
    spentAt: timestamp('spent_at', { withTimezone: true }).notNull(),
    clientId: uuid('client_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true })
  },
  (t) => ({
    spentAtIdx: index('expenses_user_spent_at_idx').on(t.userId, t.spentAt.desc()),
    clientIdUniq: uniqueIndex('expenses_user_client_id_uniq').on(t.userId, t.clientId)
  })
);

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
