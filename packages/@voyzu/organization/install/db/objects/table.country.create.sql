CREATE TABLE IF NOT EXISTS country (
    code iso_country_code PRIMARY KEY,
    name display_name NOT NULL,
    currency_code iso_currency_code NOT NULL,
    financial_period_start_month CHAR(3),
    tax_filing_anchor_month INTEGER NOT NULL DEFAULT 3 CHECK (tax_filing_anchor_month BETWEEN 1 AND 12),
    tax_filing_interval_months INTEGER NOT NULL DEFAULT 3 CHECK (tax_filing_interval_months IN (1, 2, 3, 6, 12)),
    status active_status,

    creation_date audit_timestamp,
    creation_actor_type actor_type,
    creation_user_id TEXT,
    creation_mutation_id UUID,

    updated_date audit_timestamp,
    updated_actor_type actor_type,
    updated_user_id TEXT,
    updated_mutation_id UUID,

    deletion_date audit_timestamp,
    deletion_actor_type actor_type,
    deletion_user_id TEXT,
    deletion_mutation_id UUID,

    CONSTRAINT fk_currency FOREIGN KEY (currency_code) REFERENCES currency(code)
);
