-- Backfill bodyText from legacy body column (pre bodyText/bodyHtml split)
UPDATE "email_messages"
SET "bodyText" = COALESCE("bodyText", "body", '')
WHERE "bodyText" IS NULL;

-- Enforce bodyText presence for stable rendering/parsing.
ALTER TABLE "email_messages" ALTER COLUMN "bodyText" SET DEFAULT '';
ALTER TABLE "email_messages" ALTER COLUMN "bodyText" SET NOT NULL;

-- Drop legacy column now that bodyText/bodyHtml are canonical.
ALTER TABLE "email_messages" DROP COLUMN "body";

