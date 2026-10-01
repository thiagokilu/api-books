ALTER TABLE "books"
  ADD COLUMN IF NOT EXISTS "subtitle" varchar(500),
  ADD COLUMN IF NOT EXISTS "publisher" varchar(500),
  ADD COLUMN IF NOT EXISTS "language" varchar(50),
  ADD COLUMN IF NOT EXISTS "published_date" varchar(50),
  ADD COLUMN IF NOT EXISTS "published_year" integer,
  ADD COLUMN IF NOT EXISTS "categories" text[],
  ADD COLUMN IF NOT EXISTS "isbn" varchar(50),
  ADD COLUMN IF NOT EXISTS "info_link" varchar(1000);
