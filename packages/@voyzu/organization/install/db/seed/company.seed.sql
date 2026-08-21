WITH seed (organization_code, code, name, country_code, base_currency_code, tax_filing_anchor_month, tax_filing_interval_months, use_organization_standard_settings, is_template, status) AS (
  VALUES
    ('ORG-MAIN', 'TEMPLATE', 'Company Defaults', 'NZ', 'NZD', 3, 2, TRUE, TRUE, 'ACTIVE')
)
INSERT INTO company (
  organization_id, code, name, country_code, base_currency_code,
  tax_filing_anchor_month, tax_filing_interval_months,
  use_organization_standard_settings, is_template, status,
  creation_actor_type, updated_actor_type
)
SELECT o.id, s.code, s.name, s.country_code, s.base_currency_code,
  s.tax_filing_anchor_month, s.tax_filing_interval_months,
  s.use_organization_standard_settings, s.is_template, s.status,
  'SYSTEM', 'SYSTEM'
FROM seed s
JOIN organization o ON o.code = s.organization_code
ON CONFLICT (code) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  country_code = EXCLUDED.country_code,
  base_currency_code = EXCLUDED.base_currency_code,
  tax_filing_anchor_month = EXCLUDED.tax_filing_anchor_month,
  tax_filing_interval_months = EXCLUDED.tax_filing_interval_months,
  use_organization_standard_settings = EXCLUDED.use_organization_standard_settings,
  is_template = EXCLUDED.is_template,
  status = EXCLUDED.status,
  updated_date = NOW(),
  updated_actor_type = 'SYSTEM';
