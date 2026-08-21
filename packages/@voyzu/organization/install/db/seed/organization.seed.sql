INSERT INTO organization (code, organization_name, status, creation_actor_type, updated_actor_type)
VALUES
  ('ORG-MAIN', 'Default Organization', 'ACTIVE', 'SYSTEM', 'SYSTEM')
ON CONFLICT (code) DO UPDATE
SET
    organization_name = EXCLUDED.organization_name,
    status = EXCLUDED.status,
    updated_date = NOW(),
    updated_actor_type = 'SYSTEM';
