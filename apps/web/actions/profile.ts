'use server';

import { eq } from 'drizzle-orm';

import { db } from '@motofinance/db';
import { profiles, type Profile } from '@motofinance/db/schema';
import { fail, ok, type Result } from '@motofinance/shared/errors';
import { updateProfileInput } from '@motofinance/shared/validators';

import { createServerClient } from '@/lib/server/supabase';

export async function updateProfile(input: unknown): Promise<Result<Profile>> {
  const parsed = updateProfileInput.safeParse(input);
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

  const patch: Partial<typeof profiles.$inferInsert> = { updatedAt: new Date() };
  if (parsed.data.fullName !== undefined) patch.fullName = parsed.data.fullName;
  if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone;
  if (parsed.data.city !== undefined) patch.city = parsed.data.city;
  if (parsed.data.state !== undefined) patch.state = parsed.data.state;

  try {
    const updated = await db
      .update(profiles)
      .set(patch)
      .where(eq(profiles.id, session.user.id))
      .returning();

    const row = updated[0];
    if (!row) {
      return fail('NOT_FOUND', 'perfil não encontrado');
    }

    return ok(row);
  } catch {
    return fail('INTERNAL', 'falha ao atualizar perfil');
  }
}
