DO $$ BEGIN
 CREATE TYPE "public"."expense_category" AS ENUM('food', 'maintenance', 'tolls', 'tires', 'oil', 'brakes', 'insurance', 'tax', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "expense_category" NOT NULL,
	"amount_cents" bigint NOT NULL,
	"description" text,
	"spent_at" timestamp with time zone NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_user_spent_at_idx" ON "expenses" USING btree ("user_id","spent_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "expenses_user_client_id_uniq" ON "expenses" USING btree ("user_id","client_id");
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_amount_cents_nonneg" CHECK ("amount_cents" >= 0);
--> statement-breakpoint
-- ============================================================================
-- RLS + updated_at trigger (T-036)
-- ============================================================================
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "owner_only" ON "expenses"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE TRIGGER set_timestamp_expenses
  BEFORE UPDATE ON "expenses"
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();