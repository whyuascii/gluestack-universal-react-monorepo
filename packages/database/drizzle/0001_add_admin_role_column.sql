-- Add admin_role column to user table (simplifies admin auth)
-- Replaces is_admin boolean with a role-based text column
ALTER TABLE "user" ADD COLUMN "admin_role" text;--> statement-breakpoint

-- Migrate existing admin users (if any have is_admin = true)
UPDATE "user" SET "admin_role" = 'super_admin' WHERE "is_admin" = true;--> statement-breakpoint

-- Drop the old is_admin column
ALTER TABLE "user" DROP COLUMN IF EXISTS "is_admin";
