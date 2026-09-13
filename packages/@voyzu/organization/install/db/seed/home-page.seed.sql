INSERT INTO voyzu_settings (code, value)
VALUES ('HOME_PAGE_ROUTE', '/organization/organizations')
ON CONFLICT (code) DO NOTHING;
