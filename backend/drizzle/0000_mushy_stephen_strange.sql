CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"artist" text,
	"model_url" text NOT NULL,
	"image_url" text NOT NULL,
	"target_index" integer NOT NULL,
	"created_at" timestamp DEFAULT (now() + interval '9 hours') NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"party_size" integer,
	"is_exchanged" boolean DEFAULT false,
	"created_at" timestamp DEFAULT (now() + interval '9 hours') NOT NULL,
	"last_seen" timestamp DEFAULT (now() + interval '9 hours')
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"acquired_at" timestamp DEFAULT (now() + interval '9 hours') NOT NULL,
	CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE("user_id","badge_id")
);
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_badges_target_index" ON "badges" USING btree ("target_index");--> statement-breakpoint
CREATE INDEX "idx_user_badges_user_id" ON "user_badges" USING btree ("user_id");