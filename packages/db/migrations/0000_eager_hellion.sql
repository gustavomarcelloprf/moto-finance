DO $$ BEGIN
 CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'premium');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vehicle_type" AS ENUM('motorcycle', 'bicycle', 'car');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"city" text NOT NULL,
	"state" varchar(2) NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"plate" text,
	"odometer_initial_km" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- ============================================================================
-- Row-Level Security (RLS) — owner_only policy
-- Ref: docs/ARCHITECTURE.md > AGENT-SECTION: data-model (RLS Policy Padrão)
-- ============================================================================
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "owner_only" ON "profiles"
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
--> statement-breakpoint
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "owner_only" ON "vehicles"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
-- ============================================================================
-- updated_at trigger function (reusable em todas as tabelas com updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON "profiles"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
--> statement-breakpoint
CREATE TRIGGER set_timestamp_vehicles
  BEFORE UPDATE ON "vehicles"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
