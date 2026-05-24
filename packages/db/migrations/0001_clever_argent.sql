DO $$ BEGIN
 CREATE TYPE "public"."platform" AS ENUM('ifood', 'rappi', 'ubereats', '99food', 'direct', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."shift" AS ENUM('dawn', 'morning', 'afternoon', 'night');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"amount_cents" bigint NOT NULL,
	"earned_at" timestamp with time zone NOT NULL,
	"shift" "shift" NOT NULL,
	"note" text,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "earnings" ADD CONSTRAINT "earnings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "earnings_user_earned_at_idx" ON "earnings" USING btree ("user_id","earned_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "earnings_user_client_id_uniq" ON "earnings" USING btree ("user_id","client_id");
--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_amount_cents_nonneg" CHECK ("amount_cents" >= 0);
--> statement-breakpoint
-- ============================================================================
-- RLS + updated_at trigger (T-028)
-- ============================================================================
ALTER TABLE "earnings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "owner_only" ON "earnings"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE TRIGGER set_timestamp_earnings
  BEFORE UPDATE ON "earnings"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();