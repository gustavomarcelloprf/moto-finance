DO $$ BEGIN
 CREATE TYPE "public"."fuel_type" AS ENUM('gasoline', 'ethanol', 'diesel', 'gnv');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fuel_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"fuel_type" "fuel_type" NOT NULL,
	"liters" numeric(8, 3) NOT NULL,
	"total_cents" bigint NOT NULL,
	"odometer_km" integer NOT NULL,
	"filled_at" timestamp with time zone NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fuel_entries_user_filled_at_idx" ON "fuel_entries" USING btree ("user_id","filled_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fuel_entries_vehicle_odometer_idx" ON "fuel_entries" USING btree ("vehicle_id","odometer_km");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "fuel_entries_user_client_id_uniq" ON "fuel_entries" USING btree ("user_id","client_id");
--> statement-breakpoint
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_liters_positive" CHECK ("liters" > 0);
--> statement-breakpoint
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_total_cents_positive" CHECK ("total_cents" > 0);
--> statement-breakpoint
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_odometer_km_positive" CHECK ("odometer_km" > 0);
--> statement-breakpoint
-- ============================================================================
-- RLS + updated_at trigger (T-043)
-- ============================================================================
ALTER TABLE "fuel_entries" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "owner_only" ON "fuel_entries"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE TRIGGER set_timestamp_fuel_entries
  BEFORE UPDATE ON "fuel_entries"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
--> statement-breakpoint
-- ============================================================================
-- View derivada: fuel_entries_derived
-- Ref: docs/ARCHITECTURE.md > AGENT-SECTION: data-model (fuel_entries Derivados)
--
-- Calcula price_per_liter_cents, km_since_last_fill, kml e cost_per_km_cents
-- por veículo via window function LAG ordenada por filled_at.
-- O primeiro abastecimento de cada veículo terá kml = NULL e
-- cost_per_km_cents = NULL (sem leitura anterior).
--
-- security_invoker=true faz a view respeitar a RLS owner_only de fuel_entries
-- ao ser consultada por usuários autenticados via Supabase.
-- ============================================================================
CREATE OR REPLACE VIEW "fuel_entries_derived"
WITH (security_invoker = true) AS
SELECT
  f.id,
  f.user_id,
  f.vehicle_id,
  f.fuel_type,
  f.liters,
  f.total_cents,
  f.odometer_km,
  f.filled_at,
  f.created_at,
  f.updated_at,
  (f.total_cents::numeric / f.liters)::bigint AS price_per_liter_cents,
  (f.odometer_km - LAG(f.odometer_km) OVER (
    PARTITION BY f.vehicle_id ORDER BY f.filled_at
  )) AS km_since_last_fill,
  CASE
    WHEN (f.odometer_km - LAG(f.odometer_km) OVER (
      PARTITION BY f.vehicle_id ORDER BY f.filled_at
    )) > 0
    THEN (f.odometer_km - LAG(f.odometer_km) OVER (
      PARTITION BY f.vehicle_id ORDER BY f.filled_at
    ))::numeric / f.liters
    ELSE NULL
  END AS kml,
  CASE
    WHEN (f.odometer_km - LAG(f.odometer_km) OVER (
      PARTITION BY f.vehicle_id ORDER BY f.filled_at
    )) > 0
    THEN (f.total_cents::numeric / (f.odometer_km - LAG(f.odometer_km) OVER (
      PARTITION BY f.vehicle_id ORDER BY f.filled_at
    )))::bigint
    ELSE NULL
  END AS cost_per_km_cents
FROM "fuel_entries" f
WHERE f.deleted_at IS NULL;