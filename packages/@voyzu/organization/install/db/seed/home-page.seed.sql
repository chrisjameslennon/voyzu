INSERT INTO application_setting (code, value)
VALUES ('HOME_PAGE_ROUTE', '/organization/companies')
ON CONFLICT (code) DO NOTHING;
