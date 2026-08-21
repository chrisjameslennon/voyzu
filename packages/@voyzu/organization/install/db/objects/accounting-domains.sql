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

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'account_type'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN account_type AS TEXT
      CONSTRAINT account_type_allowed
      CHECK (VALUE IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'dr_cr'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN dr_cr AS TEXT
      CONSTRAINT dr_cr_allowed CHECK (VALUE IN ('DR', 'CR'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'bank_cash_account_type'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN bank_cash_account_type AS TEXT
      CONSTRAINT bank_cash_account_type_allowed
      CHECK (VALUE IN ('BANK', 'CASH', 'OTHER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'money_2dp_pos'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN money_2dp_pos AS NUMERIC(18,2)
      CONSTRAINT money_2dp_pos_nonneg CHECK (VALUE >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'tax_family_code'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN tax_family_code AS TEXT
      CONSTRAINT tax_family_code_allowed CHECK (VALUE IN ('INDIRECT_TAX'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'percentage_decimal'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN percentage_decimal AS NUMERIC(7,5)
      CONSTRAINT percentage_decimal_range CHECK (VALUE >= 0 AND VALUE < 1);
  END IF;
END
$$;
