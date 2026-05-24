'use server';

import { desc, eq } from 'drizzle-orm';

import { db } from '@motofinance/db';
import { profiles, vehicles, type Vehicle } from '@motofinance/db/schema';
import { PLAN_CAPABILITIES, type Plan } from '@motofinance/shared/constants';
import { fail, ok, type Result } from '@motofinance/shared/errors';
import { createVehicleInput } from '@motofinance/shared/validators';

import { createServerClient } from '@/lib/server/supabase';

export async function createVehicle(input: unknown): Promise<Result<Vehicle>> {
  const parsed = createVehicleInput.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION', 'campos inválidos', parsed.error.flatten());
  }

  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return fail('AUTH_REQUIRED', 'sessão expirada');
  }

  const userId = session.user.id;

  try {
    const profileRow = await db
      .select({ plan: profiles.plan })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const planValue = profileRow[0]?.plan as Plan | undefined;
    if (!planValue || !(planValue in PLAN_CAPABILITIES)) {
      return fail('NOT_FOUND', 'perfil não encontrado');
    }

    const limit = PLAN_CAPABILITIES[planValue].multiVehicle;

    const existing = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.userId, userId));

    if (existing.length >= limit) {
      return fail(
        'PLAN_LIMIT',
        `plano atual permite no máximo ${limit} veículo${limit > 1 ? 's' : ''}`
      );
    }

    const insertValues: typeof vehicles.$inferInsert = {
      userId,
      type: parsed.data.type,
      brand: parsed.data.brand,
      model: parsed.data.model,
      year: parsed.data.year,
      odometerInitialKm: parsed.data.odometerInitialKm
    };
    if (parsed.data.plate !== undefined) insertValues.plate = parsed.data.plate;

    const inserted = await db.insert(vehicles).values(insertValues).returning();

    const row = inserted[0];
    if (!row) {
      return fail('INTERNAL', 'falha ao criar veículo');
    }

    return ok(row);
  } catch {
    return fail('INTERNAL', 'falha ao criar veículo');
  }
}

export async function listVehicles(): Promise<Result<Vehicle[]>> {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return fail('AUTH_REQUIRED', 'sessão expirada');
  }

  try {
    const rows = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id))
      .orderBy(desc(vehicles.createdAt));

    return ok(rows);
  } catch {
    return fail('INTERNAL', 'falha ao listar veículos');
  }
}
