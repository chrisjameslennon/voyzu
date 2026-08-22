DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'iso_country_code'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN iso_country_code AS TEXT
      CONSTRAINT iso_country_code_format CHECK (VALUE ~ '^[A-Z]{2}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'iso_currency_code'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN iso_currency_code AS TEXT
      CONSTRAINT iso_currency_code_format CHECK (VALUE ~ '^[A-Z]{3}$');
  END IF;
END
$$;
