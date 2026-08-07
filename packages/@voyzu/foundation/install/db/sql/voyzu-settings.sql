CREATE TABLE IF NOT EXISTS voyzu_settings (
  code TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  CONSTRAINT voyzu_settings_code_not_blank CHECK (length(btrim(code)) > 0)
);

INSERT INTO voyzu_settings (code, value)
VALUES ('HOME_PAGE_ROUTE', '/welcome')
ON CONFLICT (code) DO NOTHING;
