CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY,
	"token" varchar(255) NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_id_users_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE;