-- ============================================================
-- Voyzu Accounting - Core Domains (public schema)
-- ============================================================

-- ----------------------------------------------------------
-- Status (ONLY reusable ACTIVE / INACTIVE, not workflow)
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS active_status CASCADE;
CREATE DOMAIN active_status AS TEXT
  NOT NULL
  DEFAULT 'ACTIVE'
  CONSTRAINT active_status_allowed
  CHECK (VALUE IN ('ACTIVE', 'INACTIVE'));

-- ----------------------------------------------------------
-- Common text primitives
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS business_code CASCADE;
CREATE DOMAIN business_code AS TEXT
  NOT NULL
  CONSTRAINT business_code_format
  CHECK (VALUE ~ '^[A-Z0-9_-]+$')
  CONSTRAINT business_code_len
  CHECK (length(VALUE) BETWEEN 1 AND 40)
  CONSTRAINT business_code_trim
  CHECK (VALUE = btrim(VALUE));

DROP DOMAIN IF EXISTS display_name CASCADE;
CREATE DOMAIN display_name AS TEXT
  CONSTRAINT display_name_len
  CHECK (length(VALUE) BETWEEN 1 AND 50)
  CONSTRAINT display_name_trim
  CHECK (VALUE = btrim(VALUE));

DROP DOMAIN IF EXISTS description_text CASCADE;
CREATE DOMAIN description_text AS TEXT
  CONSTRAINT description_text_len
  CHECK (length(VALUE) <= 200)
  CONSTRAINT description_text_trim
  CHECK (VALUE = btrim(VALUE));

-- ----------------------------------------------------------
-- ISO codes
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS iso_country_code CASCADE;
CREATE DOMAIN iso_country_code AS TEXT
  CONSTRAINT iso_country_code_format
  CHECK (VALUE ~ '^[A-Z]{2}$');

DROP DOMAIN IF EXISTS iso_currency_code CASCADE;
CREATE DOMAIN iso_currency_code AS TEXT
  CONSTRAINT iso_currency_code_format
  CHECK (VALUE ~ '^[A-Z]{3}$');

-- ----------------------------------------------------------
-- Accounting structural enums (DOMAIN-based, non-workflow)
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS account_type CASCADE;
CREATE DOMAIN account_type AS TEXT
  CONSTRAINT account_type_allowed
  CHECK (VALUE IN (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
  ));

DROP DOMAIN IF EXISTS dr_cr CASCADE;
CREATE DOMAIN dr_cr AS TEXT
  CONSTRAINT dr_cr_allowed
  CHECK (VALUE IN ('DR', 'CR'));

DROP DOMAIN IF EXISTS bank_cash_account_type CASCADE;
CREATE DOMAIN bank_cash_account_type AS TEXT
  CONSTRAINT bank_cash_account_type_allowed
  CHECK (VALUE IN ('BANK', 'CASH', 'OTHER'));

DROP DOMAIN IF EXISTS money_2dp_pos CASCADE;
CREATE DOMAIN money_2dp_pos AS NUMERIC(18,2)
  CONSTRAINT money_2dp_pos_nonneg
  CHECK (VALUE >= 0);

-- ----------------------------------------------------------
-- Audit fields
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS audit_timestamp CASCADE;
CREATE DOMAIN audit_timestamp AS TIMESTAMPTZ
  NOT NULL
  DEFAULT NOW();

DROP DOMAIN IF EXISTS actor_type CASCADE;
CREATE DOMAIN actor_type AS TEXT
  CONSTRAINT actor_type_allowed
  CHECK (VALUE IN ('APP', 'API', 'SYSTEM'));

-- ----------------------------------------------------------
-- JSON
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS jsonb_object CASCADE;
CREATE DOMAIN jsonb_object AS JSONB
  CONSTRAINT jsonb_object_only
  CHECK (jsonb_typeof(VALUE) = 'object');

-- ----------------------------------------------------------
-- Tax configuration
-- ----------------------------------------------------------
DROP DOMAIN IF EXISTS tax_family_code CASCADE;
CREATE DOMAIN tax_family_code AS TEXT
  CONSTRAINT tax_family_code_allowed
  CHECK (VALUE IN ('INDIRECT_TAX'));

DROP DOMAIN IF EXISTS percentage_decimal CASCADE;
CREATE DOMAIN percentage_decimal AS NUMERIC(7,5)
  CONSTRAINT percentage_decimal_range
  CHECK (VALUE >= 0 AND VALUE < 1);
