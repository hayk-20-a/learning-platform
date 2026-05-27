ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "email_verify_token" TEXT,
ADD COLUMN IF NOT EXISTS "password_reset_token" TEXT,
ADD COLUMN IF NOT EXISTS "password_reset_expires" TIMESTAMP(3);
