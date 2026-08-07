DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'active_status'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN active_status AS TEXT
      NOT NULL
      DEFAULT 'ACTIVE'
      CONSTRAINT active_status_allowed
      CHECK (VALUE IN ('ACTIVE', 'INACTIVE'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'business_code'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN business_code AS TEXT
      NOT NULL
      CONSTRAINT business_code_format
      CHECK (VALUE ~ '^[A-Z0-9_-]+$')
      CONSTRAINT business_code_len
      CHECK (length(VALUE) BETWEEN 1 AND 40)
      CONSTRAINT business_code_trim
      CHECK (VALUE = btrim(VALUE));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'display_name'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN display_name AS TEXT
      CONSTRAINT display_name_len
      CHECK (length(VALUE) BETWEEN 1 AND 50)
      CONSTRAINT display_name_trim
      CHECK (VALUE = btrim(VALUE));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'description_text'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN description_text AS TEXT
      CONSTRAINT description_text_len
      CHECK (length(VALUE) <= 200)
      CONSTRAINT description_text_trim
      CHECK (VALUE = btrim(VALUE));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'audit_timestamp'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN audit_timestamp AS TIMESTAMPTZ
      NOT NULL
      DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'actor_type'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN actor_type AS TEXT
      CONSTRAINT actor_type_allowed
      CHECK (VALUE IN ('APP', 'API', 'SYSTEM'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'jsonb_object'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE DOMAIN jsonb_object AS JSONB
      CONSTRAINT jsonb_object_only
      CHECK (jsonb_typeof(VALUE) = 'object');
  END IF;
END
$$;
